const mysql = require('mysql2');

// Configuracion de la conexion a MySQL
const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tienda'
});

// Comprobar si la conexion fue exitosa
conexion.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});
//exportar la conexion para reutilizarla en otros archivos
module.exports = conexion;