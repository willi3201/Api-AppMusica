// Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave secreta
const {secret} = require("../helpers/jwt");

// Crear middleware (metodo o funcion)
exports.auth = (req,res,next) =>{

    // Comprobar cabecera de auth
    if(!req.headers.authorization){
        return res.status(403).send({
            status:"Error",
            message:"No existe la cabecera"
        })
    }
    // Limpiar token
    let token = req.headers.authorization.replace(/['"]+/g,"");

    try {
        // Decodificar el token
        let payload = jwt.decode(token,secret);
    
        // Comprobar la expiracion del token
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                status:"Error",
                message:"Token expirado"
            })
        }

        // Agregar datos del usuario
        req.user = payload;
    } catch (error) {
        return res.status(403).send({
            status:"Error",
            message:"Token invalido",
            error
        })
    }
    // Pasar a la ejecucion 
    next();
}