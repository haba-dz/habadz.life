<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

For Next.js specifically:

* Use the simplest correct Next.js solution. Do not overengineer.
* Follow the existing project patterns(If stable) and current Next.js best practices. Reuse components utilities hooks and server logic when possible.
* Analyze the blast radius. Before changing code check related pages components APIs Server Actions database queries auth middleware caching and user flows.
* Handle Next.js behavior carefully. Check caching revalidation redirects dynamic routes loading states errors params searchParams and server/client boundaries.
* Prediction Scan. Before finishing scan for real production issues including auth leaks invalid inputs duplicate requests race conditions database performance N+1 queries pagination cache issues stale data hydration errors broken links SEO metadata and mobile user flows.
* Verify deeply. Run the relevant type checks tests
* Check for unnecessary code. Remove outdated logic dead code unused imports duplicated logic and workarounds that are no longer needed.
* Investigate errors. Use Sentry MCP if available when existing production errors are relevant.
* If something is unclear risky or uncertain say so. Never pretend something works without verifying it.



<!-- END:nextjs-agent-rules -->
