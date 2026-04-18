import type { ExtendKcContext } from "keycloakify/login";

export type KcContextExtension = {
  // Add extra fields here if you want to ship custom FTL data.
  properties: {};
};

export type KcContextExtensionPerPage = {};

export type KcContext = ExtendKcContext<
  KcContextExtension,
  KcContextExtensionPerPage
>;
