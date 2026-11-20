/**
 * A short-lived cookie that remembers where to go after the sign-in link is
 * clicked. It's httpOnly (JavaScript can't read it) and its value is checked
 * again with safeNextPath() before it's used.
 */
export const RETURN_TO_COOKIE = "ascent_return_to";
export const RETURN_TO_MAX_AGE_SECONDS = 60 * 60; // matches the link's 1-hour expiry
