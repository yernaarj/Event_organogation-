# schemas/action_log_schema.py
from pydantic import BaseModel
from datetime import datetime

class ActionLogOut(BaseModel):
    id: int
    manager_id: int
    manager_name: str
    order_id: int
    action_type: str
    timestamp: datetime

    class Config:
        orm_mode = True
