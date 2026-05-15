const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require('fs');

// Надійно зчитуємо файл ключа [cite: 285-286]
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

// Налаштування Middleware [cite: 222-223]
app.use(cors());
app.use(express.json());

// Варіант 24: Маршрут для отримання списку подорожей із сортуванням за ціною [cite: 673]
app.get("/api/trips", async (req, res) => {
  try {
    const snapshot = await db.collection("destinations").get();
    let trips = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Сортування за ціною (від меншої до більшої)
    trips.sort((a, b) => a.price - b.price);
    
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера на порту 5000 [cite: 224-226]
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});