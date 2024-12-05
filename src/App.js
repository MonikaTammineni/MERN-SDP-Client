import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import DoctorPage from "./pages/DoctorPage";
import UserPage from "./pages/UserPage";
import "./App.css";

function App() {
  const getUser = () => {
    const userString = localStorage.getItem("user");
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  };

  const ProtectedRoute = ({ children, allowedRole }) => {
    const user = getUser();
    const isAuthenticated = localStorage.getItem("token");

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (allowedRole && user?.role !== allowedRole) {
      return <Navigate to="/" />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/admin-page" element={
          <ProtectedRoute allowedRole="admin">
            <AdminPage />
          </ProtectedRoute>
        } />
        
        <Route path="/doctor-page" element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorPage />
          </ProtectedRoute>
        } />
        
        <Route path="/user-page" element={
          <ProtectedRoute allowedRole="user">
            <UserPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
