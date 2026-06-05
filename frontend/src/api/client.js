const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('tf_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('tf_token');
      localStorage.removeItem('tf_user');
      window.location.href = '/login';
    }
    throw new ApiError(
      data?.message || data?.errors?.[0]?.msg || `Request failed (${res.status})`,
      res.status,
      data
    );
  }

  return { data, status: res.status };
}

const client = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body) => request(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
};

export default client;
