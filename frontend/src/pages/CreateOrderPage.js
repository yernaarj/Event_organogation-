import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/UserContext'

export default function CreateOrderPage() {
  const API = process.env.REACT_APP_API_URL
  const { user } = useContext(UserContext)
  const [premises, setPremises] = useState([])
  const [formData, setFormData] = useState({
    premise_id: '',
    date_from: '',
    date_to: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchPremises() {
      try {
        const res = await fetch(`${API}/premises`)
        if (!res.ok) throw new Error('Ошибка при загрузке списка помещений')
        const data = await res.json()
        setPremises(data)
      } catch (err) {
        setMessage(err.message)
      }
    }
    fetchPremises()
  }, [API])

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!formData.premise_id || !formData.date_from || !formData.date_to) {
      setMessage('Заполните все поля')
      return
    }
    const order = {
      client_id: user.user_id,
      premise_id: parseInt(formData.premise_id, 10),
      date_from: formData.date_from,
      date_to: formData.date_to
    }
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Заказ успешно создан!')
        setFormData({ premise_id: '', date_from: '', date_to: '' })
      } else {
        setMessage(data.detail || 'Ошибка при создании заказа')
      }
    } catch {
      setMessage('Ошибка подключения к серверу')
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Создать заказ</h2>
      <form onSubmit={handleSubmit}>
        <select name="premise_id" value={formData.premise_id} onChange={handleChange} required>
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
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  )
}
