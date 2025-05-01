import React, { useState } from 'react';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка: все поля заполнены
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage('Пожалуйста, заполните все поля');
      return;
    }

    // Проверка: совпадают ли пароли
    if (formData.password !== formData.confirmPassword) {
      setMessage('Пароли не совпадают');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Успешная регистрация!');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'client',
        });
      } else {
        setMessage(data.detail || 'Ошибка при регистрации');
      }
    } catch (error) {
      setMessage('Ошибка соединения с сервером');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Имя"
          value={formData.name}
          onChange={handleChange}
        /><br /><br />
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Подтвердите пароль"
          value={formData.confirmPassword}
          onChange={handleChange}
        /><br /><br />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="client">Клиент</option>
          <option value="manager">Менеджер</option>
        </select><br /><br />
        <button type="submit">Зарегистрироваться</button>
      </form>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}

export default RegisterPage;
