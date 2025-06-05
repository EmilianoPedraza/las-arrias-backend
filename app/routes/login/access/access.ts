import { json, Router, urlencoded, Request, Response, NextFunction } from "express"
import cookieParser from "cookie-parser"

//variables de entorno
import { loadEnvironmentVars, environmentVars } from "../../../config/config";
//clase user
import User from "../../../controllers/user/user";
//Types 
import { UserError } from "../../../controllers/user/errors/userError";
import { UserType } from "../../../types/typeUser"
//configuracion de cookies
import COOKIES_LOG_OPTIONS from "../configCookies/configCookies";

//funciones
import { createToken, response } from "../functions/functions";

loadEnvironmentVars()
const { SECRET_LOG_ACCES_TOKEN } = environmentVars()


const loginAcces = Router()





//* MIDDLEWARE PARA PARSEAR JSON Y DATOS DE FORMULARIOS
loginAcces.use(json())
loginAcces.use(urlencoded({ extended: true }))
loginAcces.use(cookieParser(SECRET_LOG_ACCES_TOKEN))



interface RequestUserType {
    userReqClient?: UserType
}


//? VALIDACIÓN DE INGRESO DE USUARIOS
/**
 * Middleware para validar las credenciales del usuario.
 * Si son válidas, agrega el usuario al request y continúa.
 */
const validarCredenciales = async (req: Request, res: Response, next: NextFunction) => {
    const { nombreUsuario, password } = req.body;
    try {
        const user = await User.loginVisitinUser(nombreUsuario, password);
        (req as RequestUserType).userReqClient = user;
        next();
    } catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        res.status(500).json({ error: "InternalError", message: "Ocurrió un error inesperado" });
    }
};




// //? LOGIN DE USUARIOS
loginAcces.post("/access", validarCredenciales, async (req, res) => {
    try {
        const { userReqClient } = req as RequestUserType
        if (userReqClient) {
            const { _id, __t } = userReqClient
            if (__t) {
                const token = createToken({ _id, __t }, SECRET_LOG_ACCES_TOKEN as string)

                res
                    .status(200)
                    .cookie(`access_token`, token, { ...COOKIES_LOG_OPTIONS, maxAge: 60 * 60 * 1000 /* 1 hora*/ })
                    .json(
                        response(userReqClient)
                    )
            }
        }
        else {
            throw new Error()
        }
    } catch (error) {
        res.status(500).send({ error: "InternalError", message: "Ocurrio un error en la base de datos" })
    }
})



export default loginAcces