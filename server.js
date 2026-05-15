const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Ініціалізація Firebase
try {
  if (process.env.FIREBASE_KEY) {
    // Очищаємо ключ від можливих зайвих символів або проблем із переносом рядків
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
    
    // Додаткова перевірка формату приватного ключа
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("✅ Firebase успішно підключено");
    }
  } else {
    console.error("❌ FIREBASE_KEY не знайдено!");
  }
} catch (error) {
  console.error("❌ Помилка ініціалізації ключа:", error.message);
}

const db = admin.firestore();

// Тестовий маршрут
app.get("/", (req, res) => {
  res.send("Сервер Render працює!");
});

// Основний маршрут для Варіанта 24
app.get("/api/trips", async (req, res) => {
  try {
    // Переконайся, що в Firebase колекція називається саме "destinations"
    const snapshot = await db.collection("destinations").get();
    
    if (snapshot.empty) {
      console.log("⚠️ Колекція порожня");
      return res.json([]);
    }

    let trips = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // Сортування за ціною
    trips.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)); 
    
    res.json(trips);
  } catch (error) {
    console.error("❌ Помилка Firestore:", error.message);
    res.status(500).json({ error: "Помилка бази даних", details: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер на порту ${PORT}`);
});
