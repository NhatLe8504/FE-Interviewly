export const INTERVIEW_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", speechLocale: "vi-VN" },
  { code: "en", label: "English", speechLocale: "en-US" },
  { code: "zh", label: "中文 · Chinese", speechLocale: "zh-CN" },
  { code: "es", label: "Español · Spanish", speechLocale: "es-ES" },
  { code: "fr", label: "Français · French", speechLocale: "fr-FR" },
  { code: "de", label: "Deutsch · German", speechLocale: "de-DE" },
  { code: "ja", label: "日本語 · Japanese", speechLocale: "ja-JP" },
  { code: "ko", label: "한국어 · Korean", speechLocale: "ko-KR" },
] as const;

export type InterviewLanguage = (typeof INTERVIEW_LANGUAGES)[number]["code"];

export function getInterviewLanguage(code: string) {
  return INTERVIEW_LANGUAGES.find((language) => language.code === code) ?? INTERVIEW_LANGUAGES[0];
}
