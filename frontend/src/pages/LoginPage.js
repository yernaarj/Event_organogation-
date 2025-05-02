import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

function LoginPage() {
  const API = '/api';
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setMessage('Введите email и пароль');
      return;
    }
    try {
      const res = await fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.detail || 'Ошибка входа');
      } else {
        setUser(data);
        navigate(data.role === 'manager' ? '/manager-dashboard' : '/create-order');
      }
    } catch {
      setMessage('Не удалось подключиться к серверу');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit} noValidate>
        <input type="email"    name="email"    placeholder="Email"    value={formData.email}    onChange={handleChange} /><br/><br/>
        <input type="password" name="password" placeholder="Пароль"  value={formData.password} onChange={handleChange} /><br/><br/>
        <button type="submit">Войти</button>
      </form>
      {message && <p style={{ color:'red' }}>{message}</p>}
    </div>
  );
}

export default LoginPage;
