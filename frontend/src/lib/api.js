/**
 * Shared API configuration module.
 * Replaces duplicated inline API URL construction across AuthContext, Login, and other pages.
 */
const API = (() => {
  const configured = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');
  const host = window.location.hostname;
  const isRemoteHost = host !== 'localhost' && host !== '127.0.0.1';
  const isDevTunnelHost = /-4000\..*\.devtunnels\.ms$/i.test(host);

  if (isDevTunnelHost) {
    return `${window.location.origin}/api`;
  }

  if (isRemoteHost && (!configured || configured.includes('localhost') || configured.includes('127.0.0.1'))) {
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }

  // For local development — use relative path so craco proxy forwards /api -> backend
  if (!configured && (host === 'localhost' || host === '127.0.0.1')) {
    return `/api`;
  }

  return `${configured || window.location.origin}/api`;
})();

/** Check if debug logging is enabled */
export const DEBUG = process.env.REACT_APP_DEBUG === 'true';

/** Debug logger — no-ops when DEBUG is off */
export function debugLog(tag, message, ...args) {
  if (DEBUG) {
    console.log(`[${tag}]`, message, ...args);
  }
}

export function debugError(tag, message, ...args) {
  if (DEBUG) {
    console.error(`[${tag}]`, message, ...args);
  }
}

export default API;

