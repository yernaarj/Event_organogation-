import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

function ManagerDashboard() {
  const API = process.env.REACT_APP_API_URL;
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [logs, setLogs]       = useState([]);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/orders`);
        if (!res.ok) throw new Error();
        setOrders(await res.json());
      } catch {
        setError('Не удалось загрузить заказы');
      }
    })();
    (async () => {
      try {
        const res = await fetch(`${API}/logs`);
        if (!res.ok) throw new Error();
        setLogs(await res.json());
      } catch {
        setError('Не удалось загрузить журнал');
      }
    })();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm(`Удалить заказ #${id}?`)) return;
    try {
      const res = await fetch('/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setOrders(orders.filter(o => o.id !== id));
      const logsRes = await fetch('/api/logs`);
      setLogs(await logsRes.json());
    } catch {
      setError('Ошибка при удалении');
    }
  };

  const handleEdit = o => {
    if (!window.confirm(`Редактировать заказ #${o.id}?`)) return;
    navigate(`/orders/${o.id}/edit`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Панель менеджера ({user?.name})</h2>
      {error && <p style={{ color:'red' }}>{error}</p>}

      <section>
        <h3>Все заказы</h3>
        {orders.length === 0
          ? <p>Нет заказов</p>
          : (
            <table border="1" cellPadding="8">
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
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>#</th><th>Менеджер</th><th>Действие</th><th>Заказ ID</th><th>Время</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.manager_name} (#{l.manager_id})</td>
                    <td>{l.action_type}</td>
                    <td>{l.order_id}</td>
                    <td>{new Date(l.timestamp).toLocaleString()}</td>
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
