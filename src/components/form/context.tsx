import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { ArrayField } from "./array-field";
import { BooleanField } from "./bool-field";
import { ColorField } from "./color-field";
import { CommaSeperatedField } from "./comma-seperated-field";
import { DateTimeField } from "./date-time-field";
import { NumberField } from "./number-field";
import { SelectField } from "./select-field";
import { MultiSelectField } from "./multi-select-field";
import { TextField } from "./text-field";
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
    MultiSelectField,
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
