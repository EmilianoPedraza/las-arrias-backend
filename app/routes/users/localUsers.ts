import express, { json } from "express"
import { ErrorTypes } from "../../types/typesError"

import localUser from "../../controllers/user/localUser"

const { Router } = express
const localUserRoute = Router()



localUserRoute.use(json())
localUserRoute.use(express.urlencoded({ extended: true }))

//Para creacion de usuarios
localUserRoute.post('/createUser', (req, res) => {
    try {
        const { nombre, apellido, nombreUsuario, email, password, dni, telefono } = req.body
        const newUser = new localUser(dni, telefono, nombre, apellido, nombreUsuario, email, password).createLocalUser()
        res.status(200).json({ ok: true, user: newUser })
    } catch (err) {
        res.status(400).json({ ok: false, error: { type: ErrorTypes.Unauthorized, message: 'err.message' } })
    }

})
localUserRoute.get("/prueba", (_, res) => {
    res.status(200).json({ ok: true })
})
export default localUserRoute