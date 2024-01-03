// Importaciones
const album = require("../models/album");
const song = require("../models/song");
const fs = require("fs");
const path = require("path");
const mongoosePaginate = require("mongoose-pagination");

// Accion de prueba
const prueba = (req,res) =>{
    return res.status(200).send({
        status:"Success",
        message:"MEnsaje enviado desde: controllers/album.js"
    })
}

const save = (req,res) => {
    // Recoger datos del body
    const params = req.body;
    // Si no llega dar respuesta negativa
    if (!params.title || !params.artist || !params.year) { return res.status(401).send({ status: "Error", message: "Error en los parámetros enviados" }) }
    // Crear y rellenar el objeto del modelo
    let newAlbum = new album(params);
    // newArtist.user = req.user.id;
    // Guardar objeto en BD
    newAlbum.save().then((albumStored) => {
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Se ha guardado el album",
            albumStored
        })
    }).catch((error) => {
        // Devolver respuesta de error en la consulta
        return res.status(403).send({
            status: "Error",
            message: "Error al guardar el album",
            error: error
        })
    })
}
const one = (req, res) => {
    // Sacar id de publicacion de la url
    const albumId = req.params.id;

    album.findOne({ _id: albumId }).populate({path:"artist"}).then((album) => {
        return res.status(200).send({
            status: "Success",
            message: "Detalle Album",
            album: album
        })
    }).catch((error) => {
        return res.status(403).send({
            status: "Error",
            message: "No existe el album",
            error:error
        })
    })

}
const list = (req, res) => {
    // Sacar el id de album
    let artistId = req.params.id

    // Comprobar que exista el artista
    if (!artistId) {
        return res.status(403).send({
            status: "Error",
            message: "No existe artista"
        })
    }

    // Sacar la pagina actual
    let page = 1
    if (req.params.page) { page = req.params.page; }

    // Establecer numero de elementos por pagina
    const itemsPerPage = 5;

    try {
        album.find({artist:artistId})
            .populate("artist")
            .paginate(page, itemsPerPage)
            .then(async (albums) => {
                // Extraer total de publicaciones 
                const total = await album.countDocuments().exec();

                // Comprobar que existan publicaciones
                if (total == 0 || !albums) {
                    return res.status(403).send({
                        status: "Error",
                        message: "No existen artistas"
                    })
                }
                return res.status(200).send({
                    status: "Succes", 
                    totalAlbum: total,
                    itemsPerPage:itemsPerPage,
                    page:page,
                    totalPaginas: Math.ceil(total/itemsPerPage),
                    albums: albums
                })
            })
    } catch (error) {
        return res.status(403).send({
            status: "Error",
            message: "No existen albums",
            error:error
        })
    }
}

const update = (req,res)=> {
// Recoger id album
const id = req.params.id;

// Recoger info del album a actualizar
let data = req.body;
    // Buscar y actualizar
    album.findByIdAndUpdate({_id:id}, data, {new:true}).then((albumUpdated)=>{
        // Devolver respuesta
        return res.status(200).send({
            status:"success",
            album:albumUpdated,
        })
    }).catch((error)=>{
        return res.status(401).json({status:"error",message:"Error al actualizar album",error})
    })

}

const remove = async(req,res)=>{
    // Sacar id del album de la url
    const id = req.params.id;
    
    // Hacer consulta para buscar y eliminar
    try {
        const albumRemoved = await album.findByIdAndDelete(id);
        const songRemoved = await song.find().deleteMany({album:id});

        
        if(albumRemoved===null){
            return res.status(403).send({
                status:"Error",
                message:"Error al borrar album",
                error:"No se encontro el album"
            })
        }
        // Devolver resultado
        return res.status(200).send({
            status:"Success",
            message:"Album borrado",
            albumRemoved,
            // songRemoved
        })
    } catch (error) {
        console.log(error)
        return res.status(403).send({
            status:"Error",
            message:"Error al borrar album",
            error:error
        })
    }
    
}

const upload = (req,res)=>{

    // Configuracion de subida (multer)

    // Recoger id
    let id = req.params.id
    // Recoger el fichero de imagen y comprobar que existe
    if(!req.file){
        return res.status(404).send({
            status:"Error",
            message:"Error en el archivo"
        })
    }
    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const ext = imageSplit[1];

    // Comprobar extension 
    if(ext!="png" && ext!="jpg" && ext!="jpeg" && ext!="gif"){
        
        // Si no es correcto, borrar archivo
        const filePath=req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        // Devolver respuesta de error
        return res.status(404).send({
            status:"Error",
            message:"Extension del archivo invalida"
        })
    }
    // console.log(req.user)
    // Si es correcto, guardar imagen en bd
    album.findByIdAndUpdate({_id:id},{image: req.file.filename},{new:true})
    .then((albumU)=>{
        // Devolver respuesta
        return res.status(200).send({
            status:"Success",
            album: albumU,
            file:req.file,
    })
    }).catch((error)=>{
         // Devolver respuesta de error
         return res.status(404).send({
            status:"Error",
            message:"error en la consulta",
            error:error
        })
    })

}

const image = (req,res) =>{
    // sacar parametro url
    const file = req.params.file;

    // montar el path real de la imagen
    const filePath = "./uploads/albums/"+file;
    console.log(file)
    console.log(filePath)
    // Comprobar existencia del archivo
    fs.stat(filePath,(error,existe)=>{
        if(error || !existe) {
            return res.status(404).send({
                status:"Error", 
                message:"No existe el fichero",
                error
            });
        }
        // Devolver un file
    return res.sendFile(path.resolve(filePath));
    });

}


// exportar acciones
module.exports = {
    prueba,save,one,list,update,remove,image,upload
}