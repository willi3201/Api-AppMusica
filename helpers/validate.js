const validator = require("validator");

const validate = (params) => {

    let name = !validator.isEmpty(params.name) && validator.isLength(params.name, { min: 3, max: undefined }) && validator.isAlpha(params.name, "es-ES");
    let nick = !validator.isEmpty(params.nick) && validator.isLength(params.nick, { min: 2, max: 60 });
    let email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
    let password = true;
    if(params.password){
        password = !validator.isEmpty(params.password) && validator.isLength(params.password, { min: 3, max: 25 });
    }
    
    if(params.surname){
        console.log(params.surname)
        let surname = !validator.isEmpty(params.surname) && validator.isLength(params.surname, { min: 3, max: undefined }) && validator.isAlpha(params.surname, "es-ES");
        if(!surname){ throw new Error("No se ha superado la validacion")}
    }
    if (!name || !nick || !email || !password) {
        console.log({
            name: name, nick: nick, email: email, password: password
        })
        throw new Error("No se ha superado la validación");
    } else {
        console.log("Validación superada")
    }
}

module.exports = validate