from sqlalchemy import Column, Integer, ForeignKey, Date, String
from database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    premise_id = Column(Integer, ForeignKey("premises.id"))
    date_from = Column(Date)
    date_to = Column(Date)
    status = Column(String, default="pending")  # <== Важно
