import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';

function CreateOrderPage() {
  const API = '/api';
  const { user } = useContext(UserContext);
  const [premises, setPremises] = useState([]);
  const [formData, setFormData] = useState({
    premise_id: '',
    date_from: '',
    date_to: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/premises`);
        setPremises(await res.json());
      } catch {
        setMessage('Не удалось загрузить список помещений');
      }
    })();
  }, []);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.premise_id || !formData.date_from || !formData.date_to) {
      setMessage('Заполните все поля');
      return;
    }
    const order = {
      client_id: user.user_id,
      premise_id: +formData.premise_id,
      date_from: formData.date_from,
      date_to: formData.date_to
    };
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok) {
        setMessage('Заказ успешно создан!');
        setFormData({ premise_id: '', date_from: '', date_to: '' });
      } else {
        const err = await res.json();
        setMessage(err.detail || 'Ошибка при создании заказа');
      }
    } catch {
      setMessage('Ошибка соединения с сервером');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Создать заказ</h2>
      <form onSubmit={handleSubmit}>
        <select name="premise_id" value={formData.premise_id} onChange={handleChange}>
          <option value="">Выберите помещение</option>
          {premises.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.location} (вместимость: {p.capacity})
            </option>
          ))}
        </select><br/><br/>
        <input type="date" name="date_from" value={formData.date_from} onChange={handleChange} /><br/><br/>
        <input type="date" name="date_to"   value={formData.date_to}   onChange={handleChange} /><br/><br/>
        <button type="submit">Отправить заказ</button>
      </form>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}

export default CreateOrderPage;
