<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Quy tắc phát triển (Agent Rules)

- **Không tự ý build, test và xem UI**:
  - Tuyệt đối không tự ý chạy các lệnh build (`npm run build`, `next build`, v.v.).
  - Không tự ý chạy test (unit test, test script, snapshot, v.v.).
  - Không tự ý mở/xem UI (headless browser, screenshot, UI preview/devtools, v.v.) vì gây tiêu tốn nhiều token.
  - Thay vào đó, sau khi code xong hãy thông báo để người dùng tự kiểm tra UI trên thiết bị/trình duyệt của họ và đưa ra góp ý.
