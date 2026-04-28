export const getErrorMessage = (error: any, fallbackMessage: string) => {
  const responseMessage =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.data?.message;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

export const getApiFieldErrors = (error: any) =>
  Array.isArray(error?.response?.data?.errors) ? error.response.data.errors : [];
