// src/pages/LoginPage.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

export default function LoginPage() {
  const API = process.env.REACT_APP_API_URL;    // ← ваш бэкенд URL из .env
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage('Пожалуйста, укажите и почту, и пароль');
      return;
    }

    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data);
        if (data.role === 'manager') {
          navigate('/manager-dashboard');
        } else {
          navigate('/create-order');
        }
      } else {
        setMessage(data.detail || 'Неверные данные входа');
      }
    } catch {
      setMessage('Не удалось соединиться с сервером');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={{ padding: '8px', width: '250px' }}
        /><br/><br/>
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
          style={{ padding: '8px', width: '250px' }}
        /><br/><br/>
        <button type="submit" style={{ padding: '8px 16px' }}>Войти</button>
      </form>
      {message && (
        <p style={{ color: 'red', marginTop: '10px' }}>
          {message}
        </p>
      )}
    </div>
  );
}
