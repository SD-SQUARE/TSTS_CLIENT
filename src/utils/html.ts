export const stripHtml = (content?: string | null) => {
  if (!content) {
    return "";
  }

  if (typeof window !== "undefined" && typeof window.DOMParser !== "undefined") {
    const parsed = new window.DOMParser().parseFromString(content, "text/html");
    return parsed.body.textContent?.replace(/\s+/g, " ").trim() || "";
  }

  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};
