# PLAN FE — Interview Question Engine UI/UX: Setup tinh chinh + Bank selection + Reroll

> Muc tieu: UI cho nguoi dung tuy chinh sau hon (so luot hoi, chon cau hoi tu ngan hang,
> random hoac manual), moderation cho user-created practice, va hien thi intent thay vi nguyen van.
> Pham vi: worktree FE `nhatle08052004n` — `Interview_Coach_SRC_CODE/FE`.

---

## 1. Hien trang (da khao sat)

### Da co san — giu nguyen / tai su dung
- Trang setup `src/app/(user)/practice/setup/[interviewId]/page.tsx` (moi tao): chon stage + mode.
- `QuestionBasket` + `QuestionExplorerClient` (`src/app/(user)/questions/`): da co basket chon cau hoi.
- `catalogApi.ts` / RTK Query `interviewApiSlice`: da goi `GET /catalog/questions` (can bo sung filters).
- `useRealtimeVoiceInterview` hook: da co WebSocket + STT + audio queue + barge-in (dung lai).
- `types/catalog.ts` (`QuestionOut`) va `types/interview.ts` (`StartSessionIn`).
- sessionStorage metadata pattern: `session_metadata_<id>` + `active_session_metadata`.

### Dang do dang / thieu (can lam)
- Setup page chua co: so luot hoi per stage (min/max), nguon cau hoi (auto/random/manual), filters.
- Chua co UI moderation cho cau hoi AI sinh ra trong practice nguoi dung tao.
- Chua co UI "chon cau hoi tu ngan hang" ngay trong setup (phai sang /questions roi quay lai).
- Interview room hien hien thi so cau co dinh (`totalQuestions`) — chua dong theo budget.

---

## 2. Nguyen tac UX

1. **Question source toggle** o moi stage: `Auto random` (mac dinh) | `Tu chon` | `Mixed`.
   - Auto: FE chi hien "X cau hoi se duoc bốc ngau nhien" + nut `Re-roll` (gọi BE sampling).
   - Manual: mo drawer ngan hang, chon cau hoi vao basket; hien badge trang thai duyet.
2. **Budget control**: slider `min_turns` / `max_turns` (vi du 1-3) cho moi stage; tong turn
   duoc tinh realtime va hien thi o muc "Tong so luot hoi: ~N".
3. **Moderation UI**: trong practice nguoi dung tao, tab "Cau hoi AI dang cho duyet" voi nut
   Approve / Reject / Edit intent; trang thai `pending/approved/rejected` ro rang.
4. **Intent, khong nguyen van**: interview room chi hien `Chu de: <intent/topic label>`
   (neu BE tra `question_context`), khong hien truoc cau hoi goc.
5. **Fallback mock**: giu mock data cu khi API chua xong de UI khong bi vỡ.

---

## 3. Types & API client changes

### `types/catalog.ts`
- `QuestionOut` them: `moderation_status`, `source`, `intent`, `difficulty`, `practice_id`.
- Them `QuestionModerationStatus = "pending" | "approved" | "rejected"`.

### `types/interview.ts`
- `StageConfigIn`: `{ stage_key, source_mode, min_turns, max_turns, selected_question_ids?, difficulty_filter?, type_filter? }`.
- `StartSessionIn` them: `stage_configs`, `total_turn_mode`, `practice_id`.
- `QuestionIntentContext`: `{ intent_id, question_id, topic_label, stage_key }`.

### `catalogApi.ts` / `interviewApi.ts`
- `getQuestions(filters)` — them `practice_id`, `moderation_status`, `type`, `difficulty`.
- `generatePracticeQuestions(practiceId, {count})` -> danh sach pending.
- `moderatePracticeQuestion(questionId, {action, reason})`.
- `rerollQuestion(sessionId, stageKey, selectionId)`.

### `useRealtimeVoiceInterview` (can chinh nho)
- Gui `stage_configs` + `question_plan` trong `client_ready`.
- Xu ly event `question_context` + `question_rerolled`.
- Expose `rerollQuestion()` va `currentIntent`.

---

## 4. Setup page (`/practice/setup/[interviewId]`) — mo rong sidebar

Sidebar phai (sticky) thanh 4 khoi:
1. **Stage selection** (da co) + moi stage la 1 accordion:
   - `Question source`: segmented control `Auto` / `Tu chon` / `Mixed`.
   - `So luot hoi`: 2 slider min/max (1-5).
   - `Filter`: difficulty + type (chi cho Auto).
   - Nut `Chon cau hoi...` (manual) mo Drawer `QuestionBankDrawer`.
2. **Question plan preview**: danh sach moi stage -> so cau / nguon / (manual: ten intent).
3. **Mode + Start button** (da co).
4. **User-created practice**: them tab `AI draft questions` (pending) de duyet truoc khi start;
   neu con pending -> canh bao "Co cau hoi chua duyet, se bi loai khoi Auto random".

### Component moi
- `QuestionBankDrawer.tsx` — filter (domain/role/level/type) + search + basket + badge moderation.
- `StageConfigPanel.tsx` — accordion cau hinh 1 stage (source, budget, filters).
- `QuestionPlanPreview.tsx` — tom tat plan truoc khi start.
- `ModerationList.tsx` — danh sach pending cua practice (approve/reject/edit intent).
- `TurnBudgetSlider.tsx` — slider min/max co validation.

---

## 5. Session metadata (sessionStorage) schema moi
```ts
{
  roleLabel, companyName, domainLabel, levelLabel, languageLabel, mode,
  stage_configs: [
    { stage_key: "warmup", source_mode: "auto_random", min_turns: 1, max_turns: 2 },
    { stage_key: "technical", source_mode: "manual", min_turns: 2, max_turns: 2,
      selected_question_ids: [101, 204] },
    { stage_key: "closing", source_mode: "mixed", min_turns: 1, max_turns: 2,
      selected_question_ids: [301] }
  ],
  total_turn_mode: "auto",
  practice_id?: number,
  question_plan: [{ stage_key, question_id, topic_label }]  // tu BE response
}
```

---

## 6. Interview room changes

- `InterviewStagesTimeline`: doi counter tu "Cau hoi X/Y" sang "Luot X / ~Y" (budget-based);
  hien intent label cua cau hoi hien tai (tu `question_context`).
- Subtitle capsule: them dong nho `Chu de: <topic_label>` (khong hien nguyen van cau hoi goc).
- Them nut `Re-roll cau hoi` (icon refresh) khi `aiState === "listening"` — goi `rerollQuestion`.
- Khi het budget 1 stage -> tiep tuc dung logic `stage_change` hien co.

---

## 7. Practice creation flow (`/practice/new`) — can chinh
- Sau khi submit JD, thay vi tao `questionsList` client-side (dang mock), goi BE
  `POST /practices` + `POST /practices/{id}/questions/generate`.
- Hien man hinh moderation: danh sach cau hoi AI sinh (pending) + cho phep sua intent / approve / reject.
- Luu `practice_id` + `stage_configs` vao session metadata khi bat dau.

---

## 8. Testing / QA (FE)
- `npx tsc --noEmit` + `npm run build`.
- Manual checklist:
  - Setup 1 stage technical, mode manual, chon 3 cau -> start -> progress hien 1/1 stage, 3 luot.
  - Setup full 3 stages, budget 2-3 -> room hien tong turn du kien, `Re-roll` hoat dong.
  - User-created practice: generate 5 cau -> approve 3 -> auto random chi boc trong 3 approved.
  - Voice: barge-in + reroll + audio van chay; question_context hien dung topic.
- Giữ fallback mock khi BE chua merge (nhu cac service hien tai dang lam).

---

## 9. Files can tao / sua (FE)
| File | Hanh dong |
| --- | --- |
| `src/types/catalog.ts` | them moderation/source/intent fields |
| `src/types/interview.ts` | them StageConfigIn, QuestionIntentContext |
| `src/services/catalogApi.ts` | filters + moderate + generate endpoints |
| `src/services/interviewApi.ts` | stage_configs payload + reroll |
| `src/hooks/useRealtimeVoiceInterview.ts` | question_context/reroll handling |
| `src/app/(user)/practice/setup/[interviewId]/page.tsx` | mo rong sidebar accordion + plan preview |
| `src/app/(user)/practice/setup/[interviewId]/components/StageConfigPanel.tsx` | moi |
| `src/app/(user)/practice/setup/[interviewId]/components/QuestionBankDrawer.tsx` | moi |
| `src/app/(user)/practice/setup/[interviewId]/components/QuestionPlanPreview.tsx` | moi |
| `src/app/(user)/practice/setup/[interviewId]/components/ModerationList.tsx` | moi |
| `src/app/(user)/practice/[sessionId]/components/InterviewStagesTimeline.tsx` | budget + intent label |
| `src/app/(user)/practice/[sessionId]/page.tsx` | reroll button + intent display |
| `src/app/(user)/practice/new/page.tsx` | goi BE generate + moderation flow |

---

## 10. Thu tu trien khai (FE)
1. Types + API client (dong bo voi BE contracts truoc).
2. `StageConfigPanel` + `TurnBudgetSlider` (pure UI, mock data).
3. `QuestionBankDrawer` (tai su dung QuestionExplorer pattern + basket).
4. `QuestionPlanPreview` + integrate setup page.
5. `ModerationList` cho practice user-created.
6. Interview room: budget display + reroll + intent.
7. Build + QA checklist.
