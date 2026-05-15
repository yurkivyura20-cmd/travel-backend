const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

try {
  if (process.env.FIREBASE_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
    
    // Виправляємо можливу проблему з приватним ключем
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("✅ Firebase підключено успішно!");
    }
  }
} catch (error) {
  console.error("❌ Помилка ініціалізації ключа:", error.message);
}

const db = admin.firestore();

app.get("/api/trips", async (req, res) => {
  try {
    // ПЕРЕВІР: Колекція у Firebase точно називається "destinations"?
    const snapshot = await db.collection("destinations").get();
    
    const trips = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // Сортування (Варіант 24)
    trips.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)); 
    
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Помилка бази даних", details: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Сервер на порту ${PORT}`));
