import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage('Пожалуйста, введите и почту, и пароль');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data);
        if (data.role === 'manager') {
          navigate('/manager-dashboard');
        } else {
          navigate('/create-order');
        }
      } else {
        setMessage(data.detail || 'Ошибка входа');
      }
    } catch (error) {
      setMessage('Ошибка подключения к серверу');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        /><br /><br />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
        /><br /><br />
        <button type="submit">Войти</button>
      </form>
      {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
    </div>
  );
}

export default LoginPage;
