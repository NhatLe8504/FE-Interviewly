# Kế hoạch hoàn thiện Practice System và Practice Operations Admin

> **Khảo sát ngày:** 18/09/2026
> **Phạm vi:** `/practice/setup/google-fe-l5`, `/practice/bt-google-mu6j7ov9`, và Admin UI/API vận hành template, question plan, session realtime.
>
> Đây là kế hoạch xử lý, không thay đổi code sản phẩm. `docs/PLAN_QUESTION_ENGINE.md` là tiền đề cho question engine và phải được hợp nhất vào các phase dưới đây, không triển khai thành hai luồng khác nhau.

---

## 1. Kết luận nhanh

### 1.1. Mức hoàn thiện hiện tại

| Khu vực | UI/UX | Dữ liệu và API thật | Realtime/lifecycle | Hoàn thiện ước lượng |
|---|---:|---:|---:|---:|
| Setup interview | 85% | 0–15% | Không có session thật | **35%** |
| Interview room | 75% | 10–20% | Không chạy ở local | **25%** |
| Practice Admin | 5–10% | Chưa kết nối UI | Chưa có nghiệp vụ vận hành session/template | **5%** |

Các con số trên đánh giá khả năng sử dụng end-to-end, không chỉ mức độ hoàn thiện giao diện.

### 1.2. Trạng thái khi chạy thực tế

- `/practice/setup/google-fe-l5` hiển thị tốt profile Google L5, lựa chọn mode, stage, nguồn câu hỏi và số lượt hỏi.
- Bấm bắt đầu hiện **không tạo session ở Backend**. Trang tự sinh ID dạng `bt-google-<random>` rồi ghi metadata vào `sessionStorage`.
- `/practice/bt-google-mu6j7ov9` hiển thị room, STAR drawer, timeline và các nút điều khiển, nhưng WebSocket thất bại: `ws://localhost:8000/api/v1/voice/ws/bt-google-mu6j7ov9` trả `404`.
- Đây không chỉ là API local chưa cập nhật. Backend WebSocket trong source nhận `session_id: int`, còn Setup tạo session ID chuỗi `bt-google-*`; hai contract không tương thích ngay từ thiết kế.
- Docker đang chạy `db` và `redis`; API ở port `8000` là tiến trình ngoài Docker. Điều này giải thích việc `/health` hoạt động nhưng endpoint Voice đang chạy không có route WebSocket mới. Dù chạy source API mới, session ID chuỗi vẫn phải được thay bằng ID session thật dạng số hoặc Backend đổi contract thống nhất.

### 1.3. Nguyên tắc quyết định

1. **Session Backend là source of truth.** Không dùng `sessionStorage` để tạo danh tính, plan hay trạng thái session.
2. **Template đã publish được version hóa và snapshot vào session.** Sửa template sau này không làm đổi buổi phỏng vấn đang/chưa hoàn tất.
3. **Barge-in là tùy chọn.** Mặc định hệ thống là `false`; Admin cấu hình default và quyền cho ứng viên override. Chỉ khi bật mới được hủy AI/TTS khi phát hiện người dùng nói.
4. **Một state machine phía client.** Voice WebSocket là primary transport; REST/SSE chỉ là fallback có chủ đích, không chạy hai flow gửi câu trả lời song song.
5. **Client không được tự quyết question plan sau khi session đã tạo.** Client chỉ gửi lựa chọn được Admin/Backend cho phép; Backend kiểm tra quota, question ID, moderation status và lưu snapshot.

---

## 2. Phát hiện chi tiết

## 2.1. Setup page `/practice/setup/[interviewId]`

### Điểm đã có thể giữ lại

- Luồng UX rõ ràng: preview role/company, chọn voice/text, chọn stage, source mode `auto_random | manual | mixed`, turn budget và drawer chọn câu hỏi.
- Stage config đã gần đúng với payload Backend: `stage_key`, `source_mode`, `min_turns`, `max_turns`, `selected_question_ids` tại `src/app/(user)/practice/setup/[interviewId]/page.tsx:113`.
- Backend đã có `StartSessionIn.stage_configs` và `selected_question_ids`, do đó không cần tạo một API start session khác.

### Chưa hoàn tất / lỗi chức năng

1. **Dữ liệu template hoàn toàn là mock.** `PRE_MADE_INTERVIEWS` ở `page.tsx:26,64` cấp cả profile, stage mẫu và question ID; route slug không đọc template đã publish từ Backend.
2. **Không gọi `POST /api/v1/interviews/sessions`.** `handleStartInterview` tại `page.tsx:108` tạo ID ở dòng 112, ghi metadata dòng 138–147 và redirect dòng 150. Vì vậy quota, quyền đăng nhập, validation và persistence bị bỏ qua.
3. **Question plan mất khi qua room.** Setup lưu `stage_configs` và `selected_question_ids`, nhưng room chỉ đọc `selected_stages`; interface `SessionMetaStored` không có các field plan và hook không nhận chúng.
4. **Nguồn câu hỏi “manual/mixed” chưa thật.** Drawer đọc `interview.sampleQuestions`, không gọi question bank, không có filter thực thi, pagination, trạng thái moderation, quyền sở hữu hay xác thực ID thuộc domain/role/template.
5. **Không validate plan.** Có thể chọn `manual` nhưng không chọn câu hỏi; chọn số câu vượt số manual question; chọn question lặp nhiều stage; hoặc chọn stage nhưng để config không hợp lệ. Nút Start chỉ kiểm tra có ít nhất một stage.
6. **Không có loading/error/retry rõ ràng cho API hoặc quota.** `isLaunching` chỉ che UI khi điều hướng local, không thể hiển thị lỗi server, lỗi token, plan invalid hay quota hết.
7. **Language là state bất biến.** `const [language] = useState("vi")` không có control và không lấy default từ template/candidate.

### Code thừa / chưa tối ưu

- `searchQuestionQuery` và `setSearchQuestionQuery` tại `page.tsx:95` chưa được dùng để render hay lọc câu hỏi.
- `PreMadeInterview` import tại `page.tsx:26` không được dùng.
- `session_metadata_<id>`, `active_session_metadata`, `custom_questions_<id>` và `active_custom_questions` cùng lưu dữ liệu trùng lặp. Global key `active_*` còn có thể làm một tab/session đọc nhầm dữ liệu session khác.
- File page lớn, nhiều inline style và logic question plan cùng nằm trong một client component. Đây là nguyên nhân khó test, khó responsive và dễ phát sinh rerender rộng. Cần tách `SetupForm`, `StageConfigEditor`, `QuestionBankDrawer`, `PlanSummary`.
- Stage definitions, sample question, label và policy đang hard-code tại FE; cần đưa về template/config có version thay vì nhân bản ở code.

## 2.2. Interview room `/practice/[sessionId]`

### Điểm đã có thể giữ lại

- Giao diện thực hành có đầy đủ hướng dẫn STAR, timeline stage, subtitle, waveform, persona/video, text/voice switching và conversation drawer.
- Hook `useRealtimeVoiceInterview` đã có nền tảng WebSocket, browser STT, audio queue, `state`, `ai_token`, `subtitle`, `audio`, `done`, `error` và UI toggle Barge-in.
- Source Backend đã có route Voice và orchestrator phân tách WebSocket/Orchestrator/LLM/TTS, nên có thể hoàn thiện contract thay vì viết lại hệ thống realtime.

### Lỗi/blocker P0

1. **ID session sai loại.** Room lấy trực tiếp string từ route và hook tạo URL WebSocket tại `src/hooks/useRealtimeVoiceInterview.ts:105–112`. Backend Voice route định nghĩa `{session_id}` kiểu `int`. ID mock `bt-google-mu6j7ov9` dẫn tới `404`.
2. **Backend đang chạy không chứa route Voice.** Console browser ghi handshake `404`; API port `8000` không phải container API hiện hành. Cần chạy đúng image/source sau khi contract ổn định, không được chỉ sửa FE để che lỗi.
3. **Không có auth WebSocket thực sự.** Client không gửi token query; Backend source lại fallback `user_id = 1` khi thiếu token trong `voice_ws.py`. Đây là lỗi bảo mật nghiêm trọng: phải authenticate và verify session ownership trước `accept()` hoặc ngay sau handshake, không fallback user mặc định.
4. **Text gửi khi disconnect bị mất im lặng.** `sendTextMessage` vẫn thêm local turn rồi `sendMessage` chỉ no-op nếu socket chưa mở. Người dùng thấy đã gửi nhưng Backend không nhận/persist.
5. **Kết thúc session chỉ đổi UI local.** `endSessionEarly` set `isCompleted` ngay cả khi socket lỗi; không có xác nhận persistence, retry hay trạng thái `abandoned/completed` ở server.

### Lỗi realtime/race condition P0–P1

1. **WebSocket bị khởi tạo lại theo state runtime.** Connection effect phụ thuộc `turnId` và `bargeInEnabled` tại `useRealtimeVoiceInterview.ts:436–562`. Mỗi event turn hoặc mỗi lần đổi Barge-in có thể close/open socket, gửi lại `client_ready` và làm mất generation đang chạy. Console local đã cho thấy rất nhiều lần handshake lặp.
2. **Không lọc `generationId`.** Backend trả `generation_id` cho `ai_token`, `subtitle`, `audio`, `done`, `interrupted`, nhưng FE không lưu/so sánh generation. Audio hoặc token đến muộn sau barge-in/reroll có thể được thêm lại queue và phát câu cũ.
3. **Barge-in mặc định đang bật.** Page truyền `bargeInInitial: true` tại `src/app/(user)/practice/[sessionId]/page.tsx:101–108`, trái với yêu cầu đây là option. Setup cũng không lưu preference/policy này.
4. **Client bắt mic/STT quá sớm.** Hook khởi tạo recognition và `getUserMedia` khi mount, kể cả khi user chuyển text mode hoặc chưa chủ động bật microphone. Cần chỉ xin permission sau thao tác người dùng ở voice mode.
5. **Audio queue chưa có khóa generation/sequence.** Queue chỉ lưu `{url, sentenceIdx}`; không có `generationId`, `turnId`, sequence, MIME validate, backpressure hay giới hạn queue. Base64 decode đồng bộ và tạo một `Audio` element cho mỗi chunk có overhead và gap giữa sentence.
6. **Các command realtime không có acknowledgement.** `reroll_question`, `next_stage`, `stop_session`, `config` không có pending/request ID/timeout, nên UI không biết Backend đã áp dụng hay từ chối.
7. **Không có chiến lược reconnect/recovery.** `onclose` chỉ set disconnected. Reload trang cũng không fetch session snapshot để khôi phục stage/current question/turn.

### Sai lệch cấu hình và UX

- Room đọc metadata với fallback global `active_session_metadata` ở `page.tsx:55–66`; direct URL hoặc refresh có thể hiện `Software Engineer / Senior` thay vì session thật.
- Setup có `stage_configs` nhưng Room chỉ truyền `selectedStages` và hook gửi hard-code `questions_per_stage` `{warmup:1, technical:2, closing:1}`. Budget do user chọn không được dùng.
- Template persona/video, role label và company được suy ra từ text level trên client; không phải snapshot từ session/template.
- Voice/Text switch chỉ là state UI. Cần định nghĩa rõ khi chuyển text: dừng STT/mic? voice agent có vẫn phát audio? candidate được trở lại voice ở giữa turn không?
- Live run đang hiển thị badge `BARGE-IN: BẬT`; Barge-in control là `<div onClick>` chứ không phải switch/button có keyboard semantics.
- Browser báo textarea chưa có `id` hoặc `name`; page còn nhiều interaction dùng inline style hoặc container clickable, cần audit keyboard/focus/ARIA.

### Code thừa / cần hợp nhất

- Page room import `Link`, `useEffect`, `useRef` nhưng không dùng.
- `useInterviewSession`, `useSseStreaming`, `useVoiceRecording`, `useTextToSpeech` và các component cũ (`InterviewHeader`, `AiStageAvatar`, `ResponseInputArea`) tạo thêm một flow REST/SSE/STT song song. Chúng chưa được room hiện tại sử dụng trực tiếp nhưng một số component còn import type từ hook cũ.
- `src/services/interviewApi.ts` vừa là wrapper dispatch vào RTK Query vừa giữ fallback/mock; `src/redux/api/interviewApi.ts` cũng mô tả endpoint. Chọn một typed data-access layer duy nhất, tránh hai contract drift.
- Không xóa các hook cũ ngay. Trước hết tách types dùng chung, chuyển consumer sang state machine mới, bổ sung test, rồi xóa dead code sau khi `rg` không còn import runtime.

## 2.3. Admin hiện trạng

- Dashboard `/admin` là template sample: `src/app/(admin)/admin/page.tsx` đọc `data.json` có dữ liệu “Cover page”, “Executive summary” không thuộc Interviewly.
- Các trang `domains`, `roles`, `questions`, `star-templates`, `users`, `payments`, `subscriptions`, `moderation`, `audit-logs`, `settings` hiện chỉ render heading/description, không có data fetching hay thao tác.
- Sidebar chưa có menu Practice Templates, Interview Operations hoặc Voice/Realtime settings.
- Backend đã có một phần API Admin: stats, users, audit logs, moderation, tạo domain/role/star template/question và cập nhật/xóa question. Đây là nền tảng có thể dùng lại; UI chưa kết nối.
- Backend hiện chưa có resource Admin chuyên biệt để quản lý template practice, stage policy, voice policy, phiên bản template, session operation queue hay realtime telemetry.

---

## 3. Kiến trúc đích

## 3.1. Mô hình dữ liệu chuẩn

### PracticeTemplate (Admin quản lý)

```ts
type PracticeTemplate = {
  id: number;
  slug: string;
  version: number;
  status: "draft" | "published" | "archived";
  title: string;
  company_name?: string;
  domain_id: number;
  role_id: number;
  level: string;
  supported_languages: ("vi" | "en")[];
  duration_minutes: number;
  stage_policies: StagePolicy[];
  voice_policy: VoicePolicy;
  persona: PersonaConfig;
  candidate_override_policy: CandidateOverridePolicy;
};
```

`StagePolicy` chứa key/label/order, enable rule, min/max turn được phép, source mode được phép, difficulty/type filter, manual question assignments và rubric/STAR template phù hợp.

`VoicePolicy` ít nhất có: default voice, language mapping, `barge_in_default: false`, `allow_barge_in_override`, TTS enabled, fallback allowed và giới hạn turn/audio.

### InterviewSession (Backend là source of truth)

```ts
type InterviewSessionRuntime = {
  session_id: number;
  status: "created" | "in_progress" | "completed" | "abandoned" | "failed";
  template_snapshot: PracticeTemplateSnapshot;
  candidate_preferences: {
    mode: "voice" | "text";
    barge_in_enabled: boolean;
  };
  question_plan: QuestionPlanSnapshot;
  runtime: {
    current_stage_key: string;
    current_turn_id: number;
    active_generation_id?: string;
    connection_status: string;
  };
};
```

Một session snapshot template/version/plan ngay khi `POST /sessions` thành công. FE chỉ cache tối thiểu session ID và UI preference không nhạy cảm; refresh/direct URL luôn lấy session runtime từ API.

## 3.2. Candidate flow chuẩn

1. Candidate vào `/practice/setup/:slug`; FE gọi template setup read model đã publish.
2. Candidate chọn các override được policy cho phép: mode, language, stage subset/turn budget/source mode/manual questions, Barge-in. Form validation dùng schema chung với API.
3. FE gọi `POST /api/v1/interviews/sessions`; Backend xác thực, kiểm quota, validate question IDs/moderation, snapshot plan/template và trả `session_id` số.
4. FE điều hướng `/practice/:sessionId` bằng ID thật, fetch `GET /sessions/:sessionId/runtime`.
5. Nếu voice mode được bật, UI chờ người dùng bấm “Bật micro” rồi mở WebSocket authenticated. Nếu text mode, không yêu cầu microphone.
6. Server là nguồn duy nhất quyết định current stage, turn, question policy và completion. UI xử lý event realtime theo `sessionId + turnId + generationId + sequence`.
7. Khi session hoàn tất/stop/reconnect, FE fetch runtime/result để đồng bộ persistence trước khi chuyển sang report.

## 3.3. Realtime voice state machine

```text
IDLE -> CONNECTING -> LISTEN -> THINK -> SPEAK -> LISTEN
                                  |        |
                                  |        +-- user_speech_start (khi Barge-in ON)
                                  |                     -> CANCELLING -> LISTEN
                                  +-- error -> DEGRADED (text REST fallback)

any active state -> ENDING -> COMPLETED | ABANDONED | FAILED
```

- WebSocket connection effect chỉ phụ thuộc `sessionId`, authenticated URL và explicit connect intent; không phụ thuộc `turnId`, Barge-in state hay stage array.
- `barge_in_enabled` thay đổi bằng `config` command có acknowledgement; không reconnect.
- `generationId` active được lưu trong ref/state. Bỏ qua token/subtitle/audio/done có generation cũ; audio queue key theo `(generationId, sentenceIndex, chunkSequence)`.
- Khi Barge-in **ON** và STT phát hiện speech: gửi `user_speech_start`, immediately invalidate generation + clear audio queue, chờ `interrupted`/state rồi stream transcript.
- Khi Barge-in **OFF**: interim transcript chỉ hiển thị local, không cancel LLM/TTS. UI phải yêu cầu candidate chờ AI kết thúc hoặc dùng explicit “Dừng AI để trả lời” nếu product cần.
- Server trả ack/error có `command_id`; client giữ pending command, timeout/retry policy và toast rõ ràng.
- Reconnect dùng exponential backoff có giới hạn; sau reconnect gửi resume cursor và fetch runtime snapshot. Không tự reconnect mãi sau lỗi `401`, `403`, `404` hay protocol mismatch.

## 3.4. Audio performance

- Ưu tiên `time-to-first-audio`: LLM stream token -> server sentence splitter -> TTS của sentence đầu -> audio ngay, không chờ full answer.
- Mỗi audio event bắt buộc: `session_id`, `turn_id`, `generation_id`, `sentence_index`, `chunk_sequence`, `mime_type`, binary payload hoặc blob URL có TTL.
- P1 giữ base64 nếu cần triển khai nhanh nhưng phải có MIME/size limit; P2 chuyển WebSocket binary frames hoặc streaming audio transport để tránh base64 overhead và decode đồng bộ trên main thread.
- Tách `AudioPlaybackQueue` thành module có cancel generation, max buffered duration, metrics buffered/played/dropped và cleanup object URL.

---

## 4. API và contract worklist

## 4.1. Dùng lại và sửa contract hiện có

| API hiện có | Việc cần làm |
|---|---|
| `POST /api/v1/interviews/sessions` | Dùng làm điểm tạo session duy nhất; nhận template/slug hoặc `practice_id`, candidate overrides; validate và trả `session_id`, runtime snapshot tối thiểu, WebSocket endpoint info. |
| `GET /api/v1/interviews/sessions/{id}` | Mở rộng hoặc thêm `/runtime` để trả template snapshot, plan, current stage/turn, preferences, reconnect cursor. |
| `POST /api/v1/interviews/sessions/{id}/turns` | Dùng cho text/REST fallback, idempotency key, trả persisted turn và next state. Không được song song với WebSocket cho cùng turn. |
| `GET /api/v1/interviews/sessions/{id}/stream` | Đặt rõ là legacy text/SSE fallback hoặc bỏ sau migration; không để room vô tình mở cùng WebSocket. |
| `/api/v1/voice/ws/{session_id}` và `/api/v1/interviews/{session_id}/ws` | Giữ **một canonical route**, `session_id` là numeric session thật, require auth/session ownership; deprecate route còn lại theo version. |
| Admin catalog endpoints | Tái sử dụng để quản lý domain, role, question, STAR template; bổ sung list/update/delete còn thiếu theo resource. |

## 4.2. API cần bổ sung

### Candidate read model

- `GET /api/v1/practice-templates/{slug}/setup`: template published, preview và candidate override policy; không trả question text bị hạn chế.
- `GET /api/v1/interviews/sessions/{id}/runtime`: session snapshot/resume data sau refresh/reconnect.
- `POST /api/v1/interviews/sessions/{id}/commands`: fallback authenticated command endpoint nếu socket unavailable (`stop`, `reroll`, `next-stage`) với idempotency.

### Admin Practice Operations

- `GET|POST /api/v1/admin/practice-templates`
- `GET|PUT|DELETE /api/v1/admin/practice-templates/{id}`
- `POST /api/v1/admin/practice-templates/{id}/publish`
- `POST /api/v1/admin/practice-templates/{id}/archive`
- `GET|PUT /api/v1/admin/practice-templates/{id}/stages`
- `GET|PUT /api/v1/admin/practice-templates/{id}/question-plan`
- `GET|PUT /api/v1/admin/practice-templates/{id}/voice-policy`
- `GET /api/v1/admin/interview-sessions` và `GET /api/v1/admin/interview-sessions/{id}`
- `POST /api/v1/admin/interview-sessions/{id}/actions` cho force-stop/requeue/review với reason bắt buộc.
- `GET /api/v1/admin/practice-tasks` và `POST /api/v1/admin/practice-tasks/{id}/actions` cho các task vận hành: review generated questions, publish request, failed TTS/LLM job, moderation, retry/requeue.
- `GET /api/v1/admin/realtime/health` cho connection, event error, first-audio latency, queue depth theo aggregated metrics; không lộ transcript/PII nếu user không có quyền.

### WebSocket protocol phải chốt trước FE implementation

- Client commands: `client_ready`, `config`, `interim_transcript`, `final_transcript`, `user_speech_start`, `reroll_question`, `next_stage`, `stop_session`, `ping`.
- Server events: `state`, `transcript`, `ai_token`, `subtitle`, `audio`, `done`, `interrupted`, `command_ack`, `error`, `pong`.
- Tất cả event mutating/realtime mang `protocol_version`, `session_id`, `turn_id`, `generation_id` khi applicable và sequence/order field.
- Auth token chỉ được truyền qua mechanism được server verify (query token ngắn hạn hoặc cookie same-site); không default sang user ID khác.
- Generate typed frontend contract từ OpenAPI/JSON Schema hoặc đặt một shared contract package. Không duy trì type copy rời giữa `types/interview.ts`, service và hook.

---

## 5. Thiết kế Admin UI

## 5.1. Navigation mới

Thêm nhóm **Practice Operations** vào `src/components/app-sidebar.tsx`:

| Route | Mục đích |
|---|---|
| `/admin/practice-templates` | Danh sách Draft/Published/Archived, version, owner, usage, publish state. |
| `/admin/practice-templates/new` | Tạo template theo wizard. |
| `/admin/practice-templates/[id]` | Overview, version history, publish/rollback, preview candidate setup. |
| `/admin/practice-templates/[id]/stages` | Stage order, labels, allowed source modes, turn budget, difficulty/type filters, STAR/rubric. |
| `/admin/practice-templates/[id]/questions` | Manual assignments, auto pool rules, moderation status, coverage/balance, test sample. |
| `/admin/practice-templates/[id]/voice` | Persona, language, voice, TTS, Barge-in default/override policy. |
| `/admin/interview-operations` | Active/failed/completed session queue, operational actions, connection/runtime status. |
| `/admin/practice-tasks` | Task queue: review/publish/generation/retry/moderation với owner, SLA, history. |
| `/admin/realtime-monitoring` | Aggregate health và latency; drill down với privacy controls. |

## 5.2. Template editor

### Tab Overview

- Identity: title, slug, company/brand, domain, role, level, duration, supported language, cover media.
- Lifecycle: Draft → Review → Published → Archived; publish requires validation và tạo immutable version.
- Candidate preview link mở cùng Setup component ở preview mode, không tạo một trang mock khác.

### Tab Stages

- Drag/order stage; enable/disable stage; stage name/description/subtopics.
- Min/max turn, source mode permitted/default, candidate can remove/add stage?, difficulty/type rules.
- Validation live: total duration, at least one enabled stage, `min <= max`, manual count đủ budget, no duplicate assignment conflict.

### Tab Question plan

- Reuse Question Bank, filters, pagination, moderation status, bulk assignment và preview sampling.
- Show provenance (`curated`, `generated`, `candidate_created`), approval state, last edited và coverage matrix (stage × difficulty × type).
- `manual` là exact assignment; `auto_random` samples from approved pool; `mixed` reserves named questions rồi samples remainder. Định nghĩa này phải được Backend thực thi.

### Tab Voice & behaviour

- Persona/video/avatar, default language/voice, TTS enabled, fallback behavior.
- `Barge-in default` **OFF**; checkbox `Candidate may override` riêng biệt.
- Warning for unsupported browser STT/language và policy test button mở non-persistent realtime simulator.

## 5.3. Interview Operations

- Table filter theo status, template/version, candidate, date, mode, connection health, current stage/turn, error category.
- Detail panel: immutable plan snapshot, event timeline, last state, metrics (TTFT/TTFA, reconnects, audio drops), transcript access based on permission.
- Actions: force stop, retry failed evaluation/TTS task, flag/moderate session, export audit reference. Không có action ghi đè transcript hoặc phát lại audio khi chưa có quyền/privacy policy.
- Mọi action cần reason + confirmation; Backend ghi audit log kèm actor, old/new state, request/correlation ID.

## 5.4. Task management

`PracticeTask` là object vận hành, không phải candidate turn:

```ts
type PracticeTask = {
  id: string;
  type: "template_review" | "question_moderation" | "generation_retry" |
        "voice_failure" | "session_review" | "publish_request";
  status: "open" | "in_progress" | "blocked" | "done" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  subject_type: "template" | "question" | "session";
  subject_id: string;
  assignee_id?: number;
  due_at?: string;
  created_at: string;
};
```

- Queue có ownership, priority, filters, bulk assign, SLA badge, comment/reason, transition history.
- Event runtime lỗi chỉ tạo task khi vượt threshold/dedup key; không tạo một task cho từng audio chunk hoặc reconnect.
- Tích hợp trực tiếp với Moderation và Audit Logs hiện có, không tạo hai nguồn lịch sử.

## 5.5. Quyền

- Hiện Backend chỉ có `candidate|admin`. Phase Admin cần permission capability tối thiểu: `practice.template.read/write/publish`, `practice.question.assign`, `practice.session.read/operate`, `practice.task.manage`, `realtime.metrics.read`, `transcript.read_sensitive`.
- Nếu chưa mở RBAC đầy đủ, UI dùng Admin role nhưng Backend vẫn enforce permission/capability server-side. Không dựa vào ẩn menu ở FE.

---

## 6. Lộ trình thực hiện

## Phase 0 — Chốt contract và khôi phục end-to-end (P0)

**Mục tiêu:** Không còn mock session ID, không còn WebSocket 404/race sau khi Start.

1. Chốt canonical ID: numeric `session_id` từ Backend; redirect chỉ sau `POST /sessions` thành công.
2. Chốt one canonical WebSocket route, auth/ownership và full event envelope/version.
3. Chạy API đúng source/image có Voice route cùng DB/Redis; thêm startup check endpoint/observability để tránh API code cũ chạy ở port `8000`.
4. Add `GET session runtime`, server-side plan snapshot và typed API contract.
5. Bỏ fallback `user_id = 1`; reject unauthorized WebSocket với proper close code.
6. Chọn transport ownership: room dùng Voice WebSocket; REST/SSE chỉ fallback được feature flag rõ ràng.

**Nghiệm thu:** user login → setup → Backend trả numeric ID → redirect room → WebSocket authenticated `101 Switching Protocols` → `client_ready/state` thành công; refresh room vẫn thấy đúng template/stage/turn.

## Phase 1 — Tái cấu trúc Setup (P0)

1. Tạo `PracticeSetupClient` gồm query template, form schema, submit start session và error states.
2. Tách `StageConfigEditor`, `QuestionBankDrawer`, `PlanSummary`, `CandidatePreferencePanel`.
3. Dùng catalog API thật với filters/pagination/moderation status; giữ mock chỉ trong Storybook/test fixture hoặc dev feature flag.
4. Validate policy client lẫn server: manual question count, turn range, question uniqueness, allowed stage/source/language, quota/auth.
5. Persist candidate Barge-in choice theo policy, mặc định false; không dùng `active_session_metadata`.
6. Dùng semantic controls (`button`, checkbox/switch có label, keyboard focus) và responsive layout CSS module/design system thay inline styles lớn.

**Nghiệm thu:** plan invalid không Start; valid plan tạo session thật; manual/mixed gửi question ID đã approved; API lỗi/quota/auth có message và retry; tạo 2 tab không rò session metadata.

## Phase 2 — Một client session state machine (P0–P1)

1. Tạo `useInterviewRuntime`/reducer cho hydrate, commands, UI state và derived view model.
2. Tạo `useVoiceSocket` giữ connection stable; tách command/config effect khỏi socket lifecycle.
3. Tạo `AudioPlaybackQueue` có generation/sequence invalidation, cleanup, max buffer và metrics.
4. Chỉ bắt mic/STT sau user action và chỉ voice mode; handle permission denied và browser unsupported thành degraded text experience.
5. Disable/queue/retry đúng cách khi disconnected; không append local turn cho đến khi command được accepted/persisted hoặc render trạng thái `sending` rõ ràng.
6. Kết thúc/skip/reroll theo command acknowledgement rồi hydrate runtime; result page chỉ mở sau state server phù hợp.

**Nghiệm thu:** no reconnect khi token/turn/state/Barge-in thay đổi; direct URL/reload restore session; các command có pending/success/error; room không đánh lừa user rằng câu trả lời đã gửi khi socket down.

## Phase 3 — Realtime Voice, Barge-in và latency (P1)

1. Implement `generationId` gate ở FE và BE; event cũ không được render/phát sau cancel/reroll/next stage.
2. Server cancellation: cancel LLM stream, TTS task, future audio emission và send `interrupted` idempotently.
3. Implement Barge-in OFF/ON behavior matrix, config ack và persistence theo session preference.
4. Add reconnect/resume with backoff, protocol mismatch UX, telemetry/correlation ID.
5. Optimize audio framing và measure first-token/first-audio latency; keep sentence segmentation.

**Nghiệm thu:**

- ON: user speech cancels current generation once; old audio never plays again.
- OFF: interim speech does not cancel AI/TTS.
- Reroll/next-stage/stop invalidate old events.
- First subtitle/audio arrives before full AI response on test stream; metrics are observable.

## Phase 4 — Admin Foundation và Practice Templates (P1)

1. Thay dashboard sample/data.json bằng stats thật từ `GET /admin/stats`.
2. Build shared Admin shell, auth guard, API client, table/filter/pagination/error/empty states.
3. Kết nối UI các resource đã có: users, domain/role, question bank, STAR templates, moderation, audit logs.
4. Implement Practice Templates routes/tabs, version lifecycle, stage/question/voice policies và candidate preview.
5. Add API migration/model/repository/service theo Clean Architecture backend; audit every mutation và cache invalidation.

**Nghiệm thu:** Admin tạo draft → config stages/questions/voice → validate → publish v1; candidate setup đọc đúng template v1; admin thay draft v2 không đổi session v1.

## Phase 5 — Operations, Task Queue và Monitoring (P1–P2)

1. Implement interview operation list/detail/action audit.
2. Implement PracticeTask queue, assignment, transitions, dedup/alert threshold, links to moderated content/session/template.
3. Implement realtime health dashboard với aggregate metrics và privacy policy.
4. Add feature flags cho realtime voice, browser STT và TTS fallback; include rollback playbook.

**Nghiệm thu:** Operator có thể tìm session lỗi, xem reason/trace, tạo/reassign/retry task với audit; dashboard hiển thị latency/error trends mà không expose transcript vượt quyền.

## Phase 6 — Quality gate và cleanup (P1)

1. Xóa legacy `sessionStorage` plan ownership, unused imports, stale mock/fallback paths và old hooks/components chỉ sau migration/test.
2. Consolidate API types và remove duplicate service/RTK contracts.
3. Responsive/accessibility audit: keyboard, focus trap drawer, ARIA live subtitle, reduced motion, contrast, mobile microphone flow.
4. Video/image/audio asset budget: optimized codecs/sizes, lazy preload only when needed, no unnecessary video decode in text mode.

**Nghiệm thu:** typecheck/lint/build green; no dead runtime imports; Lighthouse/accessibility regression gates pass; production bundle và media budgets documented.

---

## 7. Test strategy

| Layer | Cases bắt buộc |
|---|---|
| Domain/Application BE | Template policy validation, immutable snapshot, quota, ownership, task transitions, cancellation idempotency. |
| API integration | Create session with auto/manual/mixed; invalid question ID/moderation; runtime restore; Admin publish/version/action audit. |
| WebSocket integration | Auth/ownership; event schema; ordering; command ack; reconnect; old `generationId` ignored; Barge-in on/off; stop/reroll/next-stage cancellation. |
| FE unit | Reducer/state machine, audio queue invalidation, payload mapping, form policy validation, disconnected sending state. |
| E2E | Login → published Google L5 setup → session create → room/reload → text answer → result; voice happy path with mock STT/TTS; denied mic; API 401/409/422; socket 404/close/reconnect. |
| Admin E2E | Create template draft → stage/question/voice config → publish → candidate uses it; task assign/resolve; operator action appears in audit log. |
| Performance | Record time-to-first-token, time-to-first-audio, reconnect count, queue depth/drop; test slow TTS/LLM và multi-sentence stream. |

---

## 8. Thứ tự ưu tiên và ownership đề xuất

1. **P0 Backend + FE contract owner:** numeric session creation, auth Voice WebSocket, runtime endpoint, startup/deployment source consistency.
2. **P0 FE Practice owner:** replace mock session flow, stable state machine/socket lifecycle, non-destructive disconnected UX.
3. **P1 Voice owner:** generation cancellation, audio queue, Barge-in policy/metrics.
4. **P1 Admin/Backend owner:** template/version/stage/question/voice policy APIs + migrations.
5. **P1 Admin/FE owner:** template editor và operations/task UI.
6. **P1 QA owner:** contract, WebSocket, E2E và regression suite; gate removal of legacy hooks/mock data.

Không merge các phase theo UI screenshot đơn thuần. Mỗi phase chỉ được coi là hoàn thành khi đạt acceptance criteria và test tương ứng ở mục 6–7.
