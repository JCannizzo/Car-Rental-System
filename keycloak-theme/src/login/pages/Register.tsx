import { useState, useLayoutEffect } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import { clsx } from "keycloakify/tools/clsx";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type RegisterProps = PageProps<
  Extract<KcContext, { pageId: "register.ftl" }>,
  I18n
> & {
  UserProfileFormFields: LazyOrNot<
    (props: UserProfileFormFieldsProps) => React.JSX.Element
  >;
  doMakeUserConfirmPassword: boolean;
};

export default function Register(props: RegisterProps) {
  const {
    kcContext,
    i18n,
    doUseDefaultCss,
    Template,
    classes,
    UserProfileFormFields,
    doMakeUserConfirmPassword,
  } = props;

  const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

  const {
    messageHeader,
    url,
    messagesPerField,
    recaptchaRequired,
    recaptchaVisible,
    recaptchaSiteKey,
    recaptchaAction,
    termsAcceptanceRequired,
  } = kcContext;

  const { msg, msgStr, advancedMsg } = i18n;

  const [isFormSubmittable, setIsFormSubmittable] = useState(false);
  const [areTermsAccepted, setAreTermsAccepted] = useState(false);

  useLayoutEffect(() => {
    (window as unknown as Record<string, unknown>)["onSubmitRecaptcha"] = () => {
      (
        document.getElementById("kc-register-form") as HTMLFormElement | null
      )?.requestSubmit();
    };

    return () => {
      delete (window as unknown as Record<string, unknown>)["onSubmitRecaptcha"];
    };
  }, []);

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      headerNode={
        messageHeader !== undefined
          ? advancedMsg(messageHeader)
          : msg("registerTitle")
      }
      displayMessage={messagesPerField.exists("global")}
      displayRequiredFields
    >
      <form
        id="kc-register-form"
        action={url.registrationAction}
        method="post"
        className="space-y-4"
      >
        <UserProfileFormFields
          kcContext={kcContext}
          i18n={i18n}
          kcClsx={kcClsx}
          onIsFormSubmittableValueChange={setIsFormSubmittable}
          doMakeUserConfirmPassword={doMakeUserConfirmPassword}
        />

        {termsAcceptanceRequired ? (
          <TermsAcceptance
            i18n={i18n}
            kcClsx={kcClsx}
            messagesPerField={messagesPerField}
            areTermsAccepted={areTermsAccepted}
            onAreTermsAcceptedValueChange={setAreTermsAccepted}
          />
        ) : null}

        {recaptchaRequired &&
        (recaptchaVisible || recaptchaAction === undefined) ? (
          <div
            className="g-recaptcha"
            data-size="compact"
            data-sitekey={recaptchaSiteKey}
            data-action={recaptchaAction}
          />
        ) : null}

        <div className="flex items-center justify-between pt-1">
          <a
            href={url.loginUrl}
            className="text-sm text-muted-foreground underline-offset-2 hover:underline hover:text-foreground"
          >
            {msg("backToLogin")}
          </a>
        </div>

        {recaptchaRequired && !recaptchaVisible && recaptchaAction !== undefined ? (
          <Button
            className={clsx("w-full g-recaptcha")}
            size="lg"
            data-sitekey={recaptchaSiteKey}
            data-callback="onSubmitRecaptcha"
            data-action={recaptchaAction}
            type="submit"
          >
            {msg("doRegister")}
          </Button>
        ) : (
          <Button
            disabled={
              !isFormSubmittable ||
              (termsAcceptanceRequired && !areTermsAccepted)
            }
            className="w-full"
            size="lg"
            type="submit"
          >
            {msgStr("doRegister")}
          </Button>
        )}
      </form>
    </Template>
  );
}

function TermsAcceptance(props: {
  i18n: I18n;
  kcClsx: KcClsx;
  messagesPerField: Pick<
    KcContext["messagesPerField"],
    "existsError" | "get"
  >;
  areTermsAccepted: boolean;
  onAreTermsAcceptedValueChange: (areTermsAccepted: boolean) => void;
}) {
  const { i18n, messagesPerField, areTermsAccepted, onAreTermsAcceptedValueChange } =
    props;
  const { msg } = i18n;

  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3 text-sm">
      <div>
        <p className="font-medium">{msg("termsTitle")}</p>
        <div
          id="kc-registration-terms-text"
          className="mt-1 text-muted-foreground"
        >
          {msg("termsText")}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="termsAccepted"
          name="termsAccepted"
          className="size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring/30"
          checked={areTermsAccepted}
          onChange={(e) => onAreTermsAcceptedValueChange(e.target.checked)}
          aria-invalid={messagesPerField.existsError("termsAccepted")}
        />
        <Label htmlFor="termsAccepted" className="cursor-pointer text-sm">
          {msg("acceptTerms")}
        </Label>
      </div>
      {messagesPerField.existsError("termsAccepted") ? (
        <span
          id="input-error-terms-accepted"
          aria-live="polite"
          className="text-xs text-destructive"
          dangerouslySetInnerHTML={{
            __html: kcSanitize(messagesPerField.get("termsAccepted")),
          }}
        />
      ) : null}
    </div>
  );
}
