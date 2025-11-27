import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import { AuthProvider } from "./contexts/AuthContext";
import { Navigate } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0)

  return (

    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
