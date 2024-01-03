// Importar mongoose
const mongoose = require("mongoose");
// mongoose.set("strictQuery",true);

// Metodo de conexión
const connection = async() => {
    try {
        console.log("Hola Mundo!!")
        await mongoose.connect("mongodb://127.0.0.1:27017/app_musica");

        console.log("Conectado correctamente a la bd: app_musica");

    } catch (error) {
        console.log(error);
        throw new Error("No se ha establecido la conexión a la bbdd !!");
    }
}

// Exportar conexión 
module.exports = {connection};