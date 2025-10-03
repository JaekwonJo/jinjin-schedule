import request, { API_BASE } from './http';

export async function fetchTemplates() {
  return request('/api/templates');
}

export async function createTemplate({ name, description = '' }) {
  return request('/api/templates', {
    method: 'POST',
    body: { name, description }
  });
}

export async function updateTemplate(id, { name, description, isActive }) {
  return request(`/api/templates/${id}`, {
    method: 'PUT',
    body: { name, description, isActive }
  });
}

export async function fetchTemplateEntries(id) {
  return request(`/api/templates/${id}/entries`);
}

export async function saveTemplateEntries(id, entries) {
  return request(`/api/templates/${id}/entries`, {
    method: 'PUT',
    body: { entries }
  });
}

export async function importTemplateCsv(id, file, { mode = 'replace' } = {}) {
  if (!(file instanceof File)) {
    throw new Error('CSV 파일을 선택해 주세요.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);

  const token = localStorage.getItem('jinjin_token');

  const response = await fetch(`${API_BASE}/api/templates/${id}/import`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData
  });

  let payload;
  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (isJson) {
    payload = await response.json();
  }

  if (!response.ok) {
    throw new Error(payload?.error || response.statusText || 'CSV 업로드 중 문제가 발생했어요.');
  }

  return payload;
}
