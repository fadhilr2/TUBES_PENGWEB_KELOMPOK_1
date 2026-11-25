const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  constructor(message, status, code, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  let requestBody;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }
  if (!['GET', 'HEAD'].includes(method)) {
    const csrf = await request('/auth/csrf', { signal });
    headers['X-CSRF-Token'] = csrf.data.token;
  }
  let response;
  try {
    response = await fetch(base + path, {
      method,
      credentials: 'include',
      headers,
      body: requestBody,
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(
      'API tidak dapat dihubungi. Pastikan backend dan database berjalan.',
      0,
      'NETWORK_ERROR',
    );
  }
  if (response.status === 204) return { data: null };
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    let message = `API gagal merespons (${response.status}).`;
    if (payload?.error?.message) {
      message = payload.error.message;
    }
    if (Array.isArray(payload?.error?.fields)) {
      const details = payload.error.fields.join(' ');
      if (details) {
        message = details;
      }
    }
    throw new ApiError(message, response.status, payload?.error?.code, payload?.error?.fields);
  }
  if (!payload || !Object.hasOwn(payload, 'data'))
    throw new ApiError('Respons API tidak valid.', 0, 'INVALID_RESPONSE');
  return payload;
}

async function list(path, { signal, query = {} } = {}) {
  const rows = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const params = new URLSearchParams(query);
    params.set('page', String(page));
    params.set('pageSize', '100');
    const result = await request(`${path}?${params}`, { signal });
    for (const row of result.data) {
      rows.push(row);
    }
    hasMore = rows.length < result.meta.total;
    if (hasMore && result.data.length === 0) {
      throw new ApiError('Pagination API tidak konsisten.', 0, 'INVALID_PAGINATION');
    }
    page++;
  }
  return rows;
}

export const api = { request, list };
