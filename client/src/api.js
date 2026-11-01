// client/src/api.js
//
// The single place the frontend talks to the backend.
//
// Every request goes through here so that:
//   - the base URL is defined once (Vite proxies /api to the PHP server)
//   - credentials (the session cookie) are always sent
//   - JSON is parsed once, in one place
//   - a failed request throws an Error with a readable message
//
// If the API URL ever changes (different port, production host), this is the
// only file that needs to change.

const BASE = '/api';

async function request(path, options = {}) {
  const url = BASE + path;

  const init = {
    method: options.method || 'GET',
    credentials: 'include', // session cookie
    headers: { 'Content-Type': 'application/json', ...options.headers },
  };

  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    throw new Error('Network error: ' + err.message);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path, body) => request(path, { method: 'DELETE', body }),
};
