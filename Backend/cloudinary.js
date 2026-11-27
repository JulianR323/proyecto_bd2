require("dotenv").config();
const cloudinary = require("cloudinary").v2

//CONFIGURACION DEL ALMACENAMIENTO EN LA NUBE

//USAMOS .trim() para eliminar espacios accidentales al final de cada linea .env

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

cloudinary.config({
    cloud_name:cloudName,
    api_key:apiKey,
    api_secret:apiSecret
});

//Recibe una imagen en formato base64 desde el frontend, la sube a cloudinary en la carpeta 
//"mi_tienda_productos" y retorna un enlace seguro de tipo https

async function subirImagenCloudinary(imagenBase64){
    if (!cloudName || !apiKey || !apiSecret){
        throw new Error(
            "Faltan las credenciales de Cloudinary en el archivo .env"
        );
    }
    //Detectar si el API Secret se copio truncado o incompleto desde la tabla cloudinary
    if(apiSecret.includes("...")){
        throw new Error(
            "Tu API_SECRET en .env esta incompleta"
        )
    }
    const resultado = await cloudinary.uploader.upload(imagenBase64, {folder: "mi_tienda_productos", resource_type:"image",})
    // RETORNAMOS LA URL publica segura

    return resultado.secure_url;
}

module.exports = {cloudinary, subirImagenCloudinary};



