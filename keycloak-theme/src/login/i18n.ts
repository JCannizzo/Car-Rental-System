import { i18nBuilder } from "keycloakify/login";
import type { KcContext } from "./KcContext";

const { useI18n, ofTypeI18n } = i18nBuilder.withThemeName<"carrental">().build();

type I18n = typeof ofTypeI18n;

export { useI18n };
export type { I18n };

export type { KcContext };
