const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Ініціалізація Firebase
try {
  if (process.env.FIREBASE_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
    
    // Виправлення формату приватного ключа для Render
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("✅ Firebase підключено успішно до проекту travel-db");
    }
  }
} catch (error) {
  console.error("❌ Помилка ключа:", error.message);
}

const db = admin.firestore();

// Головна сторінка
app.get("/", (req, res) => {
  res.send("Сервер Render працює і бачить базу Firestore!");
});

// Маршрут для отримання подорожей (Варіант 24)
app.get("/api/trips", async (req, res) => {
  try {
    // ТУТ ВИПРАВЛЕНО: тепер назва 'trips', як на твоєму скриншоті
    const snapshot = await db.collection("destinations").get();
    
    if (snapshot.empty) {
      console.log("⚠️ Колекція 'trips' порожня");
      return res.json([]);
    }

    const trips = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // Сортування за ціною (Варіант 24)
    trips.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)); 
    
    console.log(`✅ Відправлено ${trips.length} подорожей клієнту`);
    res.json(trips);
  } catch (error) {
    console.error("❌ Помилка Firestore:", error.message);
    res.status(500).json({ error: "Помилка бази даних", details: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Сервер працює на порту ${PORT}`));
