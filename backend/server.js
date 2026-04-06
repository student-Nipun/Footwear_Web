require("dotenv").config(); // ← Sabse upar add karo

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./db");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Ab hardcoded nahi, .env se aayega
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ success: false, message: "Wrong credentials!" });
  }
});

app.post("/submit-contact", (req, res) => {
  const { name, phone, address, email, message } = req.body;
  const sql = `INSERT INTO contacts (name, phone, address, email, message) 
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [name, phone, address, email, message], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.get("/admin/contacts", (req, res) => {
  const token = req.headers["authorization"];
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ message: "⛔ Access Denied!" });
  }
  db.query(
    "SELECT * FROM contacts ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    },
  );
});

app.listen(3000, () => {
  console.log("🚀 Server: http://localhost:3000");
});
