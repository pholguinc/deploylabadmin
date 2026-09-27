export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Utility to get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) {
    return decodeURIComponent(match[2]);
  }
  return null;
}

/**
 * Utility to set a cookie
 */
export function setCookie(name: string, value: string, days?: number) {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie =
    name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

/**
 * Utility to delete a cookie
 */
export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/**
 * Custom fetch wrapper that adds Authorization header
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getCookie("accessToken");

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Set default content type if not provided and body is present
  if (
    options.body &&
    !(headers as Record<string, string>)["Content-Type"] &&
    typeof options.body === "string"
  ) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  // endpoint comes with a leading slash usually, but let's be careful.
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle common errors like 401
  if (response.status === 401) {
    deleteCookie("accessToken");
    deleteCookie("refreshToken");

    // Redirect to login if running in browser
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.dispatchEvent(new CustomEvent("unauthorized"));
    }
  }

  return response;
}
