const express = require('express');
const routes = require('./routes/routes');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const firebaseConfig = require('./key.json'); 

const app = express();

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', routes(db));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});