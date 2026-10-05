# Security and privacy

This is a static, single-user browser demo. It has no accounts, backend, shared tenant state, secret keys or telemetry. Local notes, imported text, quiz attempts and trails belong to the current browser origin. Browser storage is not an encrypted vault or a backup.

Treat imported PDFs, URL parameters and locally restored state as untrusted. Render text through React, never raw HTML. Parse PDFs in the on-demand PDF.js worker, without a scripting/annotation viewer. Do not upload imported data or follow embedded links. Enforce documented import limits and surface storage failures before claiming a change was saved.

The deployment must retain CSP, nosniff, no-referrer, frame denial and disabled camera/microphone/location permissions. Source and release artifacts must contain no credentials, private corpora, personal data or local machine paths. Publish only the separate desktop repository. Build outputs and local QA artifacts are excluded from Git.

Dependencies are locked. Run `npm audit` and `npm run security` before release; browser tests must verify import traffic and escaped note content. A successful scan is bounded review evidence, not a guarantee against unknown dependency defects or malicious browser extensions.
