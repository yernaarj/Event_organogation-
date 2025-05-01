from pydantic import BaseModel
from datetime import date
from typing import Optional

class OrderCreate(BaseModel):
    client_id: int
    premise_id: int
    date_from: date
    date_to: date

class OrderUpdate(BaseModel):
    client_id: int
    premise_id: int
    date_from: date
    date_to: date
    status: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    client_id: int
    premise_id: int
    date_from: date
    date_to: date
    status: str

    class Config:
        from_attributes = True  # если ты на Pydantic v2
