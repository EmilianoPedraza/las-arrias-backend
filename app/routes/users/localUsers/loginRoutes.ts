//IMPORTACIONES Y TIPOS
import { ClientLocalUserType, LocalUserType } from "../../../types/typeUser";
import { loadEnvironmentVars, environmentVars, isDev } from "../../../config/config";
import express, { json, Request, Response, NextFunction } from "express";

//MIDDLEWARE Y LIBRERÍAS EXTERNAS
import cookieParser from 'cookie-parser';



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


//* EXTENSIÓN DE LA INTERFAZ REQUEST PARA INCLUIR LA PROPIEDAD `USER`
declare global {
    namespace Express {
        interface Request {
            userLocal?: ClientLocalUserType | LocalUserType;
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


//? CIERRE DE SESIÓN - LOGOUT
// Ruta POST /logout
// Elimina la cookie del token para cerrar la sesión
loginUser.post("/logout", (_, res) => {
    res.clearCookie("acces_token_LocalUser", COOKIES_LOG_OPTIONS)
    res.json({ message: "Sesión cerrada, token eliminado correctamente" });
})





//? RUTA DE PRUEBA PROTEGIDA CON VERIFICACIÓN DE TOKEN
// Middleware que verifica la validez del token
// Si es válido, agrega el usuario al request
const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.signedCookies?.acces_token_LocalUser;
    if (!token) {
        res.status(401).json({ error: 'token no encontrado: usuario invalido' });
        return;
    }
    try {
        const userPayload = jsw.verify(token, SECRET_VALID_USER as string);
        req.userLocal = userPayload as ClientLocalUserType;
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
