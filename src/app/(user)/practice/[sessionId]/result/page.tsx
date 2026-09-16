import Link from "next/link";
import { ArrowRight, Check, FileText, RotateCcw } from "lucide-react";
import { mockResult, mockSessionMeta } from "@/mock/practice";
import shared from "../../shared.module.css";

function RubricBar({ name, value }: { name: string; value: number }) {
  return (
    <div className={shared.barRow}>
      <span className={shared.barName}>{name}</span>
      <div className={shared.barTrack}>
        <div className={shared.barFill} style={{ width: `${value}%` }} />
      </div>
      <span className={shared.barValue}>{value}</span>
    </div>
  );
}

export default async function InterviewResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const meta = mockSessionMeta(sessionId);
  const result = mockResult(sessionId);
  const radius = 62;
  const circle = 2 * Math.PI * radius;
  const filled = (result.overall / 100) * circle;

  return (
    <div className={shared.shell}>
      <p className={shared.eyebrow}>Interview result</p>
      <h1 className={shared.title}>How you did</h1>
      <p className={shared.sub}>
        {meta.roleLabel} · {meta.levelLabel} · {meta.duration} · {meta.startedAt}
      </p>

      <div className={shared.card}>
        <div className={shared.scoreHero}>
          <div className={shared.ring}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r={radius} fill="none" stroke="rgba(106,72,49,0.12)" strokeWidth="12" />
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="url(#scoreGrade)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${filled} ${circle}`}
                transform="rotate(-90 75 75)"
              />
              <defs>
                <linearGradient id="scoreGrade" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#d98236" />
                  <stop offset="100%" stopColor="#8b4513" />
                </linearGradient>
              </defs>
            </svg>
            <div className={shared.ringCenter}>
              <span className={shared.ringValue}>{result.overall}</span>
              <span className={shared.ringLabel}>Overall</span>
            </div>
          </div>
          <p className={shared.verdict}>{result.verdict}</p>
        </div>

        <RubricBar name="Clarity" value={result.rubric.clarity} />
        <RubricBar name="Logical structure" value={result.rubric.logic} />
        <RubricBar name="Concrete examples" value={result.rubric.examples} />
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Coach feedback</h2>
        <p className={shared.cardHint}>What worked in this session.</p>
        <ul className={shared.checkList}>
          {result.feedback.map((item) => (
            <li key={item} className={shared.checkItem}>
              <span className={shared.checkIcon}>
                <Check size={13} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Improve next time</h2>
        <p className={shared.cardHint}>Three concrete actions for your next session.</p>
        <ul className={shared.checkList}>
          {result.improvements.map((item) => (
            <li key={item} className={shared.checkItem}>
              <span className={shared.checkIcon}>
                <ArrowRight size={13} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Speech analysis</h2>
        <p className={shared.cardHint}>{result.speech.summary}</p>
        <div className={shared.speechGrid}>
          <div className={shared.speechStat}>
            <div className={shared.speechNum}>{result.speech.paceWpm}</div>
            <div className={shared.speechCap}>Words / min · {result.speech.paceLabel}</div>
          </div>
          <div className={shared.speechStat}>
            <div className={shared.speechNum}>{result.speech.fillerWords}</div>
            <div className={shared.speechCap}>Filler words</div>
          </div>
          <div className={shared.speechStat}>
            <div className={shared.speechNum}>{result.speech.longPauses}</div>
            <div className={shared.speechCap}>Long pauses</div>
          </div>
        </div>
      </div>

      <div className={shared.actions}>
        <Link href={`/practice/${sessionId}/report`} className={shared.primaryBtn}>
          <FileText size={15} />
          View full report
        </Link>
        <Link href="/practice" className={shared.ghostBtn}>
          <RotateCcw size={14} />
          Practice again
        </Link>
      </div>
    </div>
  );
}




