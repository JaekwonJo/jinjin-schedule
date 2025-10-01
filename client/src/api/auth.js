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

export async function signupRequest(form) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: form
  });
}
