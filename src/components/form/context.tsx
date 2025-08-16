import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { TextField } from "./text-field";
import { NumberField } from "./number-field";
import { DateTimeField } from "./date-time-field";
import { BooleanField } from "./bool-field";
import { SelectField } from "./select-field";
import { ColorField } from "./color-field";
import { ArrayField } from "./array-field";
import { CommaSeperatedField } from "./comma-seperated-field";
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
    DateTimeField,
    BooleanField,
    SelectField,
    ColorField,
    ArrayField,
    CommaSeperatedField,
  },
  formComponents: {},
});

export function setFormValues(form: any, object: any) {
  Object.entries(object).forEach(([key, value]) => {
    form.setFieldValue(key, value);
  });
}
