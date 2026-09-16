"use client";

import { use } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mic, Send, Square } from "lucide-react";
import { MOCK_SCRIPT, MOCK_TRANSCRIPT_SEED, mockSessionMeta } from "@/mock/practice";
import type { TranscriptTurn } from "@/types/practice";
import shared from "../shared.module.css";

const MOCK_TRANSCRIPTION =
  "So in that project I owned the checkout flow end to end. The situation was a failing payment step, my task was to cut drop-offs, I split the form and added retries, and conversions rose twelve percent.";

let turnCounter = 0;
function nextId(prefix: string) {
  turnCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${turnCounter}`;
}

export default function InterviewRoomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const meta = mockSessionMeta(sessionId);
  const [step, setStep] = useState(0);
  const [turns, setTurns] = useState<TranscriptTurn[]>(() => [...MOCK_TRANSCRIPT_SEED, { id: "seed-q1", speaker: "ai", text: MOCK_SCRIPT[0].text }]);
  const [answer, setAnswer] = useState("");
  const [finished, setFinished] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const historyRef = useRef<HTMLDivElement>(null);

  const question = MOCK_SCRIPT[Math.min(step, MOCK_SCRIPT.length - 1)];

  useEffect(() => {
    historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight });
  }, [turns]);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const stopRecording = () => {
    setRecording(false);
    setAnswer((prev) => (prev ? `${prev} ${MOCK_TRANSCRIPTION}` : MOCK_TRANSCRIPTION));
  };

  const sendAnswer = () => {
    const text = answer.trim();
    if (!text || finished) return;
    const current = MOCK_SCRIPT[Math.min(step, MOCK_SCRIPT.length - 1)];
    const userTurn: TranscriptTurn = { id: nextId("user"), speaker: "user", text };
    const followTurn: TranscriptTurn = { id: nextId("ai"), speaker: "ai", text: current.followUp };
    if (step >= MOCK_SCRIPT.length - 1) {
      setTurns((prev) => [
        ...prev,
        userTurn,
        followTurn,
        {
          id: nextId("ai"),
          speaker: "ai",
          text: "That wraps our scored rounds. I am preparing your result now.",
        },
      ]);
      setFinished(true);
    } else {
      const next = MOCK_SCRIPT[step + 1];
      setTurns((prev) => [
        ...prev,
        userTurn,
        followTurn,
        { id: nextId("ai"), speaker: "ai", text: next.text },
      ]);
      setStep(step + 1);
    }
    setAnswer("");
    setSeconds(0);
  };

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className={shared.shell}>
      <p className={shared.eyebrow}>Interview room</p>
      <h1 className={shared.title}>{meta.roleLabel} mock</h1>
      <p className={shared.sub}>
        Answer each question, then the coach follows up based on what you said.
      </p>

      <div className={shared.sessionMeta}>
        <span className={shared.tag}>{meta.domainLabel}</span>
        <span className={shared.tag}>{meta.levelLabel}</span>
        <span className={shared.tag}>{meta.languageLabel}</span>
        <span className={`${shared.tag} ${shared.tagStrong}`}>
          Question {Math.min(step + 1, MOCK_SCRIPT.length)} of {MOCK_SCRIPT.length}
        </span>
      </div>

      <div className={shared.card}>
        <p className={shared.questionLead}>Current question</p>
        <p className={shared.questionText}>{question.text}</p>
        <span className={shared.questionCat}>{question.category}</span>

        {question.behavioral && question.starTip && (
          <div className={shared.starBox}>
            <p className={shared.starTitle}>STAR guidance</p>
            <p className={shared.starText}>{question.starTip}</p>
          </div>
        )}

        <div className={shared.composer}>
          <textarea
            className={shared.textarea}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer here, or record your voice…"
            disabled={finished}
          />
          <div className={shared.composerRow}>
            <button
              type="button"
              disabled={finished}
              onClick={() => (recording ? stopRecording() : (setSeconds(0), setRecording(true)))}
              className={`${shared.recBtn} ${recording ? shared.recOn : ""}`}
            >
              <span className={shared.recDot} />
              {recording ? "Stop" : "Record"}
            </button>
            {recording && <span className={shared.timer}>{clock} recording…</span>}
            {!finished ? (
              <button type="button" onClick={sendAnswer} className={shared.primaryBtn}>
                Send answer
                <Send size={15} />
              </button>
            ) : (
              <Link href={`/practice/${sessionId}/result`} className={shared.primaryBtn}>
                Finish and view result
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Conversation</h2>
        <p className={shared.cardHint}>Full transcript of this session so far.</p>
        <div ref={historyRef} className={shared.history}>
          {turns.map((turn) => (
            <div
              key={turn.id}
              className={`${shared.turn} ${turn.speaker === "ai" ? shared.turnAi : shared.turnUser}`}
            >
              <span className={shared.who}>{turn.speaker === "ai" ? "AI coach" : "You"}</span>
              <div className={shared.bubble}>{turn.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={shared.actions}>
        <Link href={`/practice/${sessionId}/result`} className={shared.ghostBtn}>
          <Square size={14} />
          End interview
        </Link>
        <span className={shared.tag}>
          <Mic size={12} /> Voice-to-text ready
        </span>
      </div>
    </div>
  );
}


