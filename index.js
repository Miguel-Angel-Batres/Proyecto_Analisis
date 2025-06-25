const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const firebaseConfig = require("./.secrets/key.json");

const app = express();

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
app.use(
  cors({
    origin: "*", // Permitir todas as origens
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Cabeçalhos permitidos
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", routes(db));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
