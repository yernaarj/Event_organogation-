import React, { useState } from 'react';

function RegisterPage() {
  const API = '/api';
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'client'
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role } = formData;
    if (!name || !email || !password || !confirmPassword) {
      setMessage('Заполните все поля'); return;
    }
    if (password !== confirmPassword) {
      setMessage('Пароли не совпадают'); return;
    }
    try {
      const res =  await fetch('/api/register', { … })
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      if (res.ok) {
        setMessage('Успешная регистрация!');
        setFormData({ name:'', email:'', password:'', confirmPassword:'', role:'client' });
      } else {
        const err = await res.json();
        setMessage(err.detail || 'Ошибка при регистрации');
      }
    } catch {
      setMessage('Ошибка соединения с сервером');
    }
  };

  return (
    <div style={{ textAlign:'center' }}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <input name="name"  placeholder="Имя"           value={formData.name}  onChange={handleChange} /><br/><br/>
        <input name="email" placeholder="Email"         value={formData.email} onChange={handleChange} /><br/><br/>
        <input name="password"    type="password" placeholder="Пароль"    value={formData.password}        onChange={handleChange} /><br/><br/>
        <input name="confirmPassword" type="password" placeholder="Повторите пароль"
          value={formData.confirmPassword} onChange={handleChange} /><br/><br/>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="client">Клиент</option>
          <option value="manager">Менеджер</option>
        </select><br/><br/>
        <button type="submit">Зарегистрироваться</button>
      </form>
      {message && <p style={{ color:'red' }}>{message}</p>}
    </div>
  );
}

export default RegisterPage;
