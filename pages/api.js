/**
 * Maddad API Client
 * =================
 * Thin fetch()-based wrapper around the Maddad FastAPI backend.
 *
 * Configuration
 * -------------
 * Configure API base via one of:
 * 1) window.MADDAD_API_BASE
 * 2) <meta name="maddad-api-base" content="...">
 * 3) localStorage["maddadApiBase"]
 *
 * When the backend is unreachable, every function falls back to the
 * localStorage-based data that the original script.js already uses, so
 * the app continues to work even without a running server.
 */

const MADDAD_API_BASES = {
  local: "http://localhost:8000",
  dev: "https://maddad-graduationproject.onrender.com",
  prod: "https://maddad-graduationproject.onrender.com"
};

function resolveApiBase() {
  const runtimeOverride =
    window.MADDAD_API_BASE ||
    document.querySelector('meta[name="maddad-api-base"]')?.content ||
    localStorage.getItem("maddadApiBase");

  if (runtimeOverride) {
    return runtimeOverride.replace(/\/+$/, "");
  }

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return MADDAD_API_BASES.local;
  }

  if (host.includes("dev") || host.includes("staging")) {
    return MADDAD_API_BASES.dev;
  }

  return MADDAD_API_BASES.prod;
}

const MADDAD_API_BASE = resolveApiBase();

/* -----------------------------------------------------------------------
   Token helpers (stored in sessionStorage so it is cleared on tab close)
----------------------------------------------------------------------- */

function apiGetToken() {
  return sessionStorage.getItem("maddadToken") || null;
}

function apiSetToken(token) {
  sessionStorage.setItem("maddadToken", token);
}

function apiClearToken() {
  sessionStorage.removeItem("maddadToken");
}

/* -----------------------------------------------------------------------
   Low-level fetch wrapper
----------------------------------------------------------------------- */

async function apiFetch(path, options = {}) {
  const token = apiGetToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(MADDAD_API_BASE + path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch (_) {}
    const err = new Error(detail);
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) return null;
  return response.json();
}

/* -----------------------------------------------------------------------
   Auth API
----------------------------------------------------------------------- */

/**
 * Register a new parent account.
 * On success, stores the token and account info locally.
 *
 * @param {object} data – { email, password, child_name, child_age, child_gender }
 * @returns {Promise<object>} – TokenResponse from the API
 */
async function apiRegister(data) {
  const result = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  apiSetToken(result.access_token);
  _cacheAccount(result);
  return result;
}

/**
 * Log in with email and password.
 * On success, stores the token and account info locally.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} – TokenResponse from the API
 */
async function apiLogin(email, password) {
  const result = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  apiSetToken(result.access_token);
  _cacheAccount(result);
  return result;
}

/**
 * Log out – clear the local token and cached data.
 */
async function apiLogout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch (_) {
    // Ignore errors; we always clear the local state
  }
  apiClearToken();
  localStorage.removeItem("maddadLoggedIn");
  localStorage.removeItem("maddadAccount");
}

/* -----------------------------------------------------------------------
   Profile API
----------------------------------------------------------------------- */

/**
 * Fetch the current user's profile from the API.
 * Falls back to localStorage if the request fails.
 *
 * @returns {Promise<object>} – { email, child_name, child_age, child_gender, created_at }
 */
async function apiGetProfile() {
  try {
    const profile = await apiFetch("/api/profile");
    _cacheAccountFromProfile(profile);
    return profile;
  } catch (_) {
    return _localAccount();
  }
}

/**
 * Update the current user's profile.
 *
 * @param {object} data – { child_name?, child_age?, child_gender?, email? }
 * @returns {Promise<object>}
 */
async function apiUpdateProfile(data) {
  const profile = await apiFetch("/api/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  _cacheAccountFromProfile(profile);
  return profile;
}

/* -----------------------------------------------------------------------
   Questionnaire API
----------------------------------------------------------------------- */

/**
 * Submit the 10-question assessment and receive an ML prediction.
 *
 * @param {string} age_group – '12-18' | '19-24' | '25-30' | '31-36'
 * @param {string} gender    – 'ذكر' | 'أنثى'
 * @param {object} answers   – { skill_key: 0|1, … }
 * @returns {Promise<object>} – QuestionnaireSubmitResponse
 */
async function apiSubmitQuestionnaire(age_group, gender, answers) {
  return apiFetch("/api/questionnaire/submit", {
    method: "POST",
    body: JSON.stringify({ age_group, gender, answers }),
  });
}

/**
 * Fetch the list of past assessments.
 * Falls back to the maddadHistory localStorage array if the request fails.
 *
 * @returns {Promise<Array>}
 */
async function apiGetHistory() {
  try {
    return await apiFetch("/api/questionnaire/history");
  } catch (_) {
    return JSON.parse(localStorage.getItem("maddadHistory")) || [];
  }
}

/* -----------------------------------------------------------------------
   Followup API
----------------------------------------------------------------------- */

/**
 * Submit follow-up answers and receive a refined ML prediction.
 *
 * @param {number} result_id        – ID returned by apiSubmitQuestionnaire
 * @param {object} followup_answers – updated skill answers from follow-up
 * @returns {Promise<object>} – FollowupSubmitResponse
 */
async function apiSubmitFollowup(result_id, followup_answers) {
  return apiFetch("/api/followup/submit", {
    method: "POST",
    body: JSON.stringify({ result_id, followup_answers }),
  });
}

/* -----------------------------------------------------------------------
   Private helpers
----------------------------------------------------------------------- */

function _cacheAccount(tokenResponse) {
  const account = {
    childName: tokenResponse.child_name,
    childAge: tokenResponse.child_age,
    childGender: tokenResponse.child_gender,
    email: tokenResponse.email,
    createdAt: new Date().toLocaleDateString("ar-SA"),
  };
  localStorage.setItem("maddadAccount", JSON.stringify(account));
  localStorage.setItem("maddadLoggedIn", "true");
}

function _cacheAccountFromProfile(profile) {
  const existing = _localAccount();
  const account = {
    ...existing,
    childName: profile.child_name,
    childAge: profile.child_age,
    childGender: profile.child_gender,
    email: profile.email,
  };
  localStorage.setItem("maddadAccount", JSON.stringify(account));
}

function _localAccount() {
  return JSON.parse(localStorage.getItem("maddadAccount")) || {};
}
