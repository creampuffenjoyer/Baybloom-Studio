# Workspace-local tools

The project is on E: and the system drive is full. Use the wrapper for local work:

```powershell
node scripts/workspace-run.mjs npm test
node scripts/workspace-run.mjs npm run lint
node scripts/workspace-run.mjs node scripts/test-retention.mjs
```

It invokes the installed Node/npm directly without a shell or package download. Child processes inherit workspace-local temporary files, npm cache, optional browser cache and XDG paths under ignored `storage/local-cache/`. Node's optional compile cache and automatic browser downloads are disabled. Existing Chrome can still be used through Playwright's `channel: "chrome"`. Thread pools are limited to two and process priority is lowered when supported.

Each invocation gets a unique temporary directory. After its child exits, the wrapper verifies that directory's absolute path is inside the intended workspace temp directory and removes only that directory. It does not erase the shared npm cache, other runs, system files or project files. Interrupted/hard-killed processes can leave temporary files on E: for later review.

The project-local `.npmrc` also directs npm cache to `storage/local-cache/npm`, disables update notices and retains at most three npm logs. The wrapper removes case-insensitive inherited cache-variable aliases, so an uppercase Windows `NPM_CONFIG_CACHE` cannot override its workspace path. Reusable npm cache is retained to avoid downloading the same packages repeatedly. No user-wide npm configuration, registry setting or machine environment variable is changed. Existing C: cache directories are left alone.

The wrapper supports `node` and `npm`, propagates command failures, and fails if the installed npm CLI cannot be located. It is a convention for tools started through this wrapper, not an operating-system sandbox or a promise about unrelated applications. Use it for agent-run checks rather than launching npm or browser tests with their system defaults.
