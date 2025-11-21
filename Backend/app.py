from flask import Flask, request, jsonify, send_file
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
        FROM sensor_reading sr
        JOIN plants p ON sr.plant_id = p.id
        JOIN plant_types pt ON p.plant_type_id = pt.id
        WHERE sr.reading_timestamp = (
            SELECT MAX(reading_timestamp) 
            FROM sensor_reading
        )
        ORDER BY sr.reading_timestamp DESC
        LIMIT 1
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        # Si todavía no hay datos, devolver datos de ejemplo
        if not results:
            results = [{
                'plant_id': 1,
                'plant_type_name': 'Default Plant',
                'temperature': 25.0,
                'humidity': 60.0,
                'reading_timestamp': datetime.now(),
                'optimal_temp': 25.0,
                'optimal_humidity': 60.0
            }]
        
        # Convertir datetime a string para JSON
        for result in results:
            if result.get('reading_timestamp'):
                result['reading_timestamp'] = result['reading_timestamp'].isoformat()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'data': results,
            'total_plants': len(results)
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
          

# Ruta para obtener datos históricos para la gráfica
@app.route('/api/python/historical-data', methods=['GET'])
def get_historical_data():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Obtener últimos 7 días de datos de temperatura
        query = """
        SELECT 
            DATE(reading_timestamp) as date,
            AVG(temperature) as avg_temperature,
            AVG(humidity) as avg_humidity,
            COUNT(*) as readings_count
        FROM sensor_reading 
        WHERE reading_timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(reading_timestamp)
        ORDER BY date ASC
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        # Si no hay suficientes datos, generar algunos de ejemplo basados en datos existentes
        if len(results) < 3:
            cursor.execute("""
                SELECT 
                    temperature,
                    humidity,
                    reading_timestamp
                FROM sensor_reading 
                ORDER BY reading_timestamp DESC 
                LIMIT 50
            """)
            recent_data = cursor.fetchall()
            
            if recent_data:
                # Generar datos para los últimos 7 días basados en promedios
                from datetime import datetime, timedelta
                import random
                
                avg_temp = sum([d['temperature'] for d in recent_data if d['temperature']]) / len(recent_data)
                avg_humidity = sum([d['humidity'] for d in recent_data if d['humidity']]) / len(recent_data)
                
                results = []
                for i in range(7, 0, -1):
                    date = datetime.now() - timedelta(days=i)
                    # Variación aleatoria basada en el promedio
                    temp_variation = random.uniform(-3, 3)
                    humidity_variation = random.uniform(-5, 5)
                    
                    results.append({
                        'date': date.date().isoformat(),
                        'avg_temperature': round(avg_temp + temp_variation, 1),
                        'avg_humidity': round(avg_humidity + humidity_variation, 1),
                        'readings_count': random.randint(5, 15)
                    })
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'data': results,
            'time_period': '7 days'
        })
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Ruta para datos detallados de temperatura (últimas 24 horas)
@app.route('/api/python/temperature-details', methods=['GET'])
def get_temperature_details():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Obtener datos horarios de las últimas 24 horas
        query = """
        SELECT 
            DATE_FORMAT(reading_timestamp, '%Y-%m-%d %H:00:00') as hour,
            AVG(temperature) as avg_temperature,
            AVG(humidity) as avg_humidity,
            COUNT(*) as readings_count
        FROM sensor_reading 
        WHERE reading_timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY DATE_FORMAT(reading_timestamp, '%Y-%m-%d %H:00:00')
        ORDER BY hour ASC
        LIMIT 24
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'data': results,
            'time_period': '24 hours'
        })
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

    import matplotlib.pyplot as plt
    from matplotlib.ticker import MaxNLocator
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    import io
    import datetime

    styles = getSampleStyleSheet()

    # ----------------------------------------------------
    # 1. GET CURRENT DASHBOARD DATA
    # ----------------------------------------------------
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            sr.temperature AS temperature,
            sr.humidity AS humidity,
            sr.reading_timestamp,
            pt.name AS plant_type_name
        FROM sensor_reading sr
        JOIN plants p ON sr.plant_id = p.id
        JOIN plant_types pt ON p.plant_type_id = pt.id
        ORDER BY sr.reading_timestamp DESC
        LIMIT 1
    """)
    current_row = cursor.fetchone()

    if current_row:
        current_temp = current_row["temperature"]
        current_humidity = current_row["humidity"]
        last_update = current_row["reading_timestamp"].strftime("%Y-%m-%d %H:%M")
    else:
        current_temp = "N/A"
        current_humidity = "N/A"
        last_update = "N/A"

    # ----------------------------------------------------
    # 2. HISTORICAL DATA FOR CHART (LAST 7 DAYS)
    # ----------------------------------------------------
    cursor.execute("""
        SELECT 
            DATE(reading_timestamp) AS date,
            AVG(temperature) AS avg_temperature,
            AVG(humidity) AS avg_humidity
        FROM sensor_reading
        WHERE reading_timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(reading_timestamp)
        ORDER BY date ASC
    """)
    historical = cursor.fetchall()

    dates = [str(r["date"]) for r in historical]
    temps = [float(r["avg_temperature"]) for r in historical]
    hums = [float(r["avg_humidity"]) for r in historical]

    # ----------------------------------------------------
    # 3. CREATE MATPLOTLIB CHART
    # ----------------------------------------------------
    plt.figure(figsize=(7, 4))
    ax = plt.gca()

    # Bars - Temp
    ax.bar(dates, temps, color="#4E79A7", label="Temperature (°C)")

    # Line - Humidity
    ax2 = ax.twinx()
    ax2.plot(dates, hums, color="#F28E2B", marker="o", label="Humidity (%)", linewidth=2)

    ax.set_title("Temperature & Humidity Trends (Last 7 Days)", fontsize=12, weight="bold")
    ax.set_ylabel("Temperature (°C)")
    ax2.set_ylabel("Humidity (%)")
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))

    ax.grid(axis="y", linestyle="--", alpha=0.3)

    chart_buffer = io.BytesIO()
    plt.tight_layout()
    plt.savefig(chart_buffer, format="png", dpi=120)
    plt.close()
    chart_buffer.seek(0)

    # ----------------------------------------------------
    # 4. TABLE: Average Temp/Humidity by Plant (Last 5 Days)
    # ----------------------------------------------------
    cursor.execute("""
        SELECT 
            pt.name AS plant_name,
            DATE(sr.reading_timestamp) AS date,
            AVG(sr.temperature) AS avg_temp,
            AVG(sr.humidity) AS avg_humidity
        FROM sensor_reading sr
        JOIN plants p ON sr.plant_id = p.id
        JOIN plant_types pt ON p.plant_type_id = pt.id
        WHERE sr.reading_timestamp >= DATE_SUB(NOW(), INTERVAL 5 DAY)
        GROUP BY pt.name, DATE(sr.reading_timestamp)
        ORDER BY pt.name, date ASC
    """)
    table_rows = cursor.fetchall()

    cursor.close()
    connection.close()

    table_data = [["Plant", "Date", "Avg Temp (°C)", "Avg Humidity (%)"]]
    for row in table_rows:
        table_data.append([
            row["plant_name"],
            str(row["date"]),
            f"{row['avg_temp']:.1f}",
            f"{row['avg_humidity']:.1f}"
        ])

    # ----------------------------------------------------
    # 5. BUILD PDF
    # ----------------------------------------------------
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)

    elements = []

    # Title
    elements.append(Paragraph("Harvest Predictor – Field Report", styles["Title"]))
    elements.append(Spacer(1, 12))

    # Current State
    elements.append(Paragraph("<b>Overall Current State of the Field</b>", styles["Heading2"]))
    elements.append(Paragraph(f"Temperature: {current_temp} °C", styles["Normal"]))
    elements.append(Paragraph(f"Humidity: {current_humidity} %", styles["Normal"]))
    elements.append(Paragraph(f"Last Update: {last_update}", styles["Normal"]))
    elements.append(Spacer(1, 16))

    # Chart title
    elements.append(Paragraph("<b>Temperature & Humidity (Last 7 Days)</b>", styles["Heading2"]))
    elements.append(Spacer(1, 8))

    # Chart image
    elements.append(Image(chart_buffer, width=480, height=300))
    elements.append(Spacer(1, 20))

    # Table title
    elements.append(Paragraph("<b>Average Temperature & Humidity per Plant (Last 5 Days)</b>", styles["Heading2"]))
    elements.append(Spacer(1, 10))

    # Table styling
    table = Table(table_data, colWidths=[120, 80, 120, 120])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4E79A7")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.lightgrey])
    ]))

    elements.append(table)

    doc.build(elements)

    pdf_buffer.seek(0)

    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name="harvest_report.pdf",
        mimetype="application/pdf"
    )

    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet
    import matplotlib.pyplot as plt
    import io
    import datetime

    # ---- Obtener datos para el reporte ----
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            DATE(reading_timestamp) as date,
            AVG(temperature) as avg_temperature,
            AVG(humidity) as avg_humidity
        FROM sensor_reading
        GROUP BY DATE(reading_timestamp)
        ORDER BY date DESC
        LIMIT 5
    """)
    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    # datos por defecto
    if not rows:
        rows = [
            {"date": "2025-01-01", "avg_temperature": 20, "avg_humidity": 50},
            {"date": "2025-01-02", "avg_temperature": 21, "avg_humidity": 55}
        ]

    # ---- Generar gráfica con matplotlib ----
    dates = [str(r["date"]) for r in rows]
    temps = [float(r["avg_temperature"]) for r in rows]

    plt.figure()
    plt.plot(dates, temps, marker="o")
    plt.title("Promedio de Temperatura por Día")
    plt.xlabel("Fecha")
    plt.ylabel("Temperatura (°C)")
    plt.tight_layout()

    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png')
    plt.close()
    img_buffer.seek(0)

    # 3. ---- Crear PDF con ReportLab ----
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    flow = []

    flow.append(Paragraph("Reporte de HarvestPredictor", styles["Title"]))
    flow.append(Spacer(1, 12))

    fecha = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")
    flow.append(Paragraph(f"Fecha de generación: {fecha}", styles["Normal"]))
    flow.append(Spacer(1, 12))

    flow.append(Paragraph("Gráfica de temperatura promedio de los últimos días:", styles["Heading2"]))
    flow.append(Spacer(1, 10))

    # Agregar imagen al PDF
    flow.append(Image(img_buffer, width=400, height=250))

    doc.build(flow)

    # ---- Enviar PDF como descarga ----
    pdf_buffer.seek(0)

    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name="reporte.pdf",
        mimetype="application/pdf"
    )

if __name__ == '__main__':
    print("=== Harvest Predictor Backend ===")
    print("Iniciando servidor en http://localhost:5000")
    print("Endpoints disponibles:")
    print("  GET /api/python/health - Verificar estado del backend")
    print("  GET /api/python/test-db - Probar conexión a base de datos")
    print("  GET /api/python/plant-types - Obtener tipos de plantas")
    app.run(debug=True, port=5000, host='0.0.0.0')