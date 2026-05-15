const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express(); // Спочатку створюємо додаток

// Потім налаштовуємо CORS та JSON
app.use(cors()); 
app.use(express.json());

// Потім ініціалізуємо Firebase
try {
  if (process.env.FIREBASE_KEY) {
    const firebaseKey = JSON.parse(process.env.FIREBASE_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(firebaseKey)
    });
    console.log("Firebase успішно ініціалізовано");
  } else {
    console.error("Змінна FIREBASE_KEY відсутня в налаштуваннях Render!");
  }
} catch (error) {
  console.error("Помилка парсингу FIREBASE_KEY:", error.message);
}

const db = admin.firestore();

// Маршрути
app.get("/", (req, res) => {
  res.send("Сервер працює! Перейдіть на /api/trips");
});

app.get("/api/trips", async (req, res) => {
  try {
    const snapshot = await db.collection("destinations").get();
    let trips = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // Сортування для Варіанта 24
    trips.sort((a, b) => a.price - b.price); 
    
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Помилка бази даних", details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
