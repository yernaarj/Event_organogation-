import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

export default function EditOrderPage() {
  const API = '/api';
  const { user } = useContext(UserContext);
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [formData, setFormData] = useState({ date_from: '', date_to: '', status: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/orders/${orderId}`);
        if (!res.ok) throw new Error();
        const o = await res.json();
        setOrder(o);
        setFormData({ date_from: o.date_from, date_to: o.date_to, status: o.status });
      } catch {
        setMessage('Не удалось загрузить заказ');
      }
    })();
  }, [orderId]);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!window.confirm('Сохранить изменения?')) return;
    try {
      const res = await fetch(`${API}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: order.client_id,
          premise_id: order.premise_id,
          ...formData
        })
      });
      if (!res.ok) throw new Error();
      setMessage('Заказ обновлён');
      navigate(user.role === 'manager' ? '/manager-dashboard' : '/my-orders');
    } catch {
      setMessage('Ошибка при обновлении');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить заказ?')) return;
    try {
      const res = await fetch(`${API}/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      alert('Удалён');
      navigate(user.role === 'manager' ? '/manager-dashboard' : '/my-orders');
    } catch {
      setMessage('Ошибка при удалении');
    }
  };

  if (!order) return <div style={{ textAlign:'center' }}>{message || 'Загрузка...'}</div>;

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h2>Редактировать заказ #{order.id}</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>С:</label><br/>
          <input type="date" name="date_from" value={formData.date_from} onChange={handleChange} required/>
        </div><br/>
        <div>
          <label>По:</label><br/>
          <input type="date" name="date_to" value={formData.date_to} onChange={handleChange} required/>
        </div><br/>
        <div>
          <label>Статус:</label><br/>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="pending">Ожидает</option>
            <option value="confirmed">Подтверждён</option>
            <option value="cancelled">Отменён</option>
          </select>
        </div><br/>
        <button type="submit">Сохранить</button>
      </form><br/>
      <button onClick={handleDelete}>Удалить заказ</button>
    </div>
  );
}
