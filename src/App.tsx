import React from 'react';
// 1. Importe o Outlet
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { Dashboard } from './pages/Dashboard';
import { BetForm } from './pages/BetForm';
import { BetList } from './pages/BetList';
import { Bankroll } from './pages/Bankroll';
import { Earnings } from './pages/Earnings';
import { Awards } from './pages/Awards';
import { Admin } from './pages/Admin';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/common';
import CalculadoraPage from './pages/CalculadoraPage';

// 2. Crie um componente de layout protegido
// Ele carrega a Proteção e o Layout UMA VEZ,
// e usa <Outlet /> para renderizar as páginas filhas.
const PlanilhaLayout = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet /> {/* <-- As páginas filhas (Dashboard, BetList, etc.) serão renderizadas aqui */}
      </Layout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Routes>
      {/* Rotas da Calculadora (Públicas e com layout próprio) */}
      <Route path="/calculadora" element={<CalculadoraPage />} />
      <Route path="/admin-calculadora" element={<CalculadoraPage />} />

      {/* Rotas da Planilha (Autenticação) */}
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Rota raiz (/) redireciona para a calculadora */}
      <Route
        path="/"
        element={<Navigate to="/calculadora" replace />} 
      />

      {/* 3. Agrupe todas as rotas da planilha dentro do PlanilhaLayout */}
      <Route element={<PlanilhaLayout />}>
        <Route path="/planilha" element={<Dashboard />} />
        <Route path="/planilha/new-bet" element={<BetForm />} />
        <Route path="/planilha/bets" element={<BetList />} />
        <Route path="/planilha/bankroll" element={<Bankroll />} />
        <Route path="/planilha/earnings" element={<Earnings />} />
        <Route path="/planilha/awards" element={<Awards />} />
        <Route path="/planilha/admin" element={<Admin />} />
      </Route>
      
      {/* 4. (Opcional) Se alguém tentar acessar as rotas antigas, redirecione */}
      <Route path="/new-bet" element={<Navigate to="/planilha/new-bet" replace />} />
      <Route path="/bets" element={<Navigate to="/planilha/bets" replace />} />
      <Route path="/bankroll" element={<Navigate to="/planilha/bankroll" replace />} />
      <Route path="/earnings" element={<Navigate to="/planilha/earnings" replace />} />
      <Route path="/awards" element={<Navigate to="/planilha/awards" replace />} />
      <Route path="/admin" element={<Navigate to="/planilha/admin" replace />} />

    </Routes>
  );
}

export default App;