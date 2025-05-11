//IMPORTACIONES Y TIPOS
import { ClientLocalUserType } from "../../../types/typesLocalUser";
import { loadEnvironmentVars, environmentVars, isDev } from "../../../config/config";
import express, { json, Request, Response, NextFunction } from "express";

//MIDDLEWARE Y LIBRERÍAS EXTERNAS
import cookieParser from 'cookie-parser';

//TIPOS DE ERRORES PERSONALIZADOS
import { UserError } from "../../../controllers/user/errors/userError";

//CONTROLADOR DE USUARIOS LOCALES
import localUser from "../../../controllers/user/localUser/localUser";

//MANEJO DE TOKENS JWT
import jsw from "jsonwebtoken";















//* CARGA LAS VARIABLES DE ENTORNO DESDE EL ARCHIVO `.ENV`
loadEnvironmentVars()
const { SECRET_VALID_USER } = environmentVars()

const { Router } = express
const loginUser = Router()

//* MIDDLEWARE PARA PARSEAR JSON Y DATOS DE FORMULARIOS
loginUser.use(json())
loginUser.use(express.urlencoded({ extended: true }))



//* MIDDLEWARE QUE PERMITE LEER COOKIES FIRMADAS DESDE EL CLIENTE
loginUser.use(cookieParser(SECRET_VALID_USER as string));







//* CREACIÓN DE TOKEN JWT
/**
 * Genera un token JWT válido por 1 hora
 * @param user - Usuario autenticado
 * @returns Token firmado como string
 */
const createToken = (user: ClientLocalUserType): string => {
    const token = jsw.sign({ user }, SECRET_VALID_USER as string, { expiresIn: '1h' })
    return token
}





//* EXTENSIÓN DE LA INTERFAZ REQUEST PARA INCLUIR LA PROPIEDAD `USER`
declare global {
    namespace Express {
        interface Request {
            user?: ClientLocalUserType;
        }
    }
}




//* CONFIGURACIÓN DE COOKIES PARA AUTENTICACIÓN
const COOKIES_LOG_OPTIONS = {
    httpOnly: !isDev, // La cookie solo es accesible desde el servidor
    secure: !isDev, // Solo se transmite por HTTPS en producción
    sameSite: isDev ? "lax" as "lax" : "strict" as "strict", // Controla el envío de cookies entre sitios
    signed: true  // Firma la cookie para detectar manipulaciones
};





//? VALIDACIÓN DE INGRESO DE USUARIOS
/**
 * Middleware para validar las credenciales del usuario.
 * Si son válidas, agrega el usuario al request y continúa.
 */
const validarCredenciales = async (req: Request, res: Response, next: NextFunction) => {
    const { nombreUsuario, password } = req.body;
    try {
        const user = await localUser.loginLocalUser(nombreUsuario, password);
        req.user = user;
        next();
    } catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        res.status(500).json({ error: "InternalError", message: "Ocurrió un error inesperado" });
    }
};





//? LOGIN DE USUARIOS
// Ruta POST /login
// Autentica al usuario y guarda el token en una cookie segura
loginUser.post('/login', validarCredenciales, async (req, res) => {
    try {
        const user = req.user
        const token = createToken(user as ClientLocalUserType)
        res
            .status(200)
            .cookie("acces_token", token, { ...COOKIES_LOG_OPTIONS, maxAge: 60 * 60 * 1000 /* 1 hora*/ })
            .json({ ok: true })
    } catch (err) {
        res.status(500).send({ error: "InternalError", message: "Ocurrio un error en la base de datos" })
    }
})







//? CIERRE DE SESIÓN - LOGOUT
// Ruta POST /logout
// Elimina la cookie del token para cerrar la sesión
loginUser.post("/logout", (_, res) => {
    res.clearCookie("acces_token", COOKIES_LOG_OPTIONS)
    res.json({ message: "Sesión cerrada, token eliminado correctamente" });
})





//? RUTA DE PRUEBA PROTEGIDA CON VERIFICACIÓN DE TOKEN
// Middleware que verifica la validez del token
// Si es válido, agrega el usuario al request
const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.signedCookies?.acces_token;
    if (!token) {
        res.status(401).json({ error: 'token no encontrado: usuario invalido' });
        return;
    }
    try {
        const userPayload = jsw.verify(token, SECRET_VALID_USER as string);
        req.user = userPayload as ClientLocalUserType;
        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
        return;
    }
};






//? RUTA PROTEGIDA DE ACCESO RESTRINGIDO
// Ruta protegida GET /protegido
// Solo accesible si el token es válido
loginUser.get("/protegido", verifyToken, (_, res) => {
    res.status(200).json({
        ok: true,
        message: "Acceso permitido"
    });
});

export default loginUser
