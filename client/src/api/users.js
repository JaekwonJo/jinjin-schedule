import request from './http';

export async function fetchUsers() {
  return request('/api/users');
}

export async function updateUserStatus(id, payload) {
  return request(`/api/users/${id}/status`, {
    method: 'PATCH',
    body: payload
  });
}

export async function resetUserPassword(id, password) {
  return request(`/api/users/${id}/password`, {
    method: 'PATCH',
    body: { password }
  });
}
