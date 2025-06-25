const express = require('express');
const multer = require('multer');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth'); 
const firebaseConfig = require('../key.json'); 

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } = require('firebase/firestore');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = () => {
    const router = express.Router();

    router.get('/', (req, res) => {
        res.send('Bienvenido a la página principal');
    });
    router.get('/start', (req, res) => {
        res.send('Servidor iniciado correctamente');
    });
    router.post('/usuarios', upload.single('profilePicture'), async (req, res) => {
        

        const { email, password, phone, name } = req.body;
        const profilePicture = req.file;

        try {
            const usuarioData = {
                email: email,
                phone: phone,
                nombre: name,
                password: password, 
                profilePicture: profilePicture ? profilePicture.buffer.toString('base64') : null,
            };

            const docRef = await addDoc(collection(db, 'usuarios'), usuarioData);

            console.log('Usuario guardado en la base de datos con ID:', docRef.id);

            res.status(201).json({ 
                message: 'Usuario creado exitosamente', 
                dbId: docRef.id 
            });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({ error: error.message });
        }
    });
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;
    
        try {
            const usersSnapshot = await getDocs(collection(db, 'usuarios'));
            const userDoc = usersSnapshot.docs.find(doc => doc.data().email === email);
    
            if (!userDoc) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
    
            const userData = userDoc.data();
            if (userData.password !== password) {
                return res.status(401).json({ error: 'Credenciales incorrectas' });
            }
    
            res.status(200).json({
                message: 'Usuario autenticado',
                user: {
                    id: userDoc.id,
                    email: userData.email,
                    name: userData.nombre,
                    profilePicture: userData.profilePicture || null
                },
            });
            console.log('Usuario autenticado exitosamente:', userDoc.id);
        } catch (error) {
            console.error('Error al autenticar usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    router.put('/usuarios/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, correo, telefono, contraseña } = req.body;
            const usuarioRef = doc(db, 'usuarios', id);
            await updateDoc(usuarioRef, { nombre, correo, telefono, contraseña });
            res.status(200).json({ message: 'Usuario actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.delete('/usuarios/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const usuarioRef = doc(db, 'usuarios', id);
            console.log(`Eliminando usuario con ID: ${id}`);
            await deleteDoc(usuarioRef);
            console.log(`Usuario con ID: ${id} eliminado exitosamente`);
            res.status(200).json({ message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/citas', async (req, res) => {
        try {
            const { usuarioId, fecha, hora, servicios, duracion, precioTotal, estado, notas } = req.body;
            const citaData = { usuarioId, fecha, hora, servicios, duracion, precioTotal, estado, notas };
            const docRef = await addDoc(collection(db, 'citas'), citaData);
            res.status(201).json({ message: 'Cita creada', id: docRef.id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/citas', async (req, res) => {
        try {
            const citasSnapshot = await getDocs(collection(db, 'citas'));
            const citas = citasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(citas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/citas/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const citaDoc = await getDoc(doc(db, 'citas', id));
            if (!citaDoc.exists()) {
                return res.status(404).json({ error: 'Cita no encontrada' });
            }
            res.status(200).json({ id: citaDoc.id, ...citaDoc.data() });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.put('/citas/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { usuarioId, fecha, hora, servicios, duracion, precioTotal, estado, notas } = req.body;
            const citaRef = doc(db, 'citas', id);
            await updateDoc(citaRef, { usuarioId, fecha, hora, servicios, duracion, precioTotal, estado, notas });
            res.status(200).json({ message: 'Cita actualizada' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.delete('/citas/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const citaRef = doc(db, 'citas', id);
            await deleteDoc(citaRef);
            res.status(200).json({ message: 'Cita eliminada' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // Manejo de servicios, su precio duracion, descripcion,etc.
    router.post('/servicios', async (req, res) => {
        try {
            const { nombre, descripcion, precio, duracion, categoria, imagen } = req.body;
            const servicioData = { nombre, descripcion, precio, duracion, categoria, imagen };
            const docRef = await addDoc(collection(db, 'servicios'), servicioData);
            res.status(201).json({ message: 'Servicio agregado exitosamente', id: docRef.id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    router.get('/servicios', async (req, res) => {
        try {
            const serviciosSnapshot = await getDocs(collection(db, 'servicios'));
            const servicios = serviciosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(servicios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    router.get('/servicios/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const servicioDoc = await getDoc(doc(db, 'servicios', id));
            if (!servicioDoc.exists()) {
                return res.status(404).json({ error: 'Servicio no encontrado' });
            }
            res.status(200).json({ id: servicioDoc.id, ...servicioDoc.data() });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    router.put('/servicios/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, descripcion, precio, duracion, categoria, imagen } = req.body;
            const servicioRef = doc(db, 'servicios', id);
            await updateDoc(servicioRef, { nombre, descripcion, precio, duracion, categoria, imagen });
            res.status(200).json({ message: 'Servicio actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    router.delete('/servicios/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const servicioRef = doc(db, 'servicios', id);
            await deleteDoc(servicioRef);
            res.status(200).json({ message: 'Servicio eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Estilos de uñas, añadir, eliminar, actualizar, ver
    router.post('/uñas', async (req, res) => {
        try {
            const { nombre, tipo, colores, imagen, precio, tendencia } = req.body;
            const estiloData = { nombre, tipo, colores, imagen, precio, tendencia };
            const docRef = await addDoc(collection(db, 'estilos'), estiloData);
            res.status(201).json({ message: 'Estilo agregado exitosamente', id: docRef.id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/uñas', async (req, res) => {
        try {
            const estilosSnapshot = await getDocs(collection(db, 'estilos'));
            const estilos = estilosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(estilos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/uñas/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const estiloDoc = await getDoc(doc(db, 'estilos', id));
            if (!estiloDoc.exists()) {
                return res.status(404).json({ error: 'Estilo no encontrado' });
            }
            res.status(200).json({ id: estiloDoc.id, ...estiloDoc.data() });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.put('/uñas/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, tipo, colores, imagen, precio, tendencia } = req.body;
            const estiloRef = doc(db, 'estilos', id);
            await updateDoc(estiloRef, { nombre, tipo, colores, imagen, precio, tendencia });
            res.status(200).json({ message: 'Estilo actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.delete('/uñas/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const estiloRef = doc(db, 'estilos', id);
            await deleteDoc(estiloRef);
            res.status(200).json({ message: 'Estilo eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Peinados, looks, añadir eliminar, actualizar, ver
    router.post('/peinados', async (req, res) => {
        try {
            const { nombre, tipoCabello, imagen, precio, ocasion } = req.body;
            const peinadoData = { nombre, tipoCabello, imagen, precio, ocasion };
            const docRef = await addDoc(collection(db, 'peinados'), peinadoData);
            res.status(201).json({ message: 'Peinado agregado exitosamente', id: docRef.id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/peinados', async (req, res) => {
        try {
            const peinadosSnapshot = await getDocs(collection(db, 'peinados'));
            const peinados = peinadosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(peinados);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/peinados/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const peinadoDoc = await getDoc(doc(db, 'peinados', id));
            if (!peinadoDoc.exists()) {
                return res.status(404).json({ error: 'Peinado no encontrado' });
            }
            res.status(200).json({ id: peinadoDoc.id, ...peinadoDoc.data() });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.put('/peinados/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, tipoCabello, imagen, precio, ocasion } = req.body;
            const peinadoRef = doc(db, 'peinados', id);
            await updateDoc(peinadoRef, { nombre, tipoCabello, imagen, precio, ocasion });
            res.status(200).json({ message: 'Peinado actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.delete('/peinados/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const peinadoRef = doc(db, 'peinados', id);
            await deleteDoc(peinadoRef);
            res.status(200).json({ message: 'Peinado eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });


    return router;
};