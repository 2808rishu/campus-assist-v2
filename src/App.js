import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import CollegeAdmin from './pages/CollegeAdmin';
import './App.css';

function App() {
  return (
    <Router basename="/campus-assist-v2">
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<Layout><Admin /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/college-admin" element={<Layout><CollegeAdmin /></Layout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;