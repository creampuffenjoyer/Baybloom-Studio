# Administrative MFA

Administrative accounts use their password plus an RFC 6238 authenticator or one of ten single-use recovery codes. Client credentials and Google login retain their existing behavior. Google cannot create an administrative session: an operator with a Google-only admin account must use email recovery to establish a password, then enroll/sign in through the password flow.

## Release preparation

Apply migration `20261115120000_admin_mfa` using the existing reviewed migration process before releasing this code. It adds only the `MfaCredential` table and a cascading foreign key. The application database has not been migrated by this work. The migration is tested only in the guarded disposable database.

After MFA is enabled, a rollback must retain the MFA authentication guard or temporarily block administrative login. Rolling back to password-only authentication would remove the factor requirement. Keep the additive credential table and key; do not drop them as a routine code rollback.

Set `MFA_ENCRYPTION_KEY` to 32 cryptographically random bytes encoded as standard base64 (44 characters, ending in `=`), independently of `AUTH_SECRET`. Configure it in the runtime secret store, not public variables or source control. This is required for enrollment and authenticator verification. Back up the encryption key separately from the database, retaining the association. Rotating `AUTH_SECRET` signs users out but preserves MFA seeds. Rotating the MFA key requires a controlled decrypt/re-encrypt migration; overwriting or losing it prevents verification. There is no automatic key-rotation or email-based MFA reset endpoint.

Use a strong, private bootstrap administrator password and complete initial enrollment while the host is restricted, before public exposure. Initial pairing necessarily begins with the primary credential; MFA does not retroactively protect an unenrolled account whose password was already compromised.

## Enrollment and sign-in

1. An administrator signs in with email/password. Without an enrolled factor, the resulting session is marked pending and has no administrative role or normal application access. It can open `/account/security`, resend its own verification email and use the MFA management endpoint. Enrollment requires a verified inbox. Older sessions and client accounts later promoted to admin cannot gain administrative access without enrollment and MFA proof.
2. Enter the current password to start setup within ten minutes of signing in. Use manual entry in an authenticator app: SHA-1, six digits, 30-second period. No third-party QR service receives the key. The setup expires after ten minutes and does not enable MFA until its code is confirmed.
3. Save the ten recovery codes shown once after confirmation. They contain 128 random bits each; only account-scoped SHA-256 hashes are stored. Confirmation revokes all current sessions. Wait for a fresh authenticator code before signing in again.
4. At login, open **Administrator verification** and enter a fresh six-digit code or paste an unused recovery code. A successful login receives proof tied to the current MFA version. Role and version are checked again on session reads; an old cookie cannot bypass enrollment or factor replacement.

Future administrative handlers must use the shared data-access/session guard and require the administrative role. The presence of an identity in `auth()` alone is insufficient: pending enrollment intentionally retains only enough identity to complete enrollment and inbox verification.

Accepted authenticator steps are the current 30-second step and one adjacent step in either direction, and must be newer than the last accepted step. Database account-row locks serialize use across workers. Reusing an authenticator step or recovery code fails, including concurrent attempts. Login attempts retain the shared IP/email throttles. Management attempts are limited to ten per account per ten minutes, with origin enforcement, JSON/body limits and private no-store responses.

Session cookies retain the existing Auth.js maximum age of 30 days. Role, factor version and revocation are rechecked on requests; management additionally requires a sign-in within ten minutes. Review the desired administrative session lifetime with the deployment owner before launch.

Password resets never remove MFA. Changing an administrator's password revokes sessions and requires a fresh MFA sign-in. Management operations recheck revocation under the account lock so a request validated before a password reset cannot finish using a revoked session.

## Replacing a device and recovery

On the Security page, provide the current password and a current factor or unused recovery code. The old authenticator remains active until the replacement is confirmed. Confirmation changes the MFA version, replaces all recovery codes and revokes sessions. Starting over only replaces the pending setup; it does not silently disable the active factor.

If the confirmation response is lost after the transaction commits, the newly configured authenticator still works. Sign in with a fresh code and replace the authenticator to issue a new recovery-code set; previously issued plaintext codes cannot be fetched again.

Losing both the authenticator and every recovery code requires a separately reviewed, out-of-band identity-verification process. Password/email recovery alone is insufficient. This application has no automatic administrative MFA removal endpoint. Define who can approve such a recovery before production use; never disable MFA merely because an email reset succeeded. Administrative access is still a role boundary, not a new admin dashboard.

## Validation and practical limits

`npm test` includes RFC test vectors, replay windows, authenticated seed encryption/account binding, missing/wrong keys and recovery-code hashing. `npm run test:mfa` rejects the application database, applies migrations only to the explicitly configured disposable test database, and exercises enrollment, expiry, atomic concurrent recovery, factor replacement, revocation and disabled users. CI includes this guarded test; remote CI execution is not claimed by local results.

`npm run test:security:e2e` includes the administrative enrollment/login/recovery/reset/replacement journey in the isolated production HTTPS harness. Breach-service replies remain local fixtures. Hosted TLS, NTP/clock synchronization, actual authenticator app entry, Google provider behavior, key backup/restore and operator recovery approval still need staging/operations verification. Factor-change email notifications are not implemented. TOTP and recovery codes are phishable; this implementation does not claim passkey/WebAuthn phishing resistance. MFA is mandatory for administrators and is not yet offered to client accounts.

Final local results: 144 regressions, the guarded MFA database suite, twelve production browser scenarios (thirteen tests with the parent), lint, type checking and the standard production build passed. Only the test database received the new migration; no real administrative account was enrolled and no runtime key was provisioned for the application.

During local validation the system drive ran out of space. Tests used `TEMP`, `TMP` and `npm_config_cache` under ignored `storage/security/` on the workspace drive. No system files were removed or global settings changed. A first database connection attempt failed; retrying the guarded connection succeeded. Those environment failures are not counted as passing test runs.

Primary references: [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238) and [OWASP MFA guidance](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html).
