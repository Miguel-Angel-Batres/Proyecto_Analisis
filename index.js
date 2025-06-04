const express = require('express');
const routes = require('./routes/routes');
const { initializeApp } = require('firebase/app');
const { getAnalytics } = require('firebase/analytics');
const firebaseConfig = require('./key.json'); 

const app = express();

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', routes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});