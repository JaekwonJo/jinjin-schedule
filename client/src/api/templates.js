import request from './http';

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
