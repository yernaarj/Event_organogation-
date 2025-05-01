# main.py
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

# --- CORS: разрешить запросы со всех origins (удобно при разработке через ngrok) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],               # <-- вместо жестких доменов
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаем таблицы
Base.metadata.create_all(bind=engine)

# Зависимость для сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Корневой маршрут, чтобы «/» давал не 404, а понятный ответ ---
@app.get("/", summary="Root")
def read_root():
    return {"message": "Event System API is up and running!"}


# === РЕГИСТРАЦИЯ ===
@app.post("/register", response_model=UserOut, summary="Register new user")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already used")
    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# === ЛОГИН ===
@app.post("/login", summary="Login user")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.password != user.password:
        raise HTTPException(status_code=401, detail="Wrong password")
    return {"message": "Login successful", "user_id": db_user.id, "name": db_user.name, "role": db_user.role}


# === ПОМЕЩЕНИЯ ===
@app.post("/premises", response_model=PremiseOut, summary="Create a premise")
def create_premise(p: PremiseCreate, db: Session = Depends(get_db)):
    new = Premise(**p.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@app.get("/premises", response_model=list[PremiseOut], summary="List all premises")
def get_premises(db: Session = Depends(get_db)):
    return db.query(Premise).all()


# === ЗАКАЗЫ ===
@app.post("/orders", response_model=OrderOut, summary="Create an order")
def create_order(o: OrderCreate, db: Session = Depends(get_db)):
    # Проверка на пересечение дат
    overlap = db.query(Order).filter(
        Order.premise_id == o.premise_id,
        Order.date_to >= o.date_from,
        Order.date_from <= o.date_to
    ).first()
    if overlap:
        raise HTTPException(status_code=400, detail="Premise is already booked for these dates")

    new = Order(client_id=o.client_id, premise_id=o.premise_id,
                date_from=o.date_from, date_to=o.date_to, status="pending")
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@app.get("/orders", response_model=list[OrderOut], summary="List all orders")
def get_all_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()

@app.put("/orders/{order_id}", response_model=OrderOut, summary="Update an order")
def update_order(order_id: int, upd: OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Обновляем поля
    order.client_id = upd.client_id
    order.premise_id = upd.premise_id
    order.date_from = upd.date_from
    order.date_to = upd.date_to
    if upd.status:
        order.status = upd.status
    # Логируем действие
    db.add(ActionLog(manager_id=1, manager_name="ManagerName", order_id=order.id, action_type="edit"))
    db.commit()
    db.refresh(order)
    return order

@app.delete("/orders/{order_id}", summary="Delete an order")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Логируем действие
    db.add(ActionLog(manager_id=1, manager_name="ManagerName", order_id=order.id, action_type="delete"))
    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}

@app.get("/client-orders/{client_id}", response_model=list[OrderOut], summary="Get orders by client (and optional status)")
def get_client_orders(client_id: int, status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Order).filter(Order.client_id == client_id)
    if status:
        q = q.filter(Order.status == status)
    return q.all()


# === ЛОГИ ДЕЙСТВИЙ ===
@app.get("/logs", response_model=list[ActionLogOut], summary="Action logs")
def get_logs(db: Session = Depends(get_db)):
    return db.query(ActionLog).order_by(ActionLog.timestamp.desc()).all()
