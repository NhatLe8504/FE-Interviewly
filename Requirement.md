# Kế Hoạch Thiết Kế & Triển Khai Kỹ Thuật (Architecture & Implementation Plan)

## Hệ Thống Phân Tích Giọng Nói & Hàng Đợi AI Chấm Điểm Đa Thức Tối Ưu Latency (Pipeline A/B + Pull MQ)

> Mục tiêu: Xây dựng hệ thống phân tích phát âm & giọng nói chuẩn production dựa trên kiến trúc tham chiếu Beevibe, tách biệt hoàn
> toàn giữa Pipeline A (đo lường cục bộ thời gian thực) và Pipeline B (AI chấm điểm qua hàng đợi Pull MQ bất đồng bộ), đồng thời
> áp dụng quy tắc Khóa câu hỏi một chiều (không sửa câu cũ khi đã chuyển câu) và Công thức chấm điểm đa thức (15% Trắc nghiệm –
> 35% Tự luận STAR – 50% Giọng nói).

———

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               KIẾN TRÚC TỔNG THỂ HỆ THỐNG                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘

 [ỨNG VIÊN NÓI VÀO MICROPHONE]
             │
             ├──► [PIPELINE A: ĐO LƯỜNG CỤC BỘ THỜI GIAN THỰC (0ms Overhead)]
             │      ├─ Web Audio API (AnalyserNode + Noise Floor Calibration)
             │      ├─ Realtime VAD (Hysteresis Silence & Auto-finish Detection)
             │      ├─ SpeechRecognition Adapter (Interim & Final Transcripts)
             │      ├─ Contextual Filler Detector (Từ đệm VI/EN: ừm, à, basically...)
             │      ├─ Repetition & Stutter Detector (Lặp từ, lặp ngữ)
             │      ├─ Pause Analyzer (Mảng độ dài ngắt quãng, Long Pause Count)
             │      └─ Speech Rate Calculator (Elapsed WPM vs. Active Speech WPM)
             │
             ▼
 [BẤM "CÂU KẾ TIẾP" ➔ KHÓA CÂU VỪA LÀM (Read-only Lock)]
             │
             ├──► [PIPELINE B: HÀNG ĐỢI PULL MQ BẤT ĐỒNG BỘ (Backend Redis / Async Queue)]
             │      ├─ Enqueue Task (Payload: Question + Transcript + DeliveryMetrics + Rubric)
             │      ├─ Trả về task_id ngay lập tức (< 15ms, không chặn UI làm bài)
             │      ├─ Worker tiến trình ngầm xử lý đánh giá AI & phân tích STAR
             │      └─ Client kéo kết quả (Pull MQ / Async Poll) hiển thị mượt mà
             │
             ▼
 [NỘP BÀI & TỔNG KẾT]
       ├─ Trắc nghiệm (15%): Chấm tức thì bằng Answer Key (0ms, KHÔNG tốn API AI)
       ├─ Tự luận STAR (35%): AI chấm điểm cấu trúc & dẫn chứng
       └─ Giọng nói (50%): AI diễn giải DeliveryMetrics + nội dung phát âm

———

## PHẦN 0: KẾT QUẢ AUDIT HỆ THỐNG HIỆN TẠI (PHASE 0 AUDIT)

Sau khi rà soát toàn bộ cấu trúc dự án FE-lhieu20231 và BE-lhieu20231, hệ thống đã có sẵn các nền tảng sau:

1. Frontend (FE-lhieu20231):
    - Framework: Next.js 16.3.4 (App Router, Turbopack, React 19).
    - Thành phần ghi âm hiện có: src/hooks/useVoiceRecording.ts sử dụng navigator.mediaDevices.getUserMedia, MediaRecorder và
      SpeechRecognition cơ bản, nhưng chưa có VAD chống nhiễu, chưa tính toán WPM hoạt động, chưa bóc tách từ đệm/lặp từ ngữ cảnh.

    - Thành phần luyện tập câu hỏi: src/app/(user)/questions/[id]/QuestionDetailClient.tsx và src/app/(user)/questions/practice/
      PracticeWorkspaceClient.tsx.

    - Mô hình câu hỏi & Chấm điểm: src/types/catalog.ts với QuestionDetailOut, DEFAULT_RUBRIC_CRITERIA, MultiModalScoreBreakdown
      (15-35-50).

    - Client API: src/services/catalogApi.ts gọi backend qua request() trong apiClient.ts.

2. Backend (BE-lhieu20231):
    - Framework: FastAPI, Python 3.14, SQLAlchemy ORM, Uvicorn trên cổng 8000.
    - Cơ sở dữ liệu & Cache: PostgreSQL 16 (5432) và Redis 7 (6379) đã được kết nối thông qua app/infrastructure/redis_client.py.
    - Dịch vụ phân tích giọng nói sẵn có: app/application/speech/service.py và app/infrastructure/speech/text_analyzer.py đã có
      regex nhận diện từ đệm cơ bản và tính WPM thô.

    - Động cơ AI: app/infrastructure/llm/openai_adapter.py với evaluate() xử lý Rubric và STAR.

———

## PHẦN 1: KẾ HOẠCH TRIỂN KHAI CHI TIẾT THEO 6 GIAI ĐOẠN

###  Giai đoạn 1: Mô Hình Đo Lường Chỉ Số Phát Âm (Delivery Telemetry Contract)

Xây dựng cấu trúc dữ liệu đo lường thuần túy khách quan, có khả năng serialize JSON và không chứa phán đoán tâm lý.

- Tập tin: src/types/delivery.ts
- Mô hình dữ liệu:

  export interface FillerOccurrence {
    text: string;
    count: number;
    isPossibleFiller: boolean; // Phân biệt từ đệm chắc chắn vs từ ngữ cảnh (như "like", "thật ra")
  }

  export interface DeliveryMetrics {
    durationMs: number;
    activeSpeechMs: number;
    wordCount: number;
    elapsedWpm: number;           // totalWords / totalDuration
    activeSpeechWpm: number;      // totalWords / activeSpeakingDuration (chính xác hơn)
    fillerCount: number;
    possibleFillerCount: number;
    fillerRatePer100Words: number;
    fillers: FillerOccurrence[];
    longPauseCount: number;       // Số khoảng lặng dài (> 1200ms)
    pauseDurationsMs: number[];   // Danh sách các khoảng lặng để phân tích
    maxPauseMs: number;
    averagePauseMs: number;
    repetitionCount: number;
    repeatedPhrases: string[];    // "tôi tôi", "we we"
    startedSpeakingAtMs: number;
    endSilenceMs: number;
    transcriptAvailable: boolean;
    transcriptProvider: "webkitSpeechRecognition" | "SpeechRecognition" | "none";
  }

———

###  Giai đoạn 2: Pipeline A — Đo Lường Cục Bộ Bằng Web Audio API & VAD Thông Minh

Thực thi 100% trong trình duyệt người dùng với độ trễ 0ms, không đẩy audio thừa lên server.

1. Hiệu chỉnh mức ồn sàn (Microphone Noise Floor Calibration):
    - Trong 300ms đầu khi người dùng bấm "Bắt đầu ghi âm", hệ thống tự động lấy mẫu mức ồn phòng để thiết lập silenceRmsThreshold
      thích ứng (thay vì gán cứng con số cố định).

2. Cấu hình VAD linh hoạt (VAD_CONFIG):

   export const VAD_CONFIG = {
     calibrationMs: 300,
     minSpeechDurationMs: 400,
     longPauseThresholdMs: 1200, // Khoảng lặng 1.2s được tính là 1 lần ngập ngừng dài
     endTurnSilenceMs: 2500,     // 2.5s không nói sau khi đã phát biểu ➔ tự động kết thúc hoặc báo sẵn sàng
     hysteresisDebounceMs: 150,  // Khử nhiễu giật lag khi chuyển giữa nói và im lặng
   };

3. Bộ nhận diện từ đệm ngữ cảnh (Contextual Filler Detector):
    - Từ điển Tiếng Việt: ừm, ờ, à, kiểu như, ý là, nói chung là, thực ra, đại loại là.
    - Từ điển Tiếng Anh: um, uh, er, ah, hmm, you know, sort of, kind of, basically.
    - Xử lý ngữ cảnh (Contextual Heuristic): Từ "thật ra", "like" hoặc "actually" nếu đứng sau động từ hoặc liên từ có nghĩa sẽ
      chỉ gắn cờ isPossibleFiller chứ không bị trừ điểm oan.

4. Bộ phát hiện lặp từ / nói lắp (Repetition & Stutter Detection):
    - Bắt regex các cặp từ trùng nhau liền kề (\b(\w+)\s+\1\b) hoặc cụm 2 từ lặp lại.

5. Đo WPM thực tế (activeSpeechWpm):
    - Trừ đi tổng thời gian của các khoảng lặng dài để tránh đánh giá ứng viên "nói quá chậm" chỉ vì họ dừng lại suy nghĩ thấu
      đáo.

———

###  Giai đoạn 3: Máy Trạng Thái Lượt Nói (Turn State Machine) & Bộ Bọc STT

Tránh triệt để Race Condition, Memory Leak và đơ giao diện.

1. State Machine rõ ràng:
   idle ➔ calibrating ➔ listening ➔ speakingDetected ➔ paused ➔ finalizing ➔ ready

2. SpeechRecognizer Abstraction (src/lib/speech/speechRecognizer.ts):
    - Bọc webkitSpeechRecognition / SpeechRecognition qua Interface:
        - start(), stop(), abort()
        - onInterimTranscript(), onFinalTranscript(), onError()

    - Chế độ No-STT Fallback: Nếu trình duyệt không hỗ trợ Web Speech API (như một số phiên bản Firefox/Safari), hệ thống vẫn ghi
      âm audio và đo VAD/pauses bình thường, không để ứng dụng bị crash.

3. Dọn dẹp tài nguyên tuyệt đối (Resource Cleanup):
    - Khi unmount hoặc đổi câu: Tự động gọi MediaStream.getTracks().forEach(t => t.stop()), audioContext.close(), hủy
      requestAnimationFrame, clearInterval.

———

###  Giai đoạn 4: Quy Tắc Khóa Câu Một Chiều (Forward-Only Progression Lock)

Đáp ứng yêu cầu: "khi tới câu kế tiếp ko được quay lại sửa câu vừa rồi".

1. Cơ chế Khóa Trạng Thái (lockedQuestionIds):
    - Khi người dùng bấm Câu kế tiếp → từ câu $i$ sang câu $i+1$, câu $i$ lập tức được đưa vào danh sách lockedQuestionIds.

2. Giao diện khi quay lại xem câu đã làm:
    - Người dùng vẫn được phép bấm ← Câu trước hoặc số câu trên Stepper để xem lại đề bài và bài mình đã làm.
    - Tuy nhiên, toàn bộ ô chọn Trắc nghiệm, khung soạn thảo Tự luận STAR và các nút bấm Ghi âm Micro sẽ chuyển sang trạng thái
      Read-Only / Disabled.

    - Hiển thị nhãn cảnh báo trực quan:
       Câu hỏi này đã được hoàn thành và khóa làm bài một chiều (Không thể chỉnh sửa sau khi đã chuyển sang câu tiếp theo).

3. Hộp thoại cảnh báo bỏ dở:
    - Trước khi người dùng bấm chuyển câu sang câu tiếp theo, nếu câu hiện tại chưa đủ 3 phần (chưa chọn trắc nghiệm, tự luận < 20
      từ, nói < 5s), hệ thống sẽ mở cảnh báo xác nhận rõ:
      "Bạn có chắc chắn muốn chuyển câu? Sau khi chuyển, câu này sẽ bị KHÓA và không thể chỉnh sửa lại."

———

###  Giai đoạn 5: Pipeline B — Hàng Đợi Bất Đồng Bộ Pull MQ Tối Ưu Latency

Đáp ứng yêu cầu: "dùng async await + pull mq để xử lí hàng đợi cho AI chấm điểm. yêu cầu tối ưu latency".

#### 1. Tại sao Pull MQ tối ưu latency vượt trội?

- Nếu làm bài xong $N$ câu rồi gửi đồng bộ 1 request lớn chờ AI phân tích toàn bộ, thời gian chờ có thể lên đến 15 – 30 giây, dễ
  bị HTTP Gateway Timeout.

- Với Pull MQ:
    - Song song hóa ngay trong lúc làm bài (Background Enqueue): Ngay khi ứng viên hoàn thành xong câu $i$ và bấm chuyển sang câu
      $i+1$, hệ thống đẩy ngay bài làm của câu $i$ vào hàng đợi Redis MQ (LPUSH).

    - Worker tiến trình ngầm đã chấm điểm xong câu 1, 2, 3 trong lúc người dùng đang mải làm câu 4!
    - Đến khi người dùng nộp câu cuối cùng, gần như toàn bộ các câu trước đó đã có sẵn kết quả chấm điểm ➔ Giảm thời gian chờ đợi
      (latency) xuống mức gần như tức thì ($< 2$ giây)!

#### 2. Thiết kế Endpoints Backend (BE-lhieu20231):

1. POST /api/v1/catalog/evaluations/queue:
    - Tiếp nhận: { "question_id": 19, "quiz_answer": "B", "text_answer": "...", "delivery_metrics": {...}, "language": "vi" }.
    - Xử lý Trắc nghiệm tức thì (0ms, không tốn AI): Đối chiếu với đáp án đúng của DB ➔ Tính điểm Quiz ($15%$).
    - Đẩy payload Tự luận + Nói vào Redis Queue: LPUSH interviewly:eval_queue task_json.
    - Lưu trạng thái: SET interviewly:task:{task_id} {"status": "queued"}.
    - Trả về ngay trong vòng < 10ms: {"task_id": "task_abc123", "status": "queued"}.

2. GET /api/v1/catalog/evaluations/pull/{task_id}:
    - Trả về: {"status": "queued" | "processing" | "completed" | "failed", "result": {...}}.

3. Worker Consumer (Tiến trình ngầm):
    - Đọc task bằng BRPOP interviewly:eval_queue.
    - Gọi AI LLM với prompt tối ưu (kèm delivery_metrics + rubric).
    - Cập nhật kết quả vào Redis key interviewly:task:{task_id} với TTL 24 giờ.

#### 3. Client Polling Hook (useEvaluationPullQueue.ts):

- Sử dụng async/await với thuật toán Exponential Backoff ngắn (200ms ➔ 400ms ➔ 800ms) để kéo kết quả cực nhanh ngay khi worker vừa
  hoàn thành.

———

###  Giai đoạn 6: Nhận Diện & Trình Bày UI Sau Khi Nộp Bài

Bảo tồn 100% nhận diện Glassmorphism hiện tại.

1. Thẻ Tóm Tắt Tốc Độ & Phát Âm (Delivery Summary):

   ️ Phân tích phát âm & Tốc độ nói
   ⏱️ 01:14 (Nói liên tục: 58s)  •  Tốc độ: 124 WPM (Chuẩn)  •  3 từ đệm  •  2 ngắt quãng dài  •  0 lặp từ

2. Chi tiết mở rộng khi xem lại câu hỏi:
    - Từ đệm (Fillers): "ừm" ×2, "kiểu như" ×1.
    - Ngắt quãng (Pauses): 1.4s, 2.1s (Khuyên nghị: nên duy trì nhịp thở tự nhiên).
    - Không chẩn đoán tâm lý: Tuyệt đối không phán xét tiêu cực như "bạn đang run rẩy/lo sợ", mà chỉ nhận xét khách quan về tính
      liên tục của lời nói.

3. Màn hình Tổng kết Scorecard:
    - Tổng điểm trên thang 100 theo đúng công thức: $15/N$ Quiz + $35/N$ Text + $50/N$ Voice.
    - Danh sách chi tiết từng câu kèm lời nhận xét, rubric và số liệu phát âm.

———

## PHẦN 2: DANH MỤC CÁC TẬP TIN CẦN TẠO MỚI & CHỈNH SỬA

 STT    Tập tin             Vị trí                  Mục đích
━━━━━  ━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1     src/types/          Frontend (Tạo mới)      Cấu trúc dữ liệu đo lường phát âm DeliveryMetrics & FillerOccurrence.
        delivery.ts
─────  ──────────────────  ──────────────────────  ───────────────────────────────────────────────────────────────────────────────
  2     src/lib/speech/     Frontend (Tạo mới)      Module Web Audio API: VAD, đo năng lượng RMS, lọc tiếng ồn sàn, phát hiện
        audioAnalyzer.ts                            khoảng lặng.
─────  ──────────────────  ──────────────────────  ───────────────────────────────────────────────────────────────────────────────
  3     src/lib/speech/     Frontend (Tạo mới)      Module tính toán tất định: WPM thực tế, nhận diện từ đệm VI/EN, đếm ngắt
        deliveryAnalyzer                            quãng, phát hiện lặp từ.
        .ts
─────  ──────────────────  ──────────────────────  ───────────────────────────────────────────────────────────────────────────────
  4     src/lib/speech/     Frontend (Tạo mới)      Abstraction bọc Web Speech API an toàn, có cơ chế fallback khi không có STT.
        speechRecognizer
        .ts
─────  ──────────────────  ──────────────────────  ───────────────────────────────────────────────────────────────────────────────
  5     src/hooks/          Frontend (Tạo mới)      Custom hook tích hợp Pipeline A kết nối micro, VAD và tính DeliveryMetrics.
        useDeliveryVoice
        Recorder.ts
─────  ──────────────────  ──────────────────────  ───────────────────────────────────────────────────────────────────────────────
  6     app/                Backend (Chỉnh sửa)     Thêm các endpoint Pull MQ: /evaluations/queue và /evaluations/pull/{task_id}.
        presentation/
        api/routers/
        catalog.py
─────  ──────────────────  ──────────────────────  ───────────────────────────────────────────────────────────────────────────────
  7     app/                Backend (Tạo mới)       Module quản lý hàng đợi Redis Pull MQ (Enqueue, Dequeue, Worker Consumer).
        infrastructure/
        queue/
        eval_queue.py
─────  ──────────────────  ──────────────────────  ───────────────────────────────────────────────────────────────────────────────
  8     src/app/(user)/     Frontend (Chỉnh sửa)    Tích hợp giao diện khóa câu một chiều (lockedQuestionIds), hiển thị
        questions/[id]/                             DeliveryMetrics và kết nối Pull MQ.
        QuestionDetailCl
        ient.tsx
─────  ──────────────────  ──────────────────────  ───────────────────────────────────────────────────────────────────────────────
  9     src/i18n/           Frontend (Chỉnh sửa)    Bổ sung từ điển song ngữ cho phân tích giọng nói và nhãn trạng thái hàng đợi.
        locales/{vi,en}/
        questions.ts

———

## PHẦN 3: ĐÁP ỨNG QUY TẮC PHÁT TRIỂN (AGENTS.MD)

- Quy tắc tuyệt đối: Không tự ý chạy npm run build, không tự ý chạy test và không mở UI headless browser nhằm tiết kiệm tối đa
  token.

- Quy trình thực thi: Sau khi hoàn thành việc chỉnh sửa mã nguồn và cấu hình hàng đợi, bàn giao tường minh để người dùng trực tiếp
  mở trình duyệt thử nghiệm và phản hồi.
