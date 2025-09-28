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
from pydantic import BaseModel

STOP_WORDS = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", 
    "he", "him", "his", "she", "her", "it", "its", "they", "them", "their", 
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", 
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", 
    "do", "does", "did", "a", "an", "the", "and", "but", "if", "or", "because", 
    "as", "until", "while", "of", "at", "by", "for", "with", "about", "to", 
    "from", "in", "out", "on", "off", "over", "under", "again", "further", 
    "then", "once", "here", "there", "when", "where", "why", "how", "all", 
    "any", "both", "each", "few", "more", "most", "other", "some", "such", 
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", 
    "can", "will", "just", "don", "should", "now", "find", "show", "give", "me"
}

# --- Load Environment Variables ---
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("SECRET_KEY", "a_default_secret_key") # Load or use a default
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- App Initialization ---
app = FastAPI()
origins = [
    "http://localhost:8080",  # Your React app's address
    # Add other origins if necessary
]


# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
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
class ChatRequest(BaseModel):
    message: str

# Define the response structure
class ChatResponse(BaseModel):
    reply: str

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

def tool_helper(tool) -> dict:
    return {
        "id": str(tool["_id"]),
        "name": tool.get("name"),
        # "description": tool.get("description"),
        "pricingModel": tool.get("pricingModel"),
        "website":tool.get("website"),
        # Add other fields you might need
    }


# ---  CHATBOT ENDPOINT ---
@app.post("/api/chatbot", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    """
    Finds matching tools, sorts by popularity, and returns a detailed
    response with name, release date, pricing, and website link.
    """
    if tools_collection is None:
        return {"reply": "Sorry, I can't connect to the database right now."}

    user_message = request.message.lower()
    keywords = user_message.split()
    meaningful_keywords = [word for word in keywords if word.strip() not in STOP_WORDS]

    if not meaningful_keywords:
        return {"reply": "Please be a bit more specific about what you're looking for."}

    query = {
        "$or": [
            {"name": {"$regex": "|".join(meaningful_keywords), "$options": "i"}},
            {"description": {"$regex": "|".join(meaningful_keywords), "$options": "i"}},
            {"keyFeatures": {"$regex": "|".join(meaningful_keywords), "$options": "i"}}
        ]
    }

    try:
        found_tools = list(tools_collection.find(query).sort("popularity", -1).limit(3))

        if not found_tools:
            return {"reply": f"Sorry, I couldn't find any tools related to your search. Try describing it differently."}

        response_text = "Here are the top 3 most popular tools I found for you:\n\n---\n\n"
        
        # ---  RESPONSE FORMATTING LOGIC ---
        for tool in found_tools:
            # Safely get each piece of data, providing a default if it's missing
            name = tool.get('name', 'N/A')
            release_date = tool.get('releaseDate', 'N/A')
            pricing_model = tool.get('pricingModel', 'N/A')
            website_link = tool.get('website', '#')
            description = tool.get('description', 'No description available.')
            
            # Create a more detailed, formatted string for each tool
            response_text += (
                f"**Name**: {name}\n"
                f"- **Release Date**: {release_date}\n"
                f"- **Pricing**: {pricing_model.title()}\n"
                f"- **Website**: [{website_link}]({website_link})\n\n"
            )

        return {"reply": response_text}

    except Exception as e:
        print(f"Database query failed: {e}")
        return {"reply": "Sorry, something went wrong while searching for tools."}


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

@app.get("/tools/popular")
def get_popular():
    tools = list(tools_collection.find({}, {'_id': 0}))
    return list(tools.find().sort("popularity", -1).limit(10))

# Latest (based on trendScore instead of releaseDate)
@app.get("/tools/latest")
def get_latest():
    tools = list(tools_collection.find({}, {'_id': 0}))
    return list(tools.find().sort("trendScore", -1).limit(10))

# --- NEW: Add this block at the very end of the file ---
if __name__ == "__main__":
    import uvicorn
    # This allows you to run the app directly with `python app.py` for development
    # Uvicorn will run the server on http://127.0.0.1:8000
    uvicorn.run(app, host="127.0.0.1", port=8000)