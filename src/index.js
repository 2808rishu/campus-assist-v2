import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Export all page components
export { default as Chat } from './pages/Chat';
export { default as Admin } from './pages/Admin';
export { default as Analytics } from './pages/Analytics';
export { default as Settings } from './pages/Settings';
export { default as CollegeAdmin } from './pages/CollegeAdmin';

// Export layout
export { default as Layout } from './Layout';

// Export chat components
export { default as MessageBubble } from './components/chat/MessageBubble';
export { default as LanguageSelector } from './components/chat/LanguageSelector';
export { default as QuickActions } from './components/chat/QuickActions';

// Export admin components
export { default as AssetUploader } from './components/admin/AssetUploader';

// Export entities (for reference)
import ChatSession from './entities/ChatSession.json';
import CollegeAsset from './entities/CollegeAsset.json';
import Conversation from './entities/Conversation.json';
import KnowledgeBase from './entities/KnowledgeBase.json';

export const entities = {
  ChatSession,
  CollegeAsset,
  Conversation,
  KnowledgeBase
};