// api settings
export const API_HOST = import.meta.env.VITE_API_HOST ?? "localhost";
export const API_PORT = import.meta.env.VITE_API_PORT ?? 3000;
export const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL ?? "http";
export const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH ?? "api";

// app settings
export const APP_HOST = import.meta.env.VITE_APP_HOST ?? "localhost";
export const APP_PORT = import.meta.env.VITE_APP_PORT ?? 5000;
export const APP_PROTOCOL = import.meta.env.VITE_APP_PROTOCOL ?? "http";
export const APP_BASE_PATH = import.meta.env.VITE_APP_BASE_PATH ?? "";

// language
export const DEFAULT_LANGUAGE = localStorage.getItem("lang") ?? "en";
