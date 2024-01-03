// Importaciones
const artist = require("../models/artist");
const album = require("../models/album");
const song = require("../models/song");
const fs = require("fs");
const path = require("path");
const mongoosePaginate = require("mongoose-pagination");

// Accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        status: "Success",
        message: "Mensaje enviado desde: controllers/artist.js"
    })
}

// accion guardar artista
const save = (req, res) => {
    // Recoger datos del body
    const params = req.body;
    // Si no llega dar respuesta negativa
    if (!params.name) { return res.status(401).send({ status: "Error", message: "Error en los parámetros enviados" }) }
    // Crear y rellenar el objeto del modelo
    let newArtist = new artist(params);
    // newArtist.user = req.user.id;
    // Guardar objeto en BD
    newArtist.save().then((artistStored) => {
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Se ha guardado el artista",
            artistStored
        })
    }).catch((error) => {
        // Devolver respuesta de error en la consulta
        return res.status(403).send({
            status: "Error",
            message: "Error al guardar al artista",
            error: error
        })
    })

}
const one = (req, res) => {
    // Sacar id de publicacion de la url
    const artistId = req.params.id;

    artist.findOne({ _id: artistId }).then((artist) => {
        return res.status(200).send({
            status: "Success",
            message: "Detalle Artista",
            artist: artist
        })
    }).catch((error) => {
        return res.status(403).send({
            status: "Error",
            message: "No existe el artista"
        })
    })

}
const list = (req, res) => {
    // Sacar la pagina actual
    let page = 1
    if (req.params.page) { page = req.params.page; }

    // Establecer numero de elementos por pagina
    const itemsPerPage = 5;

    try {
        artist.find()
            .sort("name")
            .paginate(page, itemsPerPage)
            .then(async (artistas) => {
                // Extraer total de publicaciones 
                const total = await artist.countDocuments().exec();

                // Comprobar que existan publicaciones
                if (total == 0 || !artist) {
                    return res.status(403).send({
                        status: "Error",
                        message: "No existen artistas"
                    })
                }
                return res.status(200).send({
                    status: "Succes",
                    totalArtistas: total,
                    itemsPerPage: itemsPerPage,
                    page: page,
                    totalPaginas: Math.ceil(total / itemsPerPage),
                    artistas: artistas
                })
            })
    } catch (error) {
        return res.status(403).send({
            status: "Error",
            message: "No existen artistas",
            error: error
        })
    }
}

const update = (req, res) => {
    // Recoger id artista
    const id = req.params.id;

    // Recoger info del usuario a actualizar
    let data = req.body;
    // Buscar y actualizar
    artist.findByIdAndUpdate({ _id: id }, data, { new: true }).then((artistUpdated) => {
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Metodo de actualizar artista",
            artist: artistUpdated,
        })
    }).catch((error) => {
        return res.status(401).json({ status: "error", message: "Error al actualizar artista", error })
    })

}

const remove = async (req, res) => {
    // Sacar id del artista de la url
    const id = req.params.id;

    // let songR;
    // Hacer consulta para buscar y eliminar
    try {
        const artistRemoved = await artist.findByIdAndDelete(id);

        if (artistRemoved === null) {
            return res.status(403).send({
                status: "Error",
                message: "Error al borrar artista",
                error: "No se encontro el artista"
            })
        }
        // Find de albums
        const albumRemoved = await album.find({ artist: id });
        albumRemoved.forEach(async (albumS) => {
            // Remove de songs
            const songRemoved = await song.find({ album: albumS._id }).deleteMany({ album: albumS._id });
            // console.log(albumS);
            // Remove de albums
            await album.deleteMany({ artist: id });
        });
        // Devolver resultado
        return res.status(200).send({
            status: "Success",
            message: "Artista borrado",
            artistRemoved
        })
    } catch (error) {
        console.log(error)
        return res.status(403).send({
            status: "Error",
            message: "Error al borrar artista",
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
    if (ext != "png" && ext != "jpg" && ext != "jpeg" && ext != "gif") {

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
    artist.findByIdAndUpdate({ _id: id }, { image: req.file.filename }, { new: true })
        .then((artistU) => {
            // Devolver respuesta
            return res.status(200).send({
                status: "Success",
                artist: artistU,
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

const image = (req, res) => {
    // sacar parametro url
    const file = req.params.file;

    // montar el path real de la imagen
    const filePath = "./uploads/artists/" + file;
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
    prueba, save, one, list, update, remove, image, upload
}