import express, { json } from "express"
import { ErrorTypes } from "../../types/typesError"

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
        console.log('Se guardo el usuario')
        res.status(200).json({ ok: true, user: newUser })
    } catch (err) {
        console.log('No se guardo el usuario')
        res.status(400).json({ ok: false, error: { type: ErrorTypes.Unauthorized, message: err.message } })
    }
})
localUserRoute.get("/prueba", (_, res) => {
    res.status(200).json({ ok: true })
})
export default localUserRoute  