import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import CreateOrderPage from './pages/CreateOrderPage';
import ManagerDashboard from './pages/ManagerDashboard';
import ClientOrdersPage from './pages/ClientOrdersPage';
import PrivateRoute from './components/PrivateRoute';
import LogoutButton from './components/LogoutButton';
import { useUser } from './context/UserContext';

function App() {
  const { user } = useUser();

  return (
    <Router>
      <div style={{ textAlign: 'center', padding: 20 }}>
        <h1>Добро пожаловать в Event System</h1>

        {/* Если не залогинен — показываем Регистрация/Вход */}
        {!user ? (
          <>
            <Link to="/register"><button>Регистрация</button></Link>
            <Link to="/login"><button>Вход</button></Link>
          </>
        ) : (
          <>
            {/* После входа — кнопки в зависимости от роли */}
            {user.role === 'client' && (
              <Link to="/create-order"><button>Сделать заказ</button></Link>
            )}
            {user.role === 'manager' && (
              <Link to="/manager-dashboard"><button>Все заказы</button></Link>
            )}
            <Link to="/my-orders"><button>Мои заказы</button></Link>
            <LogoutButton />
          </>
        )}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/create-order"
            element={
              <PrivateRoute>
                <CreateOrderPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager-dashboard"
            element={
              <PrivateRoute>
                <ManagerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <PrivateRoute>
                <ClientOrdersPage />
              </PrivateRoute>
            }
          />
          {/* На всё остальное — редирект на главную */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
