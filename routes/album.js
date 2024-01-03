// Importar dependencias
const express = require("express");

// Cargar router
const router = express.Router();

const check = require("../middlewares/auth");

// Importar controlador
const albumController = require("../controllers/album");

// Configuracion de subida
const multer = require("multer");

const storage = multer.diskStorage({destination:(req,res,cb) =>{
    cb(null, "./uploads/albums/")


},filename:(req,file,cb)=>{
    cb(null,"album-"+Date.now()+"-"+file.originalname);
}});

const uploads = multer({storage});

// Definir rutas
router.get("/prueba",albumController.prueba);
router.post("/save",check.auth,albumController.save);
router.get("/one/:id",check.auth,albumController.one);
router.get("/list/:id/:page?",check.auth,albumController.list);
router.put("/update/:id",check.auth,albumController.update);
router.delete("/remove/:id",check.auth,albumController.remove);
router.post("/upload/:id",[check.auth, uploads.single("file0")],albumController.upload);
router.get("/image/:file",albumController.image);

// Exportar rutas
module.exports = router;