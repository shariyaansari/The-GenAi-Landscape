import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; // ✅ Import your auth context

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("red");

  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Get login function from context

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append("username", email); // FastAPI expects 'username'
      formData.append("password", password);

      const res = await axios.post("http://localhost:8000/token", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = res.data.access_token;
      localStorage.setItem("token", token); // ✅ Persist token
      sessionStorage.setItem("isLoggedIn", "true"); // ✅ Persist login state
      login(); // ✅ Update context state

      setMessage("Login successful!");
      setColor("green");

      setTimeout(() => {
        navigate("/index");
      }, 1000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Login failed");
      setColor("red");
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h2 style={styles.h2}>Log In</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Log In</button>
        </form>
        {message && (
          <div style={{ color, marginTop: "15px", fontWeight: "bold", textAlign: "center" }}>
            {message}
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
          Don't have an account? <a href="/signup">Sign up here</a>
        </div>
      </div>
    </div>
  );
}

// Inline styles
const styles: { [key: string]: React.CSSProperties } = {
  body: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f4f8",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: "30px 25px",
    borderRadius: "10px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  h2: { textAlign: "center", color: "#28a745", marginBottom: "25px" },
  input: {
    padding: "10px",
    marginTop: "5px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    margin: "10px auto 0 auto",
    padding: "12px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    display: "block",
  },
};