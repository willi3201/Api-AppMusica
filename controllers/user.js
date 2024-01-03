// Importaciones
const validate = require("../helpers/validate");
const User = require("../models/user");
const jwt = require("../helpers/jwt");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path")

// Accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        status: "Success",
        message: "MEnsaje enviado desde: controllers/user.js"
    })
}

// Registro
const register = (req, res) => {

    // Recoger datos de la peticion
    let params = req.body;
    console.log(params);

    // Comprobar que llegan bien
    if (!params.name || !params.nick || !params.email || !params.password) {
        return res.status(400).send({
            status: "Error",
            message: "Faltan datos por enviar"
        })
    }

    // Validar datos
    try {
        validate(params);
    } catch (error) {
        return res.status(401).send({
            status: "Error",
            message: "Datos invalidos"
        });
    }

    // Control usuarios duplicados
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }

        ]
    }).then(async (users) => {

        if (users && users.length >= 1) {

            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });

        }

        // cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10)
        params.password = pwd;

        // crear objeto del usuario
        let userToSave = new User(params);

        // Guardar usuario en la bd
        userToSave.save().then(userStored => {
            // Limpiar el objeto a devolver
            let userCreated = userStored.toObject();
            delete userCreated.password;
            delete userCreated.role;

            if (userStored) {
                // Devolver resultado
                return res.status(200).json({
                    status: "success",
                    message: "Usuario registrado correctamente",
                    user: userCreated
                });
            } else {
                return res.status(502).send({ status: "error", message: "Error al guardar usuario" });
            }
        }).catch(err => {
            return res.status(501).send({ status: "error", message: "Error al guardar usuario" });
        })
    }).catch((error) => {
        return res.status(500).json({ status: "error", message: "Error en la consulta de usuarios", error })
    })

}

const login = (req, res) => {

    // Recoger los parametros de la peticion
    let params = req.body;

    // Comprobar que me llegan
    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "Error",
            message: "Faltan datos por enviar"
        });
    }

    // Buscar en la bd si existe el email
    User.findOne({ email: params.email })
        .select("+password +role")
        .then((user) => {
            // Comprobar su contraseña
            const pwd = bcrypt.compareSync(params.password, user.password)
            let identityUser = user.toObject();
            delete identityUser.password;
            delete identityUser.role;

            if (!pwd) {
                return res.status(400).json({
                    status: "Error",
                    message: "Login incorrecto"
                });
            }
            // Conseguir token jwt (crear un servicio que nos permita crear el token)
            const token = jwt.createToken(user);
            // Devolver datos de usuario y token


            return res.status(200).json({
                status: "success",
                message: "Mensaje de login",
                identityUser,
                token
            });
        }).catch((error) => {
            return res.status(404).send({
                status: "Error",
                message: "No existe el usuario"
            });
        })


}
const profile = (req, res) => {
    // Recoger id de usuario
    const id = req.params.id;
    // Consulta para sacar datos del perfil 
    User.findById(id).then((user) => {
        if(!user){
            return res.status(404).send({
                status: "Error",
                message: "Error en la consulta"
            })
        }
        // Devolver resultado
        return res.status(200).send({
            status: "Success",
            message: "Metodo profile",
            user
        });
    }).catch((error) => {
        return res.status(404).send({
            status: "Error",
            message: "Error en la consulta",
            error:error
        })
    })

}

const update = (req,res)=>{
    // Recoger datos usuario identificado
    let userIdentity = req.user;

    // Recoger info del usuario a actualizar
    let userToUpdate = req.body;
    
    // Eliminar campos sobrantes
    // delete userToUpdate.iat;
    // delete userToUpdate.exp;
    // delete userToUpdate.role;
    // delete userToUpdate.image;

    
    // Validar datos
    try {
        validate(userToUpdate);
    } catch (error) {
        return res.status(401).send({
            status: "Error",
            message: "Datos invalidos"
        });
    }

    console.log(userIdentity)
    console.log(userToUpdate)
    // Comprobar si el usuario ya existe
    User.find({ 
        $or:[
        {email: userToUpdate.email.toLowerCase()},
        {nick: userToUpdate.nick.toLowerCase()}

    ]
    }).then(async (users)=>{

        // Comprobar si usuario existe y no soy yo el identificado
        let userIsset = false;
        users.forEach(user => {
            if(user && user._id != userIdentity.id){
                userIsset = true;
            }
        })
        
        // Si ya existe devuelvo una respuesta
        if(userIsset){

            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
            
        }
        
        // Cifrar la contraseña si me llegara
        if(userToUpdate.password){
            let pwd = await bcrypt.hash(userToUpdate.password,10)
            userToUpdate.password = pwd;
        }else{
            delete userToUpdate.password;
        }

        // Buscar y actualizar
        User.findByIdAndUpdate({_id:userIdentity.id}, userToUpdate, {new:true}).then((userUpdated)=>{
            // Devolver respuesta
            return res.status(200).send({
                status:"success",
                message: "Metodo de actualizar usuario",
                user:userUpdated,
            })
        }).catch((error)=>{
            return res.status(401).json({status:"error",message:"Error al actualizar usuarios",error})
        })

    }).catch((error)=>{
        return res.status(500).json({status:"error",message:"Error en la consulta de usuarios",error})
    })

    

}

const upload = (req,res)=>{

    // Configuracion de subida (multer)

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
    console.log(req.user)
    // Si es correcto, guardar imagen en bd
    User.findByIdAndUpdate(req.user.id,{image: req.file.filename},{new:true})
    .then((userU)=>{
        // Devolver respuesta
        return res.status(200).send({
            status:"Success",
            user: userU,
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

const avatar = (req,res) =>{
    // sacar parametro url
    const file = req.params.file;

    // montar el path real de la imagen
    const filePath = "./uploads/avatars/"+file;
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
    prueba, register, login, profile,update,upload,avatar
}