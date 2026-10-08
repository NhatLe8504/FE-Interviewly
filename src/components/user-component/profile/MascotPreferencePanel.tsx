"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useMascot } from "@/context/MascotContext";
import { MASCOTS, getMascot, getMascotSheets, type MascotId } from "@/lib/mascots";
import { profileApi } from "@/services/profileApi";
import styles from "./mascotPreference.module.css";

export function MascotPreferencePanel() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const { mascotId, setSavedMascot } = useMascot();
  const [savingId, setSavingId] = useState<MascotId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function chooseMascot(selected: MascotId) {
    if (!user || savingId || selected === mascotId) return;
    setSavingId(selected);
    setError(null);
    setSaved(false);
    try {
      const profile = await profileApi.updateProfile({ mascot_id: selected });
      setSavedMascot(getMascot(profile.mascot_id).id, profile.user_id);
      setSaved(true);
    } catch {
      setError(locale === "vi" ? "Chưa lưu được lựa chọn. Vui lòng thử lại." : "Could not save your choice. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="mascot-preference-title" aria-busy={savingId !== null}>
      <div className={styles.heading}>
        <div>
          <h2 id="mascot-preference-title">{locale === "vi" ? "Một người bạn nhỏ, theo cách của bạn." : "A little companion, your way."}</h2>
          <p className="portal-help-text">
            {locale === "vi"
              ? "Chọn nhân vật đồng hành. Lựa chọn được lưu vào tài khoản và dùng chung trên toàn hệ thống."
              : "Choose your companion. Your choice is saved to your account and shared across the app."}
          </p>
        </div>
        <PageMascot className={styles.mascot} />
      </div>
      <div className={styles.options} role="group" aria-label={locale === "vi" ? "Chọn nhân vật đồng hành" : "Choose a mascot"}>
        {MASCOTS.map((mascot) => (
          <Button
            key={mascot.id}
            type="button"
            variant="home-choice"
            className={styles.option}
            aria-pressed={mascot.id === mascotId}
            disabled={savingId !== null || !user}
            onClick={() => void chooseMascot(mascot.id)}
          >
            {mascot.id !== "none" ? (
              <span
                aria-hidden="true"
                className={styles.preview}
                style={{ backgroundImage: `url("${getMascotSheets(mascot.id).directions}")`, imageRendering: mascot.id === "fox-pixel" ? "pixelated" : "auto" }}
              />
            ) : <span className={styles.hiddenPreview} aria-hidden="true">—</span>}
            <span>{mascot.name[locale]}</span>
          </Button>
        ))}
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : (
        <p className="portal-help-text" role="status" aria-live="polite">
          {savingId !== null
            ? locale === "vi" ? "Đang lưu lựa chọn…" : "Saving your choice…"
            : saved
              ? locale === "vi" ? "Đã lưu. Nhân vật đã được đồng bộ trên mọi trang." : "Saved. Your mascot is now synced across the app."
              : locale === "vi" ? "Bấm vào một nhân vật để chọn và lưu." : "Select a character to save your choice."}
        </p>
      )}
    </section>
  );
}
