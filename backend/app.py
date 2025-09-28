from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Optional

# --- Load Environment Variables ---
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("SECRET_KEY", "a_default_secret_key") # Load or use a default
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- App Initialization ---
app = FastAPI()

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Connection ---
try:
    client = MongoClient(mongo_uri)
    db = client.GenAI_DB
    tools_collection = db.tools
    users_collection = db.users # New collection for users
    client.admin.command('ping')
    print("✅ MongoDB connection successful.")
except Exception as e:
    print(f"❌ Could not connect to MongoDB. Error: {e}")
    client = None
    tools_collection = None
    users_collection = None

# --- Security & Hashing Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Pydantic Models (Data Shapes) ---
class UserCreate(BaseModel):
    email: str
    password: str

class UserInDB(UserCreate):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    
# --- Security Helper Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = users_collection.find_one({"email": token_data.email})
    if user is None:
        raise credentials_exception
    return user

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Gen AI Landscape API"}

# --- Tools Endpoint (Existing) ---
@app.get("/api/tools")
def get_all_tools():
    if tools_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not configured.")
    try:
        tools = list(tools_collection.find({}, {'_id': 0}))
        if not tools:
            raise HTTPException(status_code=404, detail="No tools found in the database.")
        return tools
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- NEW: Signup Endpoint ---
@app.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate):
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not configured.")
    # Check if user already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    
    users_collection.insert_one(user_dict)
    return {"message": "Signup successful!"}

# --- NEW: Login Endpoint (for getting a token) ---
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not configured.")
        
    user = users_collection.find_one({"email": form_data.username}) # OAuth2 form uses 'username' for the first field
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- NEW: Example Protected Endpoint ---
@app.get("/users/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    # The '_id' from MongoDB is not JSON serializable, so we remove it
    current_user.pop('_id', None)
    current_user.pop('hashed_password', None) # Don't send the hash back
    return current_user

# --- NEW: Add this block at the very end of the file ---
if __name__ == "__main__":
    import uvicorn
    # This allows you to run the app directly with `python app.py` for development
    # Uvicorn will run the server on http://127.0.0.1:8000
    uvicorn.run(app, host="127.0.0.1", port=8000)