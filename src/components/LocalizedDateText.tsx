import React from "react";

type LocalizedDateMode = "date" | "time" | "datetime";

const getLocale = (language?: string) =>
  language?.toLowerCase().startsWith("ar") ? "ar-EG" : "en-US";

const defaultOptionsByMode: Record<LocalizedDateMode, Intl.DateTimeFormatOptions> = {
  date: {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
  time: {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  },
  datetime: {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  },
};

const toDate = (value: string | number | Date | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsedDate = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const formatLocalizedDateValue = (
  value: string | number | Date | null | undefined,
  language: string,
  mode: LocalizedDateMode = "datetime",
  options?: Intl.DateTimeFormatOptions,
) => {
  const parsedDate = toDate(value);

  if (!parsedDate) {
    return "";
  }

  return new Intl.DateTimeFormat(getLocale(language), {
    ...defaultOptionsByMode[mode],
    ...options,
  }).format(parsedDate);
};

export const localizedDateTextStyle: React.CSSProperties = {
  display: "inline-block",
  whiteSpace: "nowrap",
  unicodeBidi: "plaintext",
};

interface LocalizedDateTextProps {
  value: string | number | Date | null | undefined;
  language: string;
  mode?: LocalizedDateMode;
  fallback?: React.ReactNode;
  options?: Intl.DateTimeFormatOptions;
  style?: React.CSSProperties;
  className?: string;
}

const LocalizedDateText: React.FC<LocalizedDateTextProps> = ({
  value,
  language,
  mode = "datetime",
  fallback = "-",
  options,
  style,
  className,
}) => {
  const formattedValue = formatLocalizedDateValue(value, language, mode, options);

  if (!formattedValue) {
    return <>{fallback}</>;
  }

  return (
    <span dir="auto" className={className} style={{ ...localizedDateTextStyle, ...style }}>
      {formattedValue}
    </span>
  );
};

export default LocalizedDateText;
