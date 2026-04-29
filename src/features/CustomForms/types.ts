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
  description?: string | null;
  placeholder?: string | null;
  required: boolean;
  options: CustomFormOption[];
  settings?: CustomFormFieldSettings;
}

export interface CustomFormSettings {
  submitLabel?: string;
  successTitle?: string;
  successDescription?: string;
}

export interface CustomFormCreator {
  id: string;
  email: string;
  displayName?: string | null;
}

export interface CustomForm {
  id: string;
  title: string;
  description?: string;
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
  description?: string;
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
