import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { KcPage } from "./kc.gen";

const root = document.getElementById("root");
if (!root) {
  throw new Error("#root element not found");
}

createRoot(root).render(
  <StrictMode>
    {window.kcContext ? (
      <KcPage kcContext={window.kcContext} />
    ) : (
      <h1>No Keycloak context — this app is a Keycloak theme.</h1>
    )}
  </StrictMode>,
);
