from sqlalchemy import Column, Integer, String, Float
from database import Base

class Premise(Base):
    __tablename__ = "premises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    capacity = Column(Integer)
    price_per_day = Column(Float)
