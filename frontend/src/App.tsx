import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import Users from './pages/Users';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider children={
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/users" element={<Users />} />
            </Routes>
          </main>
        </div>
      </Router>
    } />
  );
}

export default App; 