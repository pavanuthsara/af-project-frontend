import api from './axios';

export const getQuizzes = () => api.get('/api/quizzes');
export const playQuiz = (id, lang) => api.get(`/api/quizzes/${id}/play`, { params: lang ? { lang } : {} });
export const submitQuiz = (id, answers) => api.post(`/api/quizzes/${id}/submit`, { answers });
export const getCertificates = () => api.get('/api/quizzes/certificates');

// Admin quiz management
export const createQuiz = (data) => api.post('/api/quizzes', data);
export const addQuestion = (quizId, data) => api.post(`/api/quizzes/${quizId}/questions`, data);
export const updateQuestion = (questionId, data) => api.put(`/api/quizzes/questions/${questionId}`, data);
export const deleteQuestion = (questionId) => api.delete(`/api/quizzes/questions/${questionId}`);
// Admin-only: fetch questions with correctAnswer & explanation for the edit panel
export const getQuestionsAdmin = (quizId) => api.get(`/api/quizzes/${quizId}/questions`);
