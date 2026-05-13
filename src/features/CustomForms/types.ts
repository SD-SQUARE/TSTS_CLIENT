export type CustomFormFieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "date"
  | "dropdown"
  | "single_choice"
  | "multiple_choice";

export interface CustomFormOption {
  id: string;
  label: string;
  label_en?: string;
  label_ar?: string;
}

export interface CustomFormFieldSettings {
  min?: number;
  max?: number;
  minSelections?: number;
  maxSelections?: number;
}

export interface CustomFormField {
  id: string;
  type: CustomFormFieldType;
  label: string;
  label_en?: string;
  label_ar?: string;
  description?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  placeholder?: string | null;
  placeholder_en?: string | null;
  placeholder_ar?: string | null;
  required: boolean;
  options: CustomFormOption[];
  settings?: CustomFormFieldSettings;
}

export interface CustomFormSettings {
  submitLabel?: string;
  submitLabel_en?: string;
  submitLabel_ar?: string;
  successTitle?: string;
  successTitle_en?: string;
  successTitle_ar?: string;
  successDescription?: string;
  successDescription_en?: string;
  successDescription_ar?: string;
}

export interface CustomFormCreator {
  id: string;
  email: string;
  displayName?: string | null;
}

export interface CustomForm {
  id: string;
  title: string;
  title_en?: string;
  title_ar?: string;
  description?: string;
  description_en?: string;
  description_ar?: string;
  fields: CustomFormField[];
  settings?: CustomFormSettings;
  isGlobal: boolean;
  ticketId?: string | null;
  token: string;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  creator?: CustomFormCreator | null;
}

export interface CustomFormPayload {
  title: string;
  title_en?: string;
  title_ar?: string;
  description?: string;
  description_en?: string;
  description_ar?: string;
  fields: CustomFormField[];
  settings?: CustomFormSettings;
  isGlobal?: boolean;
  ticketId?: string | null;
}

export interface CustomFormResponseColumn {
  key: string;
  title: string;
  type: string;
}

export interface CustomFormResponseRow {
  id: string;
  responder: string;
  responderEmail: string;
  submittedAt: string;
  createdAt: string;
  answers: Record<string, unknown>;
  rawData: Record<string, unknown>;
}

export interface CustomFormResponsesPayload {
  form: CustomForm;
  columns: CustomFormResponseColumn[];
  responses: CustomFormResponseRow[];
  meta: {
    total: number;
  };
}

export interface CustomFormShareLinkPayload {
  token: string;
  expiresAt: string;
  expiresInHours: number;
}
