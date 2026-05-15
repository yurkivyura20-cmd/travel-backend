const express = require("express");
const cors = require("cors"); // ПЕРЕВІР ЦЕЙ РЯДОК
const admin = require("firebase-admin");

const app = express();

// ДОЗВОЛЯЄМО ЗАПИТИ З БУДЬ-ЯКИХ ДЖЕРЕЛ
app.use(cors()); 
app.use(express.json());
try {
  const firebaseKey = JSON.parse(process.env.FIREBASE_KEY);
  
  admin.initializeApp({
    credential: admin.credential.cert(firebaseKey)
  });
  console.log("Firebase успішно ініціалізовано через Environment Variable");
} catch (error) {
  console.error("Помилка ініціалізації Firebase: Перевірте змінну FIREBASE_KEY в Render");
}

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// Головна сторінка (щоб не було "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Сервер працює! Використовуйте /api/trips для отримання даних.");
});

// Маршрут для Варіанта 24 (Отримання та сортування за ціною)
app.get("/api/trips", async (req, res) => {
  try {
    const snapshot = await db.collection("destinations").get();
    let trips = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // Сортування за ціною (від дешевих до дорогих)
    trips.sort((a, b) => a.price - b.price); 
    
    res.json(trips);
  } catch (error) {
    res.status(500).json({ 
      error: "Помилка бази даних", 
      details: error.message 
    });
  }
});

// Використання порту від Render або 5000 локально
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});