import express, { json } from "express"
//Tipos de errores
import { UserError } from "../../types/errors/userError"
//controladores
import localUser from "../../controllers/user/localUser"

const { Router } = express
const localUserRoute = Router()


localUserRoute.use(json())
localUserRoute.use(express.urlencoded({ extended: true }))

//?PARA CREACIÓN DE USUARIOS
localUserRoute.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, nombreUsuario, email, password, dni, telefono } = req.body
        const newUser = new localUser(dni, telefono, nombre, apellido, nombreUsuario, email, password)
        await newUser.createLocalUser()
        res.status(200).json({ ok: true })
    } catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ ok: false, error: true, type: err.type, message: err.message })
        }
    }
})
localUserRoute.get("/prueba", (_, res) => {
    res.status(200).json({ ok: true })
})
export default localUserRoute  