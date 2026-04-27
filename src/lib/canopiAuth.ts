"use client";

const AUTH_KEY = 'canopi_auth';
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function writeCookie(value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_KEY}=${value}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; samesite=lax`;
}

function clearCookie() {
  if (typeof document === 'undefined') return;
  const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const deletions = [
    `${AUTH_KEY}=; path=/; expires=${expires}; max-age=0; samesite=lax`,
    `${AUTH_KEY}=; path=/; expires=${expires}; max-age=0`,
    `${AUTH_KEY}=; path=/; max-age=0; samesite=lax`,
    `${AUTH_KEY}=; path=/; max-age=0`,
  ];

  deletions.forEach((cookie) => {
    document.cookie = cookie;
  });
}

export function setCanopiAuthClient(isAuthenticated: boolean) {
  if (typeof window === 'undefined') return;

  if (isAuthenticated) {
    localStorage.setItem(AUTH_KEY, 'true');
    sessionStorage.setItem(AUTH_KEY, 'true');
    writeCookie('true');
    return;
  }

  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  clearCookie();
}

export function clearCanopiAuthClient() {
  setCanopiAuthClient(false);
}
