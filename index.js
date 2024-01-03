// Importar conexion a base de datos
const {connection} = require("./database/connection");

// Importar dependencias
const express = require("express");
const cors = require("cors");

// Mensaje de bienvenida
console.log("api musica arrancada");

// Ejecutar conexion a la bd
connection();

// Crear servidor de node
const app = express();
const port = 3910;

// Configurar cors
app.use(cors());

// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Cargar configuracion de rutas
const userRoutes = require("./routes/user");
const artistRoutes = require("./routes/artist");
const albumRoutes = require("./routes/album");
const songRoutes = require("./routes/song");

app.use("/api/user",userRoutes);
app.use("/api/artist",artistRoutes);
app.use("/api/album",albumRoutes);
app.use("/api/song",songRoutes);

// Ruta de prueba
app.get("/ruta-probando",(req,res) => {

    return res.status(200).send({
        "id":12,
        "nombre":"Williams",
        "apellido":"Velasco"
    })
})

// Poner el servidor a escuchar peticiones http  
app.listen(port, ()=>{
    console.log("Servidor de node corriendo en el puerto: "+port)
})