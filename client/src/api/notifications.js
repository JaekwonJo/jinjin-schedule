import request from './http';

export async function sendTestNotification(payload = {}) {
  return request('/api/notifications/test', {
    method: 'POST',
    body: payload
  });
}
