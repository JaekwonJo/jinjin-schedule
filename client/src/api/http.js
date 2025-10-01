const API_BASE = process.env.REACT_APP_API_BASE || '';

const defaultHeaders = {
  'Content-Type': 'application/json'
};

async function request(path, options = {}) {
  const { headers = {}, body, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...defaultHeaders,
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.error || response.statusText || '요청 처리 중 문제가 발생했어요.';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export default request;
