from pydantic import BaseModel

class PremiseCreate(BaseModel):
    name: str
    location: str
    capacity: int
    price_per_day: float

class PremiseOut(PremiseCreate):
    id: int

    class Config:
        from_attributes = True

