// src/pages/CreateOrderPage.js
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';

function CreateOrderPage() {
  const API = process.env.REACT_APP_API_URL;  // ← базовый URL вашего бэкенда
  const { user } = useContext(UserContext);

  const [premises, setPremises] = useState([]);
  const [formData, setFormData] = useState({
    premise_id: '',
    date_from: '',
    date_to: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPremises = async () => {
      try {
        const res = await fetch(`${API}/premises`);
        const data = await res.json();
        if (res.ok) {
          setPremises(data);
        } else {
          setMessage('Ошибка при загрузке помещений');
        }
      } catch {
        setMessage('Не удалось загрузить список помещений');
      }
    };
    fetchPremises();
  }, [API]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.premise_id || !formData.date_from || !formData.date_to) {
      setMessage('Заполните все поля');
      return;
    }

    const order = {
      client_id: user.user_id,
      premise_id: Number(formData.premise_id),
      date_from: formData.date_from,
      date_to: formData.date_to
    };

    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Заказ успешно создан!');
        setFormData({ premise_id: '', date_from: '', date_to: '' });
      } else {
        setMessage(data.detail || 'Ошибка при создании заказа');
      }
    } catch {
      setMessage('Ошибка соединения с сервером');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Создать заказ</h2>
      <form onSubmit={handleSubmit}>
        <select
          name="premise_id"
          value={formData.premise_id}
          onChange={handleChange}
          required
        >
          <option value="">Выберите помещение</option>
          {premises.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.location} (вместимость: {p.capacity})
            </option>
          ))}
        </select>
        <br /><br />

        <input
          type="date"
          name="date_from"
          value={formData.date_from}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="date"
          name="date_to"
          value={formData.date_to}
          onChange={handleChange}
          required
        />
        <br /><br />

        <button type="submit">Отправить заказ</button>
      </form>

      {message && <p style={{ color: message.startsWith('Ошибка') ? 'red' : 'green' }}>
        {message}
      </p>}
    </div>
  );
}

export default CreateOrderPage;
