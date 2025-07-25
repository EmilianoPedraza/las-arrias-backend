import User from "../controllers/user/user";
import { loadEnvironmentVars } from "../config/config";
import { Router, urlencoded, json } from "express";
import { UserError } from "../controllers/user/errors/userError";


loadEnvironmentVars();


const userChecks = Router()

userChecks.use(json())
userChecks.use(urlencoded({ extended: true }));

/**
 * Permite validar si el nombre de usuario ya existe en la base de datos.
 */
userChecks.post('/checkUserName', async (req, res) => {
    try {
        if (req.body.nombreUsuario) {
            User.validarNombreUsuario(req.body.nombreUsuario)
            const user = await User.buscarPorProps('nombreUsuario', req.body.nombreUsuario)
            if (user) {//si el nombre de usuario no existe entonces retorna true
                res.status(200).json({ ok: true })
                return
            }
            res.status(401).json({ ok: false })//caso contrario false
            return
        }
    } catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        //en caso de que no sea ningún error de clase extendida
        res.status(500).send({ error: "InternalError", message: "Ocurrio un error en la base de datos" })
    }
})


export default userChecks