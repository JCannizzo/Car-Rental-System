import { Fragment, useEffect } from "react";
import { assert } from "keycloakify/tools/assert";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import {
  useUserProfileForm,
  getButtonToDisplayForMultivaluedAttributeField,
  type FormAction,
  type FormFieldError,
} from "keycloakify/login/lib/useUserProfileForm";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { Attribute } from "keycloakify/login/KcContext";
import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export default function UserProfileFormFields(
  props: UserProfileFormFieldsProps<KcContext, I18n>,
) {
  const {
    kcContext,
    i18n,
    kcClsx,
    onIsFormSubmittableValueChange,
    doMakeUserConfirmPassword,
    BeforeField,
    AfterField,
  } = props;

  const { advancedMsg } = i18n;

  const {
    formState: { formFieldStates, isFormSubmittable },
    dispatchFormAction,
  } = useUserProfileForm({
    kcContext,
    i18n,
    doMakeUserConfirmPassword,
  });

  useEffect(() => {
    onIsFormSubmittableValueChange(isFormSubmittable);
  }, [isFormSubmittable, onIsFormSubmittableValueChange]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const params = new URLSearchParams(hash);
    for (const attribute of formFieldStates.map((s) => s.attribute)) {
      const raw = params.get(attribute.name);
      if (raw === null) continue;
      dispatchFormAction({
        action: "update",
        name: attribute.name,
        valueOrValues: raw,
      });
    }
    // Only run once on mount: seed initial values from the URL fragment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupNameRef = { current: "" };

  return (
    <>
      {formFieldStates.map(({ attribute, displayableErrors, valueOrValues }) => {
        const isHidden =
          attribute.annotations.inputType === "hidden" ||
          (attribute.name === "password-confirm" && !doMakeUserConfirmPassword);

        return (
          <Fragment key={attribute.name}>
            <GroupLabel
              attribute={attribute}
              groupNameRef={groupNameRef}
              i18n={i18n}
            />
            {BeforeField !== undefined && (
              <BeforeField
                attribute={attribute}
                dispatchFormAction={dispatchFormAction}
                displayableErrors={displayableErrors}
                valueOrValues={valueOrValues}
                kcClsx={kcClsx}
                i18n={i18n}
              />
            )}
            <div
              className={cn("space-y-1.5", isHidden && "hidden")}
            >
              <Label htmlFor={attribute.name}>
                {advancedMsg(attribute.displayName ?? "")}
                {attribute.required && (
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                )}
              </Label>

              {attribute.annotations.inputHelperTextBefore !== undefined && (
                <p
                  id={`form-help-text-before-${attribute.name}`}
                  className="text-xs text-muted-foreground"
                  aria-live="polite"
                >
                  {advancedMsg(attribute.annotations.inputHelperTextBefore)}
                </p>
              )}

              <InputFieldByType
                attribute={attribute}
                valueOrValues={valueOrValues}
                displayableErrors={displayableErrors}
                dispatchFormAction={dispatchFormAction}
                i18n={i18n}
              />

              <FieldErrors
                attribute={attribute}
                displayableErrors={displayableErrors}
                fieldIndex={undefined}
              />

              {attribute.annotations.inputHelperTextAfter !== undefined && (
                <p
                  id={`form-help-text-after-${attribute.name}`}
                  className="text-xs text-muted-foreground"
                  aria-live="polite"
                >
                  {advancedMsg(attribute.annotations.inputHelperTextAfter)}
                </p>
              )}

              {AfterField !== undefined && (
                <AfterField
                  attribute={attribute}
                  dispatchFormAction={dispatchFormAction}
                  displayableErrors={displayableErrors}
                  valueOrValues={valueOrValues}
                  kcClsx={kcClsx}
                  i18n={i18n}
                />
              )}
            </div>
          </Fragment>
        );
      })}
    </>
  );
}

function GroupLabel(props: {
  attribute: Attribute;
  groupNameRef: { current: string };
  i18n: I18n;
}) {
  const { attribute, groupNameRef, i18n } = props;
  const { advancedMsg } = i18n;

  if (attribute.group?.name === groupNameRef.current) {
    return null;
  }

  groupNameRef.current = attribute.group?.name ?? "";

  if (groupNameRef.current === "") {
    return null;
  }

  assert(attribute.group !== undefined);

  const displayHeader = attribute.group.displayHeader ?? "";
  const displayDescription = attribute.group.displayDescription ?? "";
  const headerText =
    displayHeader !== "" ? advancedMsg(displayHeader) : attribute.group.name;

  return (
    <div
      className="mt-2 border-t border-border pt-4"
      {...Object.fromEntries(
        Object.entries(attribute.group.html5DataAnnotations).map(
          ([key, value]) => [`data-${key}`, value],
        ),
      )}
    >
      <p
        id={`header-${attribute.group.name}`}
        className="text-sm font-semibold"
      >
        {headerText}
      </p>
      {displayDescription !== "" ? (
        <p
          id={`description-${attribute.group.name}`}
          className="mt-1 text-xs text-muted-foreground"
        >
          {advancedMsg(displayDescription)}
        </p>
      ) : null}
    </div>
  );
}

function FieldErrors(props: {
  attribute: Attribute;
  displayableErrors: FormFieldError[];
  fieldIndex: number | undefined;
}) {
  const { attribute, fieldIndex } = props;
  const displayableErrors = props.displayableErrors.filter(
    (error) => error.fieldIndex === fieldIndex,
  );

  if (displayableErrors.length === 0) {
    return null;
  }

  return (
    <p
      id={`input-error-${attribute.name}${fieldIndex === undefined ? "" : `-${fieldIndex}`}`}
      className="text-xs text-destructive"
      aria-live="polite"
    >
      {displayableErrors.map(({ errorMessage }, i, arr) => (
        <Fragment key={i}>
          {errorMessage}
          {arr.length - 1 !== i && <br />}
        </Fragment>
      ))}
    </p>
  );
}

type InputFieldByTypeProps = {
  attribute: Attribute;
  valueOrValues: string | string[];
  displayableErrors: FormFieldError[];
  dispatchFormAction: React.Dispatch<FormAction>;
  i18n: I18n;
};

function InputFieldByType(props: InputFieldByTypeProps) {
  const { attribute, valueOrValues } = props;

  switch (attribute.annotations.inputType) {
    case "hidden":
      return (
        <input
          type="hidden"
          name={attribute.name}
          value={Array.isArray(valueOrValues) ? valueOrValues[0] : valueOrValues}
        />
      );
    case "textarea":
      return <TextareaField {...props} />;
    case "select":
    case "multiselect":
      return <SelectField {...props} />;
    default: {
      if (valueOrValues instanceof Array) {
        return (
          <div className="space-y-2">
            {valueOrValues.map((_, i) => (
              <InputField key={i} {...props} fieldIndex={i} />
            ))}
          </div>
        );
      }

      if (attribute.name === "password" || attribute.name === "password-confirm") {
        return (
          <PasswordWrapper i18n={props.i18n} passwordInputId={attribute.name}>
            <InputField {...props} fieldIndex={undefined} />
          </PasswordWrapper>
        );
      }

      return <InputField {...props} fieldIndex={undefined} />;
    }
  }
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
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-r-md"
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

function resolveInputType(attribute: Attribute): string {
  const { inputType } = attribute.annotations;
  if (typeof inputType === "string" && inputType.startsWith("html5-")) {
    return inputType.slice(6);
  }
  if (attribute.name === "password" || attribute.name === "password-confirm") {
    return "password";
  }
  if (attribute.name === "email") {
    return "email";
  }
  return typeof inputType === "string" ? inputType : "text";
}

function InputField(
  props: InputFieldByTypeProps & { fieldIndex: number | undefined },
) {
  const {
    attribute,
    fieldIndex,
    dispatchFormAction,
    valueOrValues,
    i18n,
    displayableErrors,
  } = props;
  const { advancedMsgStr } = i18n;

  const value = (() => {
    if (fieldIndex !== undefined) {
      assert(valueOrValues instanceof Array);
      return valueOrValues[fieldIndex];
    }
    assert(typeof valueOrValues === "string");
    return valueOrValues;
  })();

  const hasError =
    displayableErrors.find((error) => error.fieldIndex === fieldIndex) !==
    undefined;

  return (
    <>
      <Input
        type={resolveInputType(attribute)}
        id={
          fieldIndex === undefined
            ? attribute.name
            : `${attribute.name}-${fieldIndex}`
        }
        name={attribute.name}
        value={value}
        aria-invalid={hasError}
        disabled={attribute.readOnly}
        autoComplete={attribute.autocomplete}
        placeholder={
          attribute.annotations.inputTypePlaceholder === undefined
            ? undefined
            : advancedMsgStr(attribute.annotations.inputTypePlaceholder)
        }
        pattern={attribute.annotations.inputTypePattern}
        maxLength={
          attribute.annotations.inputTypeMaxlength === undefined
            ? undefined
            : parseInt(`${attribute.annotations.inputTypeMaxlength}`)
        }
        minLength={
          attribute.annotations.inputTypeMinlength === undefined
            ? undefined
            : parseInt(`${attribute.annotations.inputTypeMinlength}`)
        }
        max={attribute.annotations.inputTypeMax}
        min={attribute.annotations.inputTypeMin}
        step={attribute.annotations.inputTypeStep}
        className={cn(
          (attribute.name === "password" ||
            attribute.name === "password-confirm") &&
            "pr-9",
        )}
        onChange={(event) =>
          dispatchFormAction({
            action: "update",
            name: attribute.name,
            valueOrValues: (() => {
              if (fieldIndex !== undefined) {
                assert(valueOrValues instanceof Array);
                return valueOrValues.map((existing, i) =>
                  i === fieldIndex ? event.target.value : existing,
                );
              }
              return event.target.value;
            })(),
          })
        }
        onBlur={() =>
          dispatchFormAction({
            action: "focus lost",
            name: attribute.name,
            fieldIndex,
          })
        }
      />
      {fieldIndex !== undefined && valueOrValues instanceof Array ? (
        <>
          <FieldErrors
            attribute={attribute}
            displayableErrors={displayableErrors}
            fieldIndex={fieldIndex}
          />
          <AddRemoveButtons
            attribute={attribute}
            values={valueOrValues}
            fieldIndex={fieldIndex}
            dispatchFormAction={dispatchFormAction}
            i18n={i18n}
          />
        </>
      ) : null}
    </>
  );
}

function AddRemoveButtons(props: {
  attribute: Attribute;
  values: string[];
  fieldIndex: number;
  dispatchFormAction: React.Dispatch<Extract<FormAction, { action: "update" }>>;
  i18n: I18n;
}) {
  const { attribute, values, fieldIndex, dispatchFormAction, i18n } = props;
  const { msg } = i18n;
  const { hasAdd, hasRemove } = getButtonToDisplayForMultivaluedAttributeField({
    attribute,
    values,
    fieldIndex,
  });

  return (
    <div className="flex gap-3 text-xs">
      {hasRemove ? (
        <button
          type="button"
          className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
          onClick={() =>
            dispatchFormAction({
              action: "update",
              name: attribute.name,
              valueOrValues: values.filter((_, i) => i !== fieldIndex),
            })
          }
        >
          {msg("remove")}
        </button>
      ) : null}
      {hasAdd ? (
        <button
          type="button"
          className="text-foreground underline underline-offset-2 hover:text-primary"
          onClick={() =>
            dispatchFormAction({
              action: "update",
              name: attribute.name,
              valueOrValues: [...values, ""],
            })
          }
        >
          {msg("addValue")}
        </button>
      ) : null}
    </div>
  );
}

function TextareaField(props: InputFieldByTypeProps) {
  const { attribute, dispatchFormAction, valueOrValues, displayableErrors } =
    props;
  assert(typeof valueOrValues === "string");
  const hasError = displayableErrors.length > 0;

  return (
    <textarea
      id={attribute.name}
      name={attribute.name}
      value={valueOrValues}
      aria-invalid={hasError}
      disabled={attribute.readOnly}
      cols={
        attribute.annotations.inputTypeCols === undefined
          ? undefined
          : parseInt(`${attribute.annotations.inputTypeCols}`)
      }
      rows={
        attribute.annotations.inputTypeRows === undefined
          ? 4
          : parseInt(`${attribute.annotations.inputTypeRows}`)
      }
      maxLength={
        attribute.annotations.inputTypeMaxlength === undefined
          ? undefined
          : parseInt(`${attribute.annotations.inputTypeMaxlength}`)
      }
      className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
      onChange={(event) =>
        dispatchFormAction({
          action: "update",
          name: attribute.name,
          valueOrValues: event.target.value,
        })
      }
      onBlur={() =>
        dispatchFormAction({
          action: "focus lost",
          name: attribute.name,
          fieldIndex: undefined,
        })
      }
    />
  );
}

function SelectField(props: InputFieldByTypeProps) {
  const { attribute, dispatchFormAction, valueOrValues, i18n, displayableErrors } =
    props;
  const { advancedMsgStr } = i18n;
  const isMulti = attribute.annotations.inputType === "multiselect";
  const hasError = displayableErrors.length > 0;

  const options: string[] = (() => {
    const { inputOptionsFromValidation } = attribute.annotations;
    if (inputOptionsFromValidation !== undefined) {
      const validator = (attribute.validators as Record<string, { options?: string[] }>)[
        inputOptionsFromValidation
      ];
      if (validator?.options !== undefined) {
        return validator.options;
      }
    }
    return attribute.validators.options?.options ?? [];
  })();

  const labelForOption = (value: string) => {
    const key = attribute.annotations.inputOptionLabelsI18nPrefix;
    if (key !== undefined) {
      return advancedMsgStr(`${key}.${value}`);
    }
    const labels = attribute.annotations.inputOptionLabels;
    if (typeof labels === "object" && labels !== null && value in labels) {
      return advancedMsgStr((labels as Record<string, string>)[value]);
    }
    return value;
  };

  return (
    <select
      id={attribute.name}
      name={attribute.name}
      multiple={isMulti}
      value={isMulti ? (valueOrValues as string[]) : (valueOrValues as string)}
      aria-invalid={hasError}
      disabled={attribute.readOnly}
      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-xs transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
      onChange={(event) =>
        dispatchFormAction({
          action: "update",
          name: attribute.name,
          valueOrValues: isMulti
            ? Array.from(event.target.selectedOptions).map((o) => o.value)
            : event.target.value,
        })
      }
      onBlur={() =>
        dispatchFormAction({
          action: "focus lost",
          name: attribute.name,
          fieldIndex: undefined,
        })
      }
    >
      {!isMulti && !attribute.required ? <option value="" /> : null}
      {options.map((option) => (
        <option key={option} value={option}>
          {labelForOption(option)}
        </option>
      ))}
    </select>
  );
}
