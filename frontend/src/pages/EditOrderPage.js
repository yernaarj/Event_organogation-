import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

export default function EditOrderPage() {
  const { user } = useContext(UserContext);
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [formData, setFormData] = useState({
    date_from: '',
    date_to: '',
    status: ''
  });
  const [message, setMessage] = useState('');

  // Загрузка данных заказа
  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch('http://127.0.0.1:8000/orders');
        const data = await res.json();
        if (!res.ok) {
          setMessage('Ошибка при загрузке заказа');
          return;
        }
        const o = data.find(o => o.id === Number(orderId));
        if (!o) {
          setMessage('Заказ не найден');
          return;
        }
        setOrder(o);
        setFormData({
          date_from: o.date_from,
          date_to: o.date_to,
          status: o.status
        });
      } catch (err) {
        setMessage('Не удалось подключиться к серверу');
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!window.confirm('Вы действительно хотите сохранить изменения?')) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: order.client_id,
          premise_id: order.premise_id,
          date_from: formData.date_from,
          date_to: formData.date_to,
          status: formData.status
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Заказ успешно обновлён');
        // перенаправляем назад
        navigate(user.role === 'manager' ? '/manager-dashboard' : '/my-orders');
      } else {
        setMessage(data.detail || 'Ошибка при обновлении заказа');
      }
    } catch (err) {
      setMessage('Ошибка соединения с сервером');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы действительно хотите удалить заказ?')) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/orders/${orderId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        alert('Заказ удалён');
        navigate(user.role === 'manager' ? '/manager-dashboard' : '/my-orders');
      } else {
        setMessage(data.detail || 'Ошибка при удалении заказа');
      }
    } catch (err) {
      setMessage('Ошибка соединения с сервером');
    }
  };

  if (!order) {
    return <div style={{ textAlign: 'center' }}>{message || 'Загрузка...'}</div>;
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Редактировать заказ #{order.id}</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Дата начала:<br />
            <input
              type="date"
              name="date_from"
              value={formData.date_from}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <br />
        <div>
          <label>
            Дата окончания:<br />
            <input
              type="date"
              name="date_to"
              value={formData.date_to}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <br />
        <div>
          <label>
            Статус:<br />
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="pending">Ожидает</option>
              <option value="confirmed">Подтверждён</option>
              <option value="cancelled">Отменён</option>
            </select>
          </label>
        </div>
        <br />
        <button type="submit">Сохранить изменения</button>
      </form>
      <br />
      <button onClick={handleDelete}>Удалить заказ</button>
    </div>
  );
}
