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
app.post('/lectura', async (req, res) => {
    // Extraemos la humedad y temperatura del cuerpo de la petición
    const { humidity, temperature } = req.body;

    // Verificamos que los datos hayan llegado
    if (humidity === undefined || temperature === undefined) {
        return res.status(400).json({ error: 'Faltan datos de humedad o temperatura.' });
    }

    console.log(`Datos recibidos -> Humidity: ${humidity}%, Temperature: ${temperature}°C, Ligth: 0`);

    try {
        // Conectamos a la base de datos
        const connection = await mysql.createConnection(dbConfig);
        
        // Preparamos la consulta SQL para insertar los datos de forma segura
        const sql = 'INSERT INTO sensor_reading (humidity, temperature, light_intensity) VALUES (?, ?, ?)';
        
        // Ejecutamos la consulta con los valores recibidos
        await connection.execute(sql, [humidity, temperature, 0]);
        
        // Cerramos la conexión
        await connection.end();
        
        // Enviamos una respuesta de éxito al ESP32
        res.status(201).json({ message: 'Datos guardados exitosamente.' });

    } catch (error) {
        console.error('Error al conectar o guardar en la base de datos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});