import request from './http';

export async function loginRequest(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: { username, password }
  });
}

export async function fetchCurrentUser(token) {
  return request('/api/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
