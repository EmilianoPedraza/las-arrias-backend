import { json, Router, urlencoded, Request, Response, NextFunction } from "express"
import cookieParser from "cookie-parser"
import { loadEnvironmentVars, environmentVars, isDev } from "../config/config";
import jsw from "jsonwebtoken"
import User from "../controllers/user/user";

import { UserError } from "../controllers/user/errors/userError";

import { UserType } from "../types/typeUser"


loadEnvironmentVars()
const { SECRET_VALID_USER } = environmentVars()

const loginUsersRoute = Router()

//* MIDDLEWARE PARA PARSEAR JSON Y DATOS DE FORMULARIOS
loginUsersRoute.use(json())
loginUsersRoute.use(urlencoded({ extended: true }))
//* MIDDLEWARE QUE PERMITE LEER COOKIES FIRMADAS DESDE EL CLIENTE
loginUsersRoute.use(cookieParser(SECRET_VALID_USER))

//* CONFIGURACIÓN DE COOKIES PARA AUTENTICACIÓN
const COOKIES_LOG_OPTIONS = {
    httpOnly: true, // La cookie solo es accesible desde el servidor
    secure: !isDev, // Solo se transmite por HTTPS en producción
    sameSite: isDev ? "lax" as "lax" : "strict" as "strict", // Controla el envío de cookies entre sitios
    signed: true  // Firma la cookie para detectar manipulaciones
};

declare global {
    namespace Express {
        interface Request {
            userReqClient?: UserType
            // userResClient?: UserType
        }
    }
}



//* CREACIÓN DE TOKEN JWT
/**
 * Genera un token JWT válido por 1 hora
 * @param user - Usuario autenticado
 * @returns Token firmado como string
 */
const createToken = (userr: /*UserType*/ { _id: string, __t: string }): string => {

    const token = jsw.sign(userr, SECRET_VALID_USER as string, { expiresIn: '1h' })
    return token
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
        req.userReqClient = user;
        next();
    } catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        res.status(500).json({ error: "InternalError", message: "Ocurrió un error inesperado" });
    }
};


const response = (user: UserType) => {
    const responseBasic = {
        nombre: user.nombre,
        apellido: user.apellido,
        nombreUsuario: user.nombreUsuario,
        email: user.email

    }
    if (user.__t == "LocalUser") {
        return { telefono: user.telefono, ...responseBasic }
    }
    return responseBasic
}

// //? LOGIN DE USUARIOS
loginUsersRoute.post("/login", validarCredenciales, async (req, res) => {
    try {
        const { userReqClient } = req
        if (userReqClient) {
            const { _id, __t } = userReqClient
            if (__t) {
                const token = createToken({ _id, __t })

                res
                    .status(200)
                    .cookie(`acces_token`, token, { ...COOKIES_LOG_OPTIONS, maxAge: 60 * 60 * 1000 /* 1 hora*/ })
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




export default loginUsersRoute