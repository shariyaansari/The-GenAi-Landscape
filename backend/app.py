from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_pymongo import PyMongo
import jwt
import datetime

app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = "your-secret-key"
app.config["MONGO_URI"] = "mongodb+srv://coelhoalston_db_user:5vg2nMqI4C9GxWXw@alston.0gf3igw.mongodb.net/genai_app?retryWrites=true&w=majority&tls=true&appName=Alston"

mongo = PyMongo(app)
users = mongo.db.users  # MongoDB collection

# ---------------- Signup ----------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    if not email or not password or not confirm_password:
        return jsonify({"error": "All fields are required"}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    if users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = generate_password_hash(password)
    users.insert_one({"email": email, "password": hashed_pw})
    return jsonify({"message": "Signup successful!"})

# ---------------- Login ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Both fields are required"}), 400

    user = users.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    }, app.config["SECRET_KEY"], algorithm="HS256")

    return jsonify({"token": token})

# ---------------- Home route ----------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Flask backend is running!"})

if __name__ == "__main__":
    app.run(debug=True)
