from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)  # Permite comunicación con tu frontend

# Configuración de la base de datos
db_config = {
    'host': 'bakmkys5zfkxrgkxfmki-mysql.services.clever-cloud.com',
    'user': 'ux8tdoxqchjuxlw3',
    'password': 'KeVnDkWjhNRh8j1bj9cu',
    'database': 'bakmkys5zfkxrgkxfmki',
    'port': 3306
}

# Función para conectar a la base de datos
def get_db_connection():
    return mysql.connector.connect(**db_config)

# Ruta de salud para probar
@app.route('/api/python/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'success', 
        'message': 'Backend Python funcionando correctamente',
        'timestamp': datetime.now().isoformat()
    })

# Ruta simple para probar la base de datos
@app.route('/api/python/test-db', methods=['GET'])
def test_database():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Probemos con una consulta simple
        cursor.execute("SELECT COUNT(*) as count FROM plant_types")
        result = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'message': f'Conexión exitosa. Tipos de plantas encontrados: {result["count"]}',
            'database_connected': True
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error', 
            'message': str(e),
            'database_connected': False
        }), 500
    
# Ruta para obtener datos del dashboard
@app.route('/api/python/dashboard-data', methods=['GET'])
def get_dashboard_data():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Obtener las lecturas más recientes de cada planta
        query = """
        SELECT 
            p.id as plant_id,
            pt.name as plant_type_name,
            sr.temperature,
            sr.humidity,
            sr.reading_timestamp,
            pt.optimal_temp,
            pt.optimal_humidity
        FROM plants p
        JOIN plant_types pt ON p.plant_type_id = pt.id
        LEFT JOIN sensor_reading sr ON p.id = sr.plant_id
        WHERE sr.reading_timestamp = (
            SELECT MAX(reading_timestamp) 
            FROM sensor_reading 
            WHERE plant_id = p.id
        )
        ORDER BY p.id
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        # Si no hay datos, devolver datos de ejemplo de plant_types
        if not results:
            cursor.execute("SELECT * FROM plant_types LIMIT 1")
            plant_type = cursor.fetchone()
            if plant_type:
                results = [{
                    'plant_id': 1,
                    'plant_type_name': plant_type['name'],
                    'temperature': 25.0,
                    'humidity': 60.0,
                    'reading_timestamp': datetime.now(),
                    'optimal_temp': plant_type['optimal_temp'],
                    'optimal_humidity': plant_type['optimal_humidity']
                }]
        
        # Convertir datetime a string para JSON
        for result in results:
            if result.get('reading_timestamp'):
                result['reading_timestamp'] = result['reading_timestamp'].isoformat()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'data': results
        })
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Ruta para datos históricos de temperatura (para el gráfico)
@app.route('/api/python/temperature-history/<int:plant_id>', methods=['GET'])
def get_temperature_history(plant_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Obtener últimas 24 lecturas de temperatura
        query = """
        SELECT temperature, reading_timestamp
        FROM sensor_reading
        WHERE plant_id = %s
        ORDER BY reading_timestamp DESC
        LIMIT 24
        """
        cursor.execute(query, (plant_id,))
        results = cursor.fetchall()
        
        # Convertir datetime a string para JSON
        for result in results:
            if result.get('reading_timestamp'):
                result['reading_timestamp'] = result['reading_timestamp'].isoformat()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'data': results
        })
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
# Ruta para crear nueva planta
@app.route('/api/python/plants', methods=['POST'])
def create_plant():
    try:
        data = request.json
        plant_type_id = data.get('plant_type_id')
        planting_date = data.get('planting_date')
        
        if not all([plant_type_id, planting_date]):
            return jsonify({'status': 'error', 'message': 'Faltan datos requeridos'}), 400
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = "INSERT INTO plants (plant_type_id, planting_date) VALUES (%s, %s)"
        cursor.execute(query, (plant_type_id, planting_date))
        connection.commit()
        
        plant_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success', 
            'message': 'Planta creada correctamente',
            'plant_id': plant_id
        })
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Ruta para crear nuevo tipo de planta
@app.route('/api/python/plant-types', methods=['POST'])
def create_plant_type():
    try:
        data = request.json
        name = data.get('name')
        optimal_temp = data.get('optimal_temp')
        optimal_humidity = data.get('optimal_humidity')
        
        if not all([name, optimal_temp, optimal_humidity]):
            return jsonify({'status': 'error', 'message': 'Faltan datos requeridos'}), 400
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = "INSERT INTO plant_types (name, optimal_temp, optimal_humidity) VALUES (%s, %s, %s)"
        cursor.execute(query, (name, optimal_temp, optimal_humidity))
        connection.commit()
        
        plant_type_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success', 
            'message': 'Tipo de planta creado correctamente',
            'plant_type_id': plant_type_id
        })
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Ruta para obtener tipos de plantas
@app.route('/api/python/plant-types', methods=['GET'])
def get_plant_types():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM plant_types ORDER BY name"
        cursor.execute(query)
        results = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'data': results
        })
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    print("=== Harvest Predictor Backend ===")
    print("Iniciando servidor en http://localhost:5000")
    print("Endpoints disponibles:")
    print("  GET /api/python/health - Verificar estado del backend")
    print("  GET /api/python/test-db - Probar conexión a base de datos")
    print("  GET /api/python/plant-types - Obtener tipos de plantas")
    app.run(debug=True, port=5000, host='0.0.0.0')