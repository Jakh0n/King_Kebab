import Cookies from "js-cookie";

const COOKIE_OPTIONS = { expires: 1, path: "/", sameSite: "lax" as const };
const AUTH_KEYS = ["token", "position", "employeeId"] as const;

/** Login path — set NEXT_PUBLIC_BASE_PATH in production if using basePath */
export function getLoginPath(): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH;
  return base ? `${base.replace(/\/$/, "")}/login` : "/login";
}

function getFromStorage(key: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const fromCookie = Cookies.get(key);
  if (fromCookie) return fromCookie;
  return localStorage.getItem(key) ?? undefined;
}

function setInStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  Cookies.set(key, value, COOKIE_OPTIONS);
  localStorage.setItem(key, value);
}

function removeFromStorage(key: string): void {
  if (typeof window === "undefined") return;
  Cookies.remove(key);
  localStorage.removeItem(key);
}

export function getToken(): string | undefined {
  return getFromStorage("token");
}

export function getPosition(): string | undefined {
  return getFromStorage("position");
}

export function getEmployeeId(): string | undefined {
  return getFromStorage("employeeId");
}

export interface AuthData {
  token: string;
  position: string;
  employeeId?: string;
}

export function setAuth(data: AuthData): void {
  setInStorage("token", data.token);
  setInStorage("position", data.position);
  if (data.employeeId) {
    setInStorage("employeeId", data.employeeId);
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  AUTH_KEYS.forEach(removeFromStorage);
  sessionStorage.clear();
}
