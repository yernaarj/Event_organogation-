import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { setUser } = useContext(UserContext)

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setMessage('Пожалуйста, введите и почту, и пароль')
      return
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data)
        if (data.role === 'manager') navigate('/manager-dashboard')
        else navigate('/create-order')
      } else {
        setMessage(data.detail || 'Ошибка входа')
      }
    } catch {
      setMessage('Ошибка подключения к серверу')
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <br /><br />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <br /><br />
        <button type="submit">Войти</button>
      </form>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  )
}
