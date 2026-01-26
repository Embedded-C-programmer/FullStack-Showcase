import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthForm from './components/AuthForm';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostEditor from './components/PostEditor';
import './App.css';

function App() {
  const [view, setView] = useState('home');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  const handleNavigate = (newView) => {
    setView(newView);
    setSelectedPostId(null);
    setEditingPost(null);
  };

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId);
    setView('detail');
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setView('edit');
  };

  const handleSavePost = () => {
    setView('home');
    setEditingPost(null);
    setSelectedPostId(null);
  };

  return (
    <AuthProvider>
      <div className="app">
        <Header onNavigate={handleNavigate} currentView={view} />

        <main className="main-content">
          {view === 'home' && (
            <PostList onSelectPost={handleSelectPost} onNavigate={handleNavigate} />
          )}

          {view === 'login' && (
            <AuthForm mode="login" onSuccess={() => setView('home')} />
          )}

          {view === 'detail' && selectedPostId && (
            <PostDetail
              postId={selectedPostId}
              onBack={() => setView('home')}
              onEdit={handleEdit}
            />
          )}

          {(view === 'create' || view === 'edit') && (
            <PostEditor
              post={editingPost}
              onSave={handleSavePost}
              onCancel={() => setView('home')}
            />
          )}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;