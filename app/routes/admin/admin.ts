import { Router, json, urlencoded, Request, Response, NextFunction } from "express"
//clase y tipo admin
import { UserAdmin, AdminUser } from "../../daos/user/admin/adminUser"
//errores UserError
import { UserError } from "../../daos/user/errors/userError"
//para poder usar variables de entorno
import { loadEnvironmentVars, environmentVars } from "../../config/config";
//libreria ppara cookies
import cookieParser from "cookie-parser";
//configuracion de cookies
import COOKIES_LOG_OPTIONS from "../login/configCookies/configCookies"
//funcion para crear token
import { createToken } from "../login/functions/functions";







//variables de entorno
loadEnvironmentVars()
const { SECRET_LOG_ADMIN_USER } = environmentVars()

// Extiende la interfaz Request para incluir userAdminClient
declare module 'express-serve-static-core' {
    interface Request {
        userAdminClient?: {
            nombre: string;
            apellido: string;
            dni: number;
        };
    }
}

const adminUserRoute = Router()


adminUserRoute.use(json())
adminUserRoute.use(urlencoded({ extended: true }))
adminUserRoute.use(cookieParser(SECRET_LOG_ADMIN_USER))

adminUserRoute.post('/register', async (req, res) => {
    try {
        const admin = req.body
        await UserAdmin.createAdmin(admin)
        res.status(200).json({ ok: true })
    }
    catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        res.status(500).json({ error: "InternalError", message: "Ocurrió un error inesperado" });
    }

})





//? VALIDACIÓN DE INGRESO DE USUARIOS
/**
 * Middleware para validar las credenciales del usuario.
 * Si son válidas, agrega el usuario al request y continúa.
 */
const validarCredenciales = async (req: Request, res: Response, next: NextFunction) => {
    const admin = req.body
    try {
        const admingLog = await UserAdmin.loginUserAdmin(admin as unknown as AdminUser)

        req.userAdminClient = admingLog
        next()
    }
    catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        res.status(500).json({ error: "InternalError", message: "Ocurrió un error inesperado" });
    }
}




//RUTA
adminUserRoute.post('/login', validarCredenciales, async (req, res) => {
    try {
        const admin = req.userAdminClient as AdminUser
        if (admin) {
            const { _id, __t, nombre, apellido } = admin
            const token = createToken({ _id, __t }, SECRET_LOG_ADMIN_USER as string)
            res
                .status(200)
                .cookie(`access_token_admin_general`, token, { ...COOKIES_LOG_OPTIONS, maxAge: 60 * 60 * 1000 /* 1 hora*/ })
                .json({ nombre, apellido })
        }

    } catch (error) {
        res.status(401).json({ ok: false, error })
    }
})


export default adminUserRoute