require('dotenv').config();
const mysql = require('mysql2');

// Configuracion de la conexion a MySQL
const host = process.env.DB_HOST || "localhost";
const port = Number(process.env.DB_PORT) || 3306;
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_NAME || "tienda";

//opciones de configuracion
const configuracion = {
  host,
  port,
  user,
  password,
  database,
};

//si el host es remoto (TiDB cloud), habilitar el SSL automaticamente
if (host !== "localhost" && host !== "127.0.0.1") {
  configuracion.ssl = {
    minVersion: "TLSv1.2", 
    rejectUnauthorized: true,
  }
}

// Crear la conexion con  MySQL o TiBD cloud
const conexion = mysql.createConnection(configuracion)

// Comprobamos si la conexion fue exitosa
conexion.connect((error) => {
if (error) {
  console.error("Error al conectar con la base de datos", error.message)
}
console.log(`Conexion exitosa con la base de datos (${host}:${port})`);
})

// exportar la conexion para reutilizarla en las rutas del servidor
module.exports = conexion;