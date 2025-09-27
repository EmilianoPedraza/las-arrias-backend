import express, { json } from "express"

import { UserError } from "../../../daos/user/errors/userError"

import visitingUser from "../../../daos/user/visitingUser/visitingUser"

const { Router } = express
const registerRoutes = Router()


registerRoutes.use(json())
registerRoutes.use(express.urlencoded({ extended: true }))



registerRoutes.post("/register", async (req, res) => {
    try {
        const { nombre, apellido, nombreUsuario, email, password } = req.body
        await new visitingUser(nombre, apellido, nombreUsuario, email, password)
            .registerVisitingUser()
        res.status(200).json({ ok: true })
    }
    catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        //en caso de que no sea ningún error de clase extendida
        res.status(500).send({ error: "InternalError", message: "Ocurrio un error en la base de datos" })
    }
})


export default registerRoutes