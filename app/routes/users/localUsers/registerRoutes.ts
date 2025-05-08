

import { SECRET_VALID_USER } from "../../../enums/expresions"
import cookieParser from 'cookie-parser';

import express, { json } from "express"
//Tipos de errores
import { UserError } from "../../../controllers/user/errors/userError"
//controladores
import localUser from "../../../controllers/user/localUser/localUser"



const { Router } = express
const registerRoutes = Router()


registerRoutes.use(json())
registerRoutes.use(express.urlencoded({ extended: true }))


// ✅ Se agrega cookie-parser como middleware
registerRoutes.use(cookieParser(SECRET_VALID_USER.secret));


//?PARA CREACIÓN DE USUARIOS


registerRoutes.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, nombreUsuario, email, password, dni, telefono } = req.body
        await new localUser(dni, telefono, nombre, apellido, nombreUsuario, email, password)
            .registerLocalUser()
        res.status(200).json({ ok: true })
    } catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        //en caso de que no sea ningún error de clase extendida
        res.status(500).send({ error: "InternalError", message: "Ocurrio un error en la base de datos" })
    }
})


export default registerRoutes  