import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
from models.user import User
from models.premise import Premise
from models.order import Order
from models.action_log import ActionLog
from schemas.user_schema import UserCreate, UserOut, UserLogin
from schemas.premise_schema import PremiseCreate, PremiseOut
from schemas.order_schema import OrderCreate, OrderOut, OrderUpdate
from schemas.action_log_schema import ActionLogOut

app = FastAPI()

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Источник берём из переменной окружения, разделённой запятыми
# (на Render: Settings → Environment → CORS_ORIGINS)
raw = os.getenv("CORS_ORIGINS", "http://localhost:3000")
origins = [u.strip() for u in raw.split(",") if u.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ────────────────────────────────────────────────────────────────────────────────

# Создаём таблицы при старте (если ещё нет)
Base.metadata.create_all(bind=engine)

# Зависимость для работы с БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Health-check и Root ───────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def read_root():
    return {"message": "Welcome to Event System API"}

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
# ────────────────────────────────────────────────────────────────────────────────


# ─── Пользователи ───────────────────────────────────────────────────────────────
@app.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(400, "Email уже используется")
    new = User(**user.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(404, "Пользователь не найден")
    if db_user.password != user.password:
        raise HTTPException(401, "Неверный пароль")
    return {
        "message": "Успешный вход",
        "user_id": db_user.id,
        "name": db_user.name,
        "role": db_user.role
    }
# ────────────────────────────────────────────────────────────────────────────────


# ─── Помещения ─────────────────────────────────────────────────────────────────
@app.post("/premises", response_model=PremiseOut)
def create_premise(p: PremiseCreate, db: Session = Depends(get_db)):
    new = Premise(**p.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@app.get("/premises", response_model=list[PremiseOut])
def get_premises(db: Session = Depends(get_db)):
    return db.query(Premise).all()
# ────────────────────────────────────────────────────────────────────────────────


# ─── Заказы ─────────────────────────────────────────────────────────────────────
@app.post("/orders", response_model=OrderOut)
def create_order(o: OrderCreate, db: Session = Depends(get_db)):
    conflict = db.query(Order).filter(
        Order.premise_id == o.premise_id,
        Order.date_to >= o.date_from,
        Order.date_from <= o.date_to
    ).first()
    if conflict:
        raise HTTPException(400, "Помещение занято на выбранные даты.")
    new = Order(**o.dict(), status="pending")
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@app.get("/orders", response_model=list[OrderOut])
def get_all_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()

@app.put("/orders/{order_id}", response_model=OrderOut)
def update_order(order_id: int, upd: OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(404, "Заказ не найден")
    # Обновляем поля по тому, что пришло
    for field, val in upd:
        setattr(order, field, val)
    # Логируем правку
    log = ActionLog(
        manager_id=1,
        manager_name="(будет из JWT)",
        order_id=order.id,
        action_type="edit"
    )
    db.add(log)
    db.commit()
    db.refresh(order)
    return order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(404, "Заказ не найден")
    # Логируем удаление
    log = ActionLog(
        manager_id=1,
        manager_name="(будет из JWT)",
        order_id=order.id,
        action_type="delete"
    )
    db.add(log)
    db.delete(order)
    db.commit()
    return {"message": "Заказ удалён"}

@app.get("/client-orders/{client_id}", response_model=list[OrderOut])
def get_client_orders(client_id: int, status: str = None, db: Session = Depends(get_db)):
    q = db.query(Order).filter(Order.client_id == client_id)
    if status:
        q = q.filter(Order.status == status)
    return q.all()
# ────────────────────────────────────────────────────────────────────────────────


# ─── История действий ───────────────────────────────────────────────────────────
@app.get("/logs", response_model=list[ActionLogOut])
def get_logs(db: Session = Depends(get_db)):
    return db.query(ActionLog).order_by(ActionLog.timestamp.desc()).all()
# ────────────────────────────────────────────────────────────────────────────────
