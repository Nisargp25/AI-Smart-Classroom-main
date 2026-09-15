/**
 * Shared API configuration module.
 * Replaces duplicated inline API URL construction across AuthContext, Login, and other pages.
 */
const API = (() => {
  const configured = (process.env.REACT_APP_BACKEND_URL || '')
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');
  const host = window.location.hostname;
  const isRemoteHost = host !== 'localhost' && host !== '127.0.0.1';
  const isDevTunnelHost = /-4000\..*\.devtunnels\.ms$/i.test(host);

  if (isDevTunnelHost) {
    return `${window.location.origin}/api`;
  }

    // Use the current origin when the frontend is reached remotely. The dev-server
    // proxy (and tunnel) exposes the backend through the frontend host.
    if (isRemoteHost && (!configured || configured.includes('localhost') || configured.includes('127.0.0.1'))) {
      return `/api`;
    }

    // For local development, let craco proxy /api to the backend.
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

