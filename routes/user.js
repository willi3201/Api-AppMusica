// Importar dependencias
const express = require("express");
const check = require("../middlewares/auth")

// Cargar router
const router = express.Router();

// Importar controlador
const userController = require("../controllers/user");

// Configuracion de subida
const multer = require("multer");

const storage = multer.diskStorage({destination:(req,res,cb) =>{
    cb(null, "./uploads/avatars/")


},filename:(req,file,cb)=>{
    cb(null,"avatar-"+Date.now()+"-"+file.originalname);
}});

const uploads = multer({storage});

// Definir rutas
router.get("/prueba",userController.prueba);
router.post("/register",userController.register);
router.post("/login", userController.login);
router.get("/profile/:id",check.auth,userController.profile);
router.put("/update",check.auth,userController.update);
router.post("/upload",[check.auth, uploads.single("file0")],userController.upload);
router.get("/avatar/:file",userController.avatar)

// Exportar rutas
module.exports = router;