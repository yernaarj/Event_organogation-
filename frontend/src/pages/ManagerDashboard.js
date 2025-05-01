// src/pages/ManagerDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

function ManagerDashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [logs, setLogs]     = useState([]);
  const [error, setError]   = useState('');

  // Получаем все заказы
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/orders');
        if (!res.ok) throw new Error('Не удалось загрузить заказы');
        setOrders(await res.json());
      } catch (e) {
        setError(e.message);
      }
    };
    fetchOrders();
  }, []);

  // Получаем журнал действий
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/logs');
        if (!res.ok) throw new Error('Не удалось загрузить журнал');
        setLogs(await res.json());
      } catch (e) {
        setError(e.message);
      }
    };
    fetchLogs();
  }, []);

  const handleDelete = async (orderId) => {
    if (!window.confirm('Вы действительно хотите удалить заказ #' + orderId + '?')) {
      return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:8000/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Ошибка при удалении');
      // Обновим список заказов и журнал
      setOrders(orders.filter(o => o.id !== orderId));
      setLogs([]); // перезагрузим журнал
      const logsRes = await fetch('http://127.0.0.1:8000/logs');
      setLogs(await logsRes.json());
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEdit = (order) => {
    if (!window.confirm('Вы действительно хотите отредактировать заказ #' + order.id + '?')) {
      return;
    }
    // Редирект на страницу редактирования, где можно менять статус
    navigate(`/orders/${order.id}/edit`, { state: { order } });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Панель менеджера ({user?.name})</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section>
        <h3>Все заказы</h3>
        {orders.length === 0
          ? <p>Нет заказов</p>
          : (
            <table border="1" cellPadding="8" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th><th>Клиент</th><th>Зал</th><th>С</th><th>По</th><th>Статус</th><th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.client_id}</td>
                    <td>{o.premise_id}</td>
                    <td>{o.date_from}</td>
                    <td>{o.date_to}</td>
                    <td>{o.status}</td>
                    <td>
                      <button onClick={() => handleEdit(o)}>Редактировать</button>{' '}
                      <button onClick={() => handleDelete(o.id)}>Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </section>

      <section style={{ marginTop: 40 }}>
        <h3>Журнал действий</h3>
        {logs.length === 0
          ? <p>Пусто</p>
          : (
            <table border="1" cellPadding="8" cellSpacing="0">
              <thead>
                <tr>
                  <th>#</th><th>Менеджер</th><th>Действие</th><th>Заказ ID</th><th>Время</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.manager_name} (#{log.manager_id})</td>
                    <td>{log.action_type}</td>
                    <td>{log.order_id}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </section>
    </div>
  );
}

export default ManagerDashboard;
