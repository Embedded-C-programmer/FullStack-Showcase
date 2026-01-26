import api from './api';

export const getPosts = async () => {
  try {
    const response = await api.get('/posts/');
    // Handle both paginated and non-paginated responses
    if (response && response.results) {
      return response.results;
    }
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const getPost = async (id) => {
  try {
    return await api.get(`/posts/${id}/`);
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

export const createPost = async (title, content, excerpt) => {
  try {
    return await api.post('/posts/', {
      title,
      content,
      excerpt,
      published: true
    });
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const updatePost = async (id, title, content, excerpt) => {
  try {
    return await api.put(`/posts/${id}/`, {
      title,
      content,
      excerpt,
      published: true
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export const deletePost = async (id) => {
  try {
    return await api.delete(`/posts/${id}/`);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const getComments = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments/`);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const createComment = async (postId, content) => {
  try {
    return await api.post(`/posts/${postId}/add_comment/`, { content });
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const deleteComment = async (id) => {
  try {
    return await api.delete(`/comments/${id}/`);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};