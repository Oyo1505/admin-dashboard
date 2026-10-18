/**
 * Shared styles for form fields rendered on the white form panel.
 * Border gray-500 on white keeps a ≥ 3:1 contrast (WCAG 1.4.11),
 * focus ring is always visible (WCAG 2.4.7).
 */
export const FORM_FIELD_CLASS =
  'w-full rounded-[4px] border border-gray-500 bg-white px-[10px] text-[15px] text-background placeholder:text-gray-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-1';

export const FORM_LABEL_CLASS = 'text-left w-full text-md';

export const FORM_ERROR_CLASS = 'w-full text-left text-red-700 text-xs';

/** id of the error message linked to a field through aria-describedby */
export const fieldErrorId = (fieldId: string) => `${fieldId}-error`;
