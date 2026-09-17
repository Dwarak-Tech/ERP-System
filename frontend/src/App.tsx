import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Inventory } from './pages/Inventory';
import { Enquiries } from './pages/Enquiries';
import { Quotations } from './pages/Quotations';
import { OrdersAndDispatch } from './pages/OrdersAndDispatch';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/enquiries" element={<Enquiries />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/orders" element={<OrdersAndDispatch />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;