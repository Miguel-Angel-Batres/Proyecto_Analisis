const express = require("express");
const {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} = require("firebase/firestore");

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

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
                    profilePicture: userData.profilePicture || null,
                    rol: userData.rol || 'usuario', 
                },
            });
            console.log('Usuario autenticado exitosamente:', userDoc.id);
        } catch (error) {
            console.error('Error al autenticar usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

  router.put("/usuarios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, correo, telefono, contraseña } = req.body;
      const usuarioRef = doc(db, "usuarios", id);
      await updateDoc(usuarioRef, { nombre, correo, telefono, contraseña });
      res.status(200).json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete("/usuarios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const usuarioRef = doc(db, "usuarios", id);
      console.log(`Eliminando usuario con ID: ${id}`);
      await deleteDoc(usuarioRef);
      console.log(`Usuario con ID: ${id} eliminado exitosamente`);
      res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/citas", async (req, res) => {
    try {
      const {
        usuarioId,
        fecha,
        hora,
        servicios,
        duracion,
        precioTotal,
        estado,
        notas,
      } = req.body;
      const citaData = {
        usuarioId,
        fecha,
        hora,
        servicios,
        duracion,
        precioTotal,
        estado,
        notas,
      };
      const docRef = await addDoc(collection(db, "citas"), citaData);
      res.status(201).json({ message: "Cita creada", id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/citas", async (req, res) => {
    try {
      const citasSnapshot = await getDocs(collection(db, "citas"));
      const citas = citasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.status(200).json(citas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/citas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const citaDoc = await getDoc(doc(db, "citas", id));
      if (!citaDoc.exists()) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }
      res.status(200).json({ id: citaDoc.id, ...citaDoc.data() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put("/citas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        usuarioId,
        fecha,
        hora,
        servicios,
        duracion,
        precioTotal,
        estado,
        notas,
      } = req.body;
      const citaRef = doc(db, "citas", id);
      await updateDoc(citaRef, {
        usuarioId,
        fecha,
        hora,
        servicios,
        duracion,
        precioTotal,
        estado,
        notas,
      });
      res.status(200).json({ message: "Cita actualizada" });
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
    router.post('/servicios', upload.single('imagen'), async (req, res) => {
        try {
          const { nombre, descripcion, precio, duracion, categoria } = req.body;
          const imagen = req.file ? req.file.buffer.toString('base64') : null;

          console.log('Imagen recibida:', req.file);
          console.log('Imagen en base64:', imagen);
      
          if (!nombre || !descripcion || !precio || !duracion || !categoria || !imagen) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
          }
      
          const servicioData = { nombre, descripcion, precio, duracion, categoria, imagen };
          const docRef = await addDoc(collection(db, 'servicios'), servicioData);
      
          res.status(201).json({ message: 'Servicio agregado exitosamente', id: docRef.id });
        } catch (error) {
          console.error('Error al agregar el servicio:', error);
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
    // put pero sin imagen
    router.put('/servicios/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, descripcion, precio, duracion, categoria } = req.body;
            const servicioRef = doc(db, 'servicios', id);
            const updateData = { nombre, descripcion, precio, duracion, categoria };

            await updateDoc(servicioRef, updateData);
            res.status(200).json({ message: 'Servicio actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    router.put('/servicios/:id/imagen', upload.single('imagen'), async (req, res) => {
        try {
            const { id } = req.params;
            const imagen = req.file ? req.file.buffer.toString('base64') : null;
    
            if (!imagen) {
                return res.status(400).json({ error: 'No se proporcionó una imagen' });
            }
    
            const servicioRef = doc(db, 'servicios', id);
            await updateDoc(servicioRef, { imagen });
    
            // Obtén el servicio actualizado
            const servicioDoc = await getDoc(servicioRef);
            const servicioActualizado = { id: servicioDoc.id, ...servicioDoc.data() };
    
            // Devuelve el servicio actualizado
            res.status(200).json(servicioActualizado);
        } catch (error) {
            console.error('Error al actualizar la imagen:', error);
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

    


  return router;
};
