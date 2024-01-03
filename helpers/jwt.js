// Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");


// Clave secreta
const secret = "Clave_secreta_3201";

// Crear funcion para generar tokens
const createToken = (user) => {

    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30,"days").unix()
    }
    return jwt.encode(payload,secret);
}
// Exportar modulo
module.exports = { 
    secret,createToken
}