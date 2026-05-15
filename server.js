const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

// Налаштування CORS для доступу з localhost
app.use(cors());
app.use(express.json());

// Ініціалізація Firebase через змінні оточення
try {
  if (process.env.FIREBASE_KEY) {
    const firebaseKey = JSON.parse(process.env.FIREBASE_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(firebaseKey)
    });
    console.log("✅ Firebase успішно ініціалізовано");
  } else {
    console.error("❌ Помилка: FIREBASE_KEY не знайдено в Environment Variables");
  }
} catch (error) {
  console.error("❌ Помилка парсингу Firebase Key:", error.message);
}

const db = admin.firestore();

// Тестовий маршрут
app.get("/", (req, res) => {
  res.send("Сервер працює! Використовуйте /api/trips");
});

// Основний маршрут (Варіант 24)
app.get("/api/trips", async (req, res) => {
  try {
    console.log("--- Отримано запит на /api/trips ---");
    
    // ВАЖЛИВО: Перевір, щоб назва колекції в Firebase була саме "destinations"
    const snapshot = await db.collection("destinations").get();
    
    if (snapshot.empty) {
      console.log("⚠️ Колекція порожня або назва вказана невірно");
      return res.json([]);
    }

    let trips = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        // Захист від помилок: перетворюємо ціну на число
        price: Number(data.price) || 0 
      };
    });
    
    // Сортування за ціною (Варіант 24)
    trips.sort((a, b) => a.price - b.price); 
    
    console.log(`✅ Успішно відправлено ${trips.length} подорожей`);
    res.json(trips);
  } catch (error) {
    console.error("❌ ПОМИЛКА БАЗИ ДАНИХ:", error.message);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
