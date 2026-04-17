import { useEffect } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Template(props: TemplateProps<KcContext, I18n>) {
  const {
    displayInfo = false,
    displayMessage = true,
    displayRequiredFields = false,
    headerNode,
    socialProvidersNode = null,
    infoNode = null,
    documentTitle,
    kcContext,
    i18n,
    doUseDefaultCss,
    children,
  } = props;

  const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;
  const { realm, auth, url, message, isAppInitiatedAction } = kcContext;

  useEffect(() => {
    document.title =
      documentTitle ?? msgStr("loginTitle", realm.displayName || realm.name);
  }, [documentTitle, msgStr, realm.displayName, realm.name]);

  const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

  if (!isReadyToRender) {
    return null;
  }

  const brandTitle = realm.displayName || realm.name;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="mb-6 flex items-center gap-2 text-foreground">
        <span className="text-lg font-semibold tracking-tight">
          {brandTitle}
        </span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          {enabledLanguages.length > 1 ? (
            <div
              id="kc-locale"
              className="flex justify-end text-xs text-muted-foreground"
            >
              <div id="kc-locale-wrapper">
                <div id="kc-locale-dropdown" className="relative">
                  <button
                    type="button"
                    tabIndex={1}
                    id="kc-current-locale-link"
                    className="underline-offset-2 hover:underline"
                    aria-label={msgStr("languages")}
                    aria-haspopup="true"
                    aria-expanded="false"
                    aria-controls="language-switch1"
                  >
                    {currentLanguage.label}
                  </button>
                  <ul
                    role="menu"
                    tabIndex={-1}
                    aria-labelledby="kc-current-locale-link"
                    aria-activedescendant=""
                    id="language-switch1"
                    className="absolute right-0 mt-1 hidden min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                  >
                    {enabledLanguages.map(({ languageTag, label, href }, i) => (
                      <li key={languageTag} role="none">
                        <a
                          role="menuitem"
                          id={`language-${i + 1}`}
                          className="block rounded px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                          href={href}
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {!(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (
            <CardTitle id="kc-page-title" className="text-xl">
              {headerNode}
            </CardTitle>
          ) : (
            <div id="kc-username" className="flex items-center gap-2">
              <label id="kc-attempted-username" className="text-sm font-medium">
                {auth.attemptedUsername}
              </label>
              <a
                id="reset-login"
                href={url.loginRestartFlowUrl}
                aria-label={msgStr("restartLoginTooltip")}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                {msg("restartLoginTooltip")}
              </a>
            </div>
          )}

          {displayRequiredFields ? (
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">*</span>{" "}
              {msg("requiredFields")}
            </p>
          ) : null}
        </CardHeader>

        <CardContent>
          {displayMessage &&
          message !== undefined &&
          (message.type !== "warning" || !isAppInitiatedAction) ? (
            <div
              className={cn(
                "mb-4 rounded-md border px-3 py-2 text-sm",
                message.type === "error" &&
                  "border-destructive/30 bg-destructive/10 text-destructive",
                message.type === "warning" &&
                  "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                message.type === "success" &&
                  "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                message.type === "info" &&
                  "border-border bg-muted text-muted-foreground",
              )}
              role="alert"
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: kcSanitize(message.summary),
                }}
              />
            </div>
          ) : null}

          <div id="kc-content">
            <div id="kc-content-wrapper" className="space-y-4">
              {children}

              {auth !== undefined && auth.showTryAnotherWayLink ? (
                <form
                  id="kc-select-try-another-way-form"
                  action={url.loginAction}
                  method="post"
                >
                  <input type="hidden" name="tryAnotherWay" value="on" />
                  <a
                    href="#"
                    id="try-another-way"
                    className="text-sm underline-offset-2 hover:underline"
                    onClick={(event) => {
                      (
                        document.forms.namedItem(
                          "kc-select-try-another-way-form",
                        ) as HTMLFormElement | null
                      )?.requestSubmit();
                      event.preventDefault();
                      return false;
                    }}
                  >
                    {msg("doTryAnotherWay")}
                  </a>
                </form>
              ) : null}

              {socialProvidersNode}
            </div>
          </div>
        </CardContent>

        {displayInfo ? (
          <CardFooter id="kc-info">
            <div id="kc-info-wrapper" className="w-full text-center">
              {infoNode}
            </div>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
