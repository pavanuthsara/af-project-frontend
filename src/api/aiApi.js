import api from './axios';

export const identifyWaste = (file) => {
  const fd = new FormData();
  fd.append('image', file);
  return api.post('/api/ai/identify', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
