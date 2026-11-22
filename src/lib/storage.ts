import "server-only";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/*
 * Private storage for purchased files (spec §8: private bucket + signed URLs).
 * - With S3_* env vars: Cloudflare R2 / AWS S3, presigned GET URLs.
 * - Without: files under ./storage (never served publicly), with HMAC-signed
 *   links handled by /api/files. Intended for local development only.
 */

const LINK_TTL_SECONDS = 5 * 60;
export const LOCAL_ROOT = path.join(process.cwd(), "storage");
const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const validDigest = (sha256: string) => /^[a-f0-9]{64}$/.test(sha256);

async function atomicLocalArchive(key: string, bytes: Uint8Array) {
  const destination = path.join(LOCAL_ROOT, key);
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, bytes, { flag: "wx" });
    await rename(temporary, destination);
  } finally { await unlink(temporary).catch(() => {}); }
}

/** The database retains the authoritative release. This cache is optional. */
export async function cacheSourceRelease(sha256: string, bytes: Uint8Array) {
  if (!validDigest(sha256) || digest(bytes) !== sha256) throw new Error("Source cache integrity mismatch");
  try { await atomicLocalArchive(`purchases/releases/${sha256}.zip`, bytes); } catch { /* A read-only host can use database fallback. */ }
}

export async function readCachedSourceRelease(sha256: string) {
  if (!validDigest(sha256)) throw new Error("Invalid source digest");
  const bytes = await readFile(path.join(LOCAL_ROOT, "purchases/releases", `${sha256}.zip`)).catch(() => null);
  return bytes && digest(bytes) === sha256 ? bytes : null;
}

/** Immutable, digest-addressed objects make retries safe before DB publication. */
export async function storePurchaseArtifact(bytes: Uint8Array) {
  const sha256 = digest(bytes);
  const key = `purchases/artifacts/${sha256}.zip`;
  const client = s3Client();
  if (client) {
    await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key,
      Body: bytes, ContentType: "application/zip", Metadata: { sha256 },
    }), { abortSignal: AbortSignal.timeout(30_000) });
  } else {
    if (process.env.NODE_ENV === "production") throw new Error("Private S3 storage is required for purchase delivery in production");
    await atomicLocalArchive(key, bytes);
  }
  return { key, sha256 };
}

export function verifyPurchaseArtifact(key: string, bytes: Uint8Array) {
  const match = /^purchases\/artifacts\/([a-f0-9]{64})\.zip$/.exec(key);
  return !key.startsWith("purchases/artifacts/") || !!match && digest(bytes) === match[1];
}

let s3: S3Client | null = null;
function s3Client() {
  const { S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY } = process.env;
  if (!S3_ENDPOINT || !S3_ACCESS_KEY || !S3_SECRET_KEY || !process.env.S3_BUCKET) return null;
  s3 ??= new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: S3_ENDPOINT,
    credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
  });
  return s3;
}

function sign(key: string, exp: number) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", secret).update(`${key}\n${exp}`).digest("base64url");
}

/** A short-lived download URL for a stored object. */
export async function signedDownloadUrl(key: string, filename: string) {
  const client = s3Client();
  if (client) {
    return getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, "")}"`,
      }),
      { expiresIn: LINK_TTL_SECONDS },
    );
  }
  const exp = Math.floor(Date.now() / 1000) + LINK_TTL_SECONDS;
  const qs = new URLSearchParams({ key, exp: String(exp), sig: sign(key, exp), name: filename });
  return `/api/files?${qs}`;
}

/** Validates a local signed link and returns the absolute file path, or null. */
export function verifyLocalLink(key: string, exp: string, sig: string) {
  const expNum = Number(exp);
  if (!key || !Number.isInteger(expNum) || expNum < Date.now() / 1000) return null;
  const expected = Buffer.from(sign(key, expNum));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  const full = path.resolve(LOCAL_ROOT, key);
  // Block path traversal outside the storage root.
  if (!full.startsWith(LOCAL_ROOT + path.sep)) return null;
  return full;
}
