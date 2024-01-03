// Importaciones
const song = require("../models/song");
const fs = require("fs");
const path = require("path");
const mongoosePaginate = require("mongoose-pagination");

// Accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        status: "Success",
        message: "MEnsaje enviado desde: controllers/song.js"
    })
}

const save = (req, res) => {
    // Recoger datos del body
    const params = req.body;
    // Si no llega dar respuesta negativa
    // if (!params.title || !params.artist || !params.year) { return res.status(401).send({ status: "Error", message: "Error en los parámetros enviados" }) }
    // Crear y rellenar el objeto del modelo
    let newsong = new song(params);
    // newArtist.user = req.user.id;
    // Guardar objeto en BD
    newsong.save().then((songStored) => {
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            songStored
        })
    }).catch((error) => {
        // Devolver respuesta de error en la consulta
        return res.status(403).send({
            status: "Error",
            message: "Error al guardar la cancion",
            error: error
        })
    })
}
const one = (req, res) => {
    // Sacar id de publicacion de la url
    const songId = req.params.id;

    song.findById(songId)
        .populate({
            path: "album",
            // select:"title year -_id",
            populate: {
                path: "artist",
                model: "Artist",
                // select:"name -_id"
            }
        })
        .then((song) => {
            return res.status(200).send({
                status: "Success",
                song: song
            })
        }).catch((error) => {
            return res.status(403).send({
                status: "Error",
                message: "No existe la cancion",
                error: error
            })
        })

}
const list = (req, res) => {
    // Sacar el id de album
    let albumId = req.params.id

    // Comprobar que exista el artista
    if (!albumId) {
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
        song.find({ album: albumId }).select("-_id")
            .populate({
                path: "album",
                // select:"title year -_id",
                populate: {
                    path: "artist",
                    model: "Artist",
                    // select:"name -_id"
                }
            }).sort("track")
            // .paginate(page, itemsPerPage)
            .then(async (songs) => {
                // Extraer total de publicaciones 
                const total = await song.countDocuments().exec();

                // Comprobar que existan publicaciones
                if (total == 0 || !songs) {
                    return res.status(403).send({
                        status: "Error",
                        message: "No existen canciones"
                    })
                }
                return res.status(200).send({
                    status: "Succes",
                    // totalsong: total,
                    // itemsPerPage:itemsPerPage,
                    // page:page,
                    // totalPaginas: Math.ceil(total/itemsPerPage),
                    songs: songs
                })
            })
    } catch (error) {
        return res.status(403).send({
            status: "Error",
            message: "No existen songs",
            error: error
        })
    }
}

const update = (req, res) => {
    // Recoger id song
    const id = req.params.id;

    // Recoger info de la cancion a actualizar
    let data = req.body;

    // Buscar y actualizar
    song.findByIdAndUpdate({ _id: id }, data, { new: true }).then((songUpdated) => {
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            song: songUpdated,
        })
    }).catch((error) => {
        return res.status(401).json({ status: "error", message: "Error al actualizar la cancion", error })
    })

}

const remove = async (req, res) => {
    // Sacar id del song de la url
    const id = req.params.id;

    // Hacer consulta para buscar y eliminar
    try {
        const songRemoved = await song.findByIdAndDelete(id);
        if (songRemoved === null) {
            return res.status(403).send({
                status: "Error",
                message: "Error al borrar la cancion",
                error: "No se encontro la cancion"
            })
        }
        // Devolver resultado
        return res.status(200).send({
            status: "Success",
            message: "Cancion Borrada",
            songRemoved
        })
    } catch (error) {
        console.log(error)
        return res.status(403).send({
            status: "Error",
            message: "Error al borrar la cancion",
            error: error
        })
    }

}

const upload = (req, res) => {

    // Configuracion de subida (multer)

    // Recoger id
    let id = req.params.id
    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "Error",
            message: "Error en el archivo"
        })
    }
    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const ext = imageSplit[1];

    // Comprobar extension 
    if (ext != "mp3" && ext != "ogg") {

        // Si no es correcto, borrar archivo
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        // Devolver respuesta de error
        return res.status(404).send({
            status: "Error",
            message: "Extension del archivo invalida"
        })
    }
    // console.log(req.user)
    // Si es correcto, guardar imagen en bd
    song.findByIdAndUpdate({ _id: id }, { file: req.file.filename }, { new: true })
        .then((songU) => {
            // Devolver respuesta
            return res.status(200).send({
                status: "Success",
                song: songU,
                file: req.file,
            })
        }).catch((error) => {
            // Devolver respuesta de error
            return res.status(404).send({
                status: "Error",
                message: "error en la consulta",
                error: error
            })
        })

}

const audio = (req, res) => {
    // sacar parametro url
    const file = req.params.file;

    // montar el path real de la imagen
    const filePath = "./uploads/songs/" + file;
    console.log(file)
    console.log(filePath)
    // Comprobar existencia del archivo
    fs.stat(filePath, (error, existe) => {
        if (error || !existe) {
            return res.status(404).send({
                status: "Error",
                message: "No existe el fichero",
                error
            });
        }
        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    });

}


// exportar acciones
module.exports = {
    prueba, save, one, list, update, remove, audio, upload
}