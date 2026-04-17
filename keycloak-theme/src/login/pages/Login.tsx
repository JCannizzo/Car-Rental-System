import { useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { useScript } from "keycloakify/login/pages/Login.useScript";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export default function Login(
  props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>,
) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const {
    social,
    realm,
    url,
    usernameHidden,
    login,
    auth,
    registrationDisabled,
    messagesPerField,
    enableWebAuthnConditionalUI,
    authenticators,
  } = kcContext;

  const { msg, msgStr } = i18n;

  const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
  const webAuthnButtonId = "authenticateWebAuthnButton";

  useScript({ webAuthnButtonId, kcContext, i18n });

  const hasCredentialError = messagesPerField.existsError("username", "password");
  const credentialErrorMessage = hasCredentialError
    ? messagesPerField.getFirstError("username", "password")
    : null;

  const usernameLabel = !realm.loginWithEmailAllowed
    ? msg("username")
    : !realm.registrationEmailAsUsername
      ? msg("usernameOrEmail")
      : msg("email");

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!hasCredentialError}
      headerNode={msg("loginAccountTitle")}
      displayInfo={
        realm.password && realm.registrationAllowed && !registrationDisabled
      }
      infoNode={
        <div id="kc-registration-container">
          <div id="kc-registration" className="text-sm text-muted-foreground">
            <span>
              {msg("noAccount")}{" "}
              <a
                tabIndex={8}
                href={url.registrationUrl}
                className="font-medium text-foreground underline underline-offset-2"
              >
                {msg("doRegister")}
              </a>
            </span>
          </div>
        </div>
      }
      socialProvidersNode={
        realm.password &&
        social?.providers !== undefined &&
        social.providers.length !== 0 ? (
          <div id="kc-social-providers" className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">
                {msg("identity-provider-login-label")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <ul className="space-y-2">
              {social.providers.map((p) => (
                <li key={p.alias}>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    type="button"
                  >
                    <a id={`social-${p.alias}`} href={p.loginUrl}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: kcSanitize(p.displayName),
                        }}
                      />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null
      }
    >
      <div id="kc-form">
        <div id="kc-form-wrapper">
          {realm.password && (
            <form
              id="kc-form-login"
              onSubmit={() => {
                setIsLoginButtonDisabled(true);
                return true;
              }}
              action={url.loginAction}
              method="post"
              className="space-y-4"
            >
              {!usernameHidden && (
                <div className="space-y-1.5">
                  <Label htmlFor="username">{usernameLabel}</Label>
                  <Input
                    tabIndex={2}
                    id="username"
                    name="username"
                    defaultValue={login.username ?? ""}
                    type="text"
                    autoFocus
                    autoComplete={
                      enableWebAuthnConditionalUI
                        ? "username webauthn"
                        : "username"
                    }
                    aria-invalid={hasCredentialError}
                  />
                  {hasCredentialError && !usernameHidden ? (
                    <p
                      id="input-error"
                      role="alert"
                      aria-live="polite"
                      className="text-xs text-destructive"
                      dangerouslySetInnerHTML={{
                        __html: kcSanitize(credentialErrorMessage ?? ""),
                      }}
                    />
                  ) : null}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="password">{msg("password")}</Label>
                <PasswordWrapper i18n={i18n} passwordInputId="password">
                  <Input
                    tabIndex={3}
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={hasCredentialError}
                    className="pr-9"
                  />
                </PasswordWrapper>
                {usernameHidden && hasCredentialError ? (
                  <p
                    id="input-error"
                    role="alert"
                    aria-live="polite"
                    className="text-xs text-destructive"
                    dangerouslySetInnerHTML={{
                      __html: kcSanitize(credentialErrorMessage ?? ""),
                    }}
                  />
                ) : null}
              </div>

              {(realm.rememberMe && !usernameHidden) || realm.resetPasswordAllowed ? (
                <div className="flex items-center justify-between text-xs">
                  {realm.rememberMe && !usernameHidden ? (
                    <label className="flex items-center gap-2 text-muted-foreground">
                      <input
                        tabIndex={5}
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        defaultChecked={!!login.rememberMe}
                        className="size-3.5 rounded border-input text-primary focus:ring-2 focus:ring-ring/30"
                      />
                      {msg("rememberMe")}
                    </label>
                  ) : (
                    <span />
                  )}
                  {realm.resetPasswordAllowed ? (
                    <a
                      tabIndex={6}
                      href={url.loginResetCredentialsUrl}
                      className="font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {msg("doForgotPassword")}
                    </a>
                  ) : null}
                </div>
              ) : null}

              <div id="kc-form-buttons">
                <input
                  type="hidden"
                  id="id-hidden-input"
                  name="credentialId"
                  value={auth.selectedCredential}
                />
                <Button
                  tabIndex={7}
                  disabled={isLoginButtonDisabled}
                  name="login"
                  id="kc-login"
                  type="submit"
                  size="lg"
                  className="w-full"
                >
                  {msgStr("doLogIn")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {enableWebAuthnConditionalUI ? (
        <>
          <form id="webauth" action={url.loginAction} method="post">
            <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
            <input type="hidden" id="authenticatorData" name="authenticatorData" />
            <input type="hidden" id="signature" name="signature" />
            <input type="hidden" id="credentialId" name="credentialId" />
            <input type="hidden" id="userHandle" name="userHandle" />
            <input type="hidden" id="error" name="error" />
          </form>

          {authenticators !== undefined &&
          authenticators.authenticators.length !== 0 ? (
            <form id="authn_select">
              {authenticators.authenticators.map((authenticator, i) => (
                <input
                  key={i}
                  type="hidden"
                  name="authn_use_chk"
                  readOnly
                  value={authenticator.credentialId}
                />
              ))}
            </form>
          ) : null}

          <Button
            asChild
            id={webAuthnButtonId}
            variant="outline"
            size="lg"
            className="mt-4 w-full"
          >
            <input
              type="button"
              value={msgStr("passkey-doAuthenticate")}
            />
          </Button>
        </>
      ) : null}
    </Template>
  );
}

function PasswordWrapper(props: {
  i18n: I18n;
  passwordInputId: string;
  children: React.ReactNode;
}) {
  const { i18n, passwordInputId, children } = props;
  const { msgStr } = i18n;
  const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({
    passwordInputId,
  });

  return (
    <div className="relative">
      {children}
      <button
        type="button"
        className={cn(
          "absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-r-md",
        )}
        aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
        aria-controls={passwordInputId}
        onClick={toggleIsPasswordRevealed}
      >
        {isPasswordRevealed ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
