import request from './http';

export async function fetchChangeRequests(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`/api/change-requests${query}`);
}

export async function decideChangeRequest(id, status, decidedBy) {
  return request(`/api/change-requests/${id}/decision`, {
    method: 'PATCH',
    body: {
      status,
      decidedBy
    }
  });
}

export async function createChangeRequest(payload) {
  return request('/api/change-requests', {
    method: 'POST',
    body: payload
  });
}
