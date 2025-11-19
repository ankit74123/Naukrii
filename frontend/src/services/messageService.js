import api from './api';

// Send a message
export const sendMessage = async (receiverId, content, applicationId = null, jobId = null) => {
  const response = await api.post('/messages', { receiverId, content, applicationId, jobId });
  return response.data;
};

// Get all conversations
export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

// Get messages in a conversation
export const getMessages = async (userId) => {
  const response = await api.get(`/messages/conversation/${userId}`);
  return response.data;
};

// Mark message as read
export const markAsRead = async (messageId) => {
  const response = await api.put(`/messages/${messageId}/read`);
  return response.data;
};

// Mark all messages in conversation as read
export const markConversationAsRead = async (userId) => {
  const response = await api.put(`/messages/conversation/${userId}/read`);
  return response.data;
};

// Delete a message
export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

// Get unread message count
export const getUnreadCount = async () => {
  const response = await api.get('/messages/unread/count');
  return response.data;
};

export default {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  markConversationAsRead,
  deleteMessage,
  getUnreadCount,
};
