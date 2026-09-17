import { practice } from "./practice";
import { home } from "./home";
import { common, header } from "./common";
import { profile } from "./profile";
import { settings } from "./settings";
import { questions } from "./questions";
import { pricing } from "./pricing";
import type { Translations } from "../../types";

export const vi: Translations = {
  common,
  home,
  practice,
  header,
  profile,
  settings,
  questions,
  pricing,
};

export { home, practice, common, header, profile, settings, questions, pricing };
export default vi;
