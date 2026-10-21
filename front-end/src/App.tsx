import { Navigate, Route, Routes } from 'react-router-dom';
import { Cadastro } from './pages/Cadastro';
import { Login } from './pages/Login';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
