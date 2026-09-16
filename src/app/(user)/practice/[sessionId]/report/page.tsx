"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { mockResult, mockSessionMeta } from "@/mock/practice";
import shared from "../../shared.module.css";

export default function PracticeReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const meta = mockSessionMeta(sessionId);
  const result = mockResult(sessionId);

  return (
    <div className={shared.shell}>
      <div className={shared.reportHead}>
        <div>
          <p className={shared.eyebrow}>Session report</p>
          <h1 className={shared.title}>Interview report</h1>
          <p className={shared.sub}>
            {meta.roleLabel} · {meta.domainLabel} · {meta.levelLabel} · {meta.languageLabel} ·{" "}
            {meta.startedAt}
          </p>
        </div>
        <div className={`${shared.actions} ${shared.noPrint}`} style={{ marginTop: 0 }}>
          <button type="button" onClick={() => window.print()} className={shared.primaryBtn}>
            <Printer size={15} />
            Download PDF
          </button>
        </div>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Score summary</h2>
        <p className={shared.cardHint}>{result.verdict}</p>
        <table className={shared.table}>
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Score</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Overall</td>
              <td>{result.overall} / 100</td>
              <td>Weighted across the rubric below.</td>
            </tr>
            <tr>
              <td>Clarity</td>
              <td>{result.rubric.clarity} / 100</td>
              <td>Headline-first answers, little rambling.</td>
            </tr>
            <tr>
              <td>Logical structure</td>
              <td>{result.rubric.logic} / 100</td>
              <td>Reasoning holds; transitions can tighten.</td>
            </tr>
            <tr>
              <td>Concrete examples</td>
              <td>{result.rubric.examples} / 100</td>
              <td>Add measurable outcomes to every story.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Speech quality</h2>
        <p className={shared.cardHint}>{result.speech.summary}</p>
        <table className={shared.table}>
          <tbody>
            <tr>
              <td>Pace</td>
              <td>
                {result.speech.paceWpm} wpm · {result.speech.paceLabel}
              </td>
            </tr>
            <tr>
              <td>Filler words</td>
              <td>{result.speech.fillerWords} detected</td>
            </tr>
            <tr>
              <td>Long pauses</td>
              <td>{result.speech.longPauses} detected</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Transcript</h2>
        <p className={shared.cardHint}>Complete record of the scored session.</p>
        <div className={shared.history} style={{ maxHeight: "none" }}>
          {result.transcript.map((turn) => (
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

      <div className={`${shared.actions} ${shared.noPrint}`}>
        <Link href={`/practice/${sessionId}/result`} className={shared.ghostBtn}>
          <ArrowLeft size={14} />
          Back to result
        </Link>
      </div>
    </div>
  );
}






