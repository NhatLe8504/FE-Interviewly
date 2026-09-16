"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Keyboard, Mic } from "lucide-react";
import {
  MOCK_DOMAINS,
  MOCK_LANGUAGES,
  MOCK_LEVELS,
  MOCK_ROLES,
} from "@/mock/practice";
import type { PracticeMode } from "@/types/practice";
import shared from "./shared.module.css";

export default function PracticeSetupPage() {
  const router = useRouter();
  const [domainId, setDomainId] = useState(MOCK_DOMAINS[0].id);
  const [roleId, setRoleId] = useState(MOCK_ROLES[0].id);
  const [levelId, setLevelId] = useState(MOCK_LEVELS[2].id);
  const [languageId, setLanguageId] = useState(MOCK_LANGUAGES[0].id);
  const [mode, setMode] = useState<PracticeMode>("text");

  const roles = useMemo(
    () => MOCK_ROLES.filter((role) => role.domainId === domainId),
    [domainId],
  );

  const startInterview = () => {
    const sessionId = `sess-${Date.now().toString(36)}`;
    router.push(`/practice/${sessionId}`);
  };

  return (
    <div className={shared.shell}>
      <p className={shared.eyebrow}>Practice setup</p>
      <h1 className={shared.title}>Configure your session</h1>
      <p className={shared.sub}>
        Pick a role, level, and language. The AI coach builds a scored mock
        interview around your choices.
      </p>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Target position</h2>
        <p className={shared.cardHint}>
          Questions adapt to the domain, role, and seniority you select.
        </p>

        <div className={shared.grid2}>
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Domain</span>
            <select
              className={shared.select}
              value={domainId}
              onChange={(event) => {
                const next = event.target.value;
                setDomainId(next);
                const first = MOCK_ROLES.find((role) => role.domainId === next);
                if (first) setRoleId(first.id);
              }}
            >
              {MOCK_DOMAINS.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.label}
                </option>
              ))}
            </select>
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Job role</span>
            <select
              className={shared.select}
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Experience level</span>
            <select
              className={shared.select}
              value={levelId}
              onChange={(event) => setLevelId(event.target.value)}
            >
              {MOCK_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Language</span>
            <select
              className={shared.select}
              value={languageId}
              onChange={(event) => setLanguageId(event.target.value)}
            >
              {MOCK_LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Answer mode</h2>
        <p className={shared.cardHint}>
          Type your answers, or speak and let voice-to-text transcribe them.
        </p>

        <div className={shared.modeGrid}>
          <button
            type="button"
            onClick={() => setMode("text")}
            aria-pressed={mode === "text"}
            className={`${shared.modeCard} ${mode === "text" ? shared.modeOn : ""}`}
          >
            <span className={shared.modeIcon}>
              <Keyboard size={20} />
            </span>
            <span>
              <span className={shared.modeName}>Text</span>
              <span className={shared.modeDesc}>
                Write answers at your own pace. Best for structuring logic.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("voice")}
            aria-pressed={mode === "voice"}
            className={`${shared.modeCard} ${mode === "voice" ? shared.modeOn : ""}`}
          >
            <span className={shared.modeIcon}>
              <Mic size={20} />
            </span>
            <span>
              <span className={shared.modeName}>Voice</span>
              <span className={shared.modeDesc}>
                Speak naturally. Includes pace and hesitation analysis.
              </span>
            </span>
          </button>
        </div>

        <div className={shared.actions}>
          <button type="button" onClick={startInterview} className={shared.primaryBtn}>
            Start interview
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

