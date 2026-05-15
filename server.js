const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

// Налаштування CORS (дозволяє запити з вашого localhost)
app.use(cors());
app.use(express.json());

// Ініціалізація Firebase через змінні оточення Render
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
  console.error("❌ Помилка парсингу JSON ключа:", error.message);
}

const db = admin.firestore();

// Головна сторінка для перевірки
app.get("/", (req, res) => {
  res.send("Сервер працює! Використовуйте шлях /api/trips");
});

// Основний маршрут для отримання даних (Варіант 24)
app.get("/api/trips", async (req, res) => {
  try {
    // ВАЖЛИВО: Переконайся, що назва колекції "destinations" збігається з Firebase
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
        // Перетворюємо ціну на число, щоб сортування не ламалося
        price: Number(data.price) || 0 
      };
    });
    
    // Сортування за ціною (від найменшої до найбільшої)
    trips.sort((a, b) => a.price - b.price); 
    
    console.log(`✅ Відправлено ${trips.length} подорожей`);
    res.json(trips);
  } catch (error) {
    console.error("❌ ПОМИЛКА БАЗИ ДАНИХ:", error.message);
    res.status(500).json({ 
      error: "Помилка бази даних", 
      details: error.message 
    });
  }
});

// Використання порту Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
