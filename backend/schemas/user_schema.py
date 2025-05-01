from pydantic import BaseModel
from datetime import date

# --- Для входа
class UserLogin(BaseModel):
    email: str
    password: str

# --- Для регистрации
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str

# --- Для возврата пользователя после регистрации или логина
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

# --- Для вывода информации о заказе
class OrderOut(BaseModel):
    id: int
    client_id: int
    premise_id: int
    date_from: date
    date_to: date
    status: str

    class Config:
        from_attributes = True
