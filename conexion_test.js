const express = require('express');
const mysql = require('mysql2/promise');

// --- Configuración del Servidor ---
const app = express();
const PORT = 3000; // Puerto para la API

// Se usa para que el servidor entienda JSON
app.use(express.json());

// --- Config de la Base de Datos ---
const dbConfig = {
    host: 'bakmkys5zfkxrgkxfmki-mysql.services.clever-cloud.com',  //Ip de la compu donde esta la base
    user: 'ux8tdoxqchjuxlw3', // Usuario de tu MySQL
    password: 'KeVnDkWjhNRh8j1bj9cu',  // Contraseña de MySQL 
    database: 'bakmkys5zfkxrgkxfmki' //Nombre de la base
};

// --- Endpoint
// *El ESP32 enviará los datos a la URL: http://<IP_DE_TU_PC>:3000/lectura, mantener localhost
app.post('/conexion', async (req, res) => {
        try {
        // Conectamos a la base de datos
        const connection = await mysql.createConnection(dbConfig);
        
        // Cerramos la conexión
        await connection.end();
        
        // Imprimimos un mensaje de éxito
        res.status(201).json({ message: 'Conexión exitosa a la base de datos.' });

    } catch (error) {
        console.error('Error al conectar ala base de datos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});