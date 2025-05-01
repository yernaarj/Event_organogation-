import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';

function ClientOrdersPage() {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/orders');
        const data = await response.json();
        if (response.ok) {
          const clientOrders = data.filter(order => order.client_id === user.user_id);
          setOrders(clientOrders);
        } else {
          setError('Ошибка при загрузке заказов');
        }
      } catch (err) {
        setError('Не удалось подключиться к серверу');
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const pending = orders.filter(o => o.status === 'pending');
  const confirmed = orders.filter(o => o.status === 'confirmed');
  const cancelled = orders.filter(o => o.status === 'cancelled');

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Мои заказы</h2>
      {error && <p>{error}</p>}

      <h3>Ожидают</h3>
      {pending.length ? pending.map(o => (
        <div key={o.id}>#{o.id} — {o.date_from} → {o.date_to}</div>
      )) : <p>Нет ожидающих заказов</p>}

      <h3>Прошли</h3>
      {confirmed.length ? confirmed.map(o => (
        <div key={o.id}>#{o.id} — {o.date_from} → {o.date_to}</div>
      )) : <p>Нет прошедших заказов</p>}

      <h3>Удаленные</h3>
      {cancelled.length ? cancelled.map(o => (
        <div key={o.id}>#{o.id} — {o.date_from} → {o.date_to}</div>
      )) : <p>Нет удаленных заказов</p>}
    </div>
  );
}

export default ClientOrdersPage;
