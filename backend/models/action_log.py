from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True, index=True)
    manager_id = Column(Integer, ForeignKey("users.id"))
    order_id = Column(Integer, ForeignKey("orders.id"))
    action_type = Column(String)  # "edit" или "delete"
    timestamp = Column(DateTime, default=datetime.utcnow)
    manager_name = Column(String)

    # Optional: связи
    order = relationship("Order", backref="logs")
    manager = relationship("User", backref="actions")
