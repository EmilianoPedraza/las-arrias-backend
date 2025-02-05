import express, { json } from "express"
//Tipos de errores
import { UserError } from "../../controllers/user/errors/userError"
//controladores
import localUser from "../../controllers/user/localUser/localUser"

const { Router } = express
const localUserRoute = Router()


localUserRoute.use(json())
localUserRoute.use(express.urlencoded({ extended: true }))

//?PARA CREACIÓN DE USUARIOS
localUserRoute.post('/register', async (req, res) => {
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

//?PARA VALIDAR INGRESO DE USUARIOS
localUserRoute.get('/login', async (req, res) => {
    try {
        const { nombreUsuario, password } = req.body
        const user = await localUser.loginLocalUser(nombreUsuario, password)
        res.status(200).json(user)
    } catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        res.status(500).send({ error: "InternalError", message: "Ocurrio un error en la base de datos" })
    }

})
localUserRoute.get("/prueba", (_, res) => {
    res.status(200).json({ ok: true })
})
export default localUserRoute  