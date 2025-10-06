import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import RequestForm from './pages/RequestForm';
import Approvals from './pages/Approvals';
import Admin from './pages/Admin';
import { getUser } from './auth';

function RequireAuth({ children, roles }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/requests" element={<RequireAuth roles={["requester","admin"]}><Requests /></RequireAuth>} />
        <Route path="/request/new" element={<RequireAuth roles={["requester","admin"]}><RequestForm /></RequireAuth>} />
        <Route path="/approvals" element={<RequireAuth roles={["hod","pm","store","admin"]}><Approvals /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth roles={["admin"]}><Admin /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
