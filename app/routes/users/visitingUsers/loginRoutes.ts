//MIDDLEWARE Y LIBRERÍAS EXTERNAS
import express, { json, NextFunction, Request, Response } from "express"
import cookieParser from "cookie-parser"
//MANEJO DE TOKENS JWT
import jsw from "jsonwebtoken";
//IMPORTACIONES Y TIPOS
import { VisitingUserType, ClientVisitingUserType } from "../../../types/typeUser"

import { loadEnvironmentVars, environmentVars, isDev } from "../../../config/config"





//* CARGA LAS VARIABLES DE ENTORNO DESDE EL ARCHIVO `.ENV`
loadEnvironmentVars()
const { SECRET_VALID_USER } = environmentVars()

const { Router } = express
const loginRoutes = Router()


//* MIDDLEWARE PARA PARSEAR JSON Y DATOS DE FORMULARIOS
loginRoutes.use(json())
loginRoutes.use(express.urlencoded({ extended: true }))

//* MIDDLEWARE QUE PERMITE LEER COOKIES FIRMADAS DESDE EL CLIENTE
loginRoutes.use(cookieParser(SECRET_VALID_USER))

//* EXTENSIÓN DE LA INTERFAZ REQUEST PARA INCLUIR LA PROPIEDAD `USERVISITING`
declare global {
    namespace Express {
        interface Request {
            userVisiting?: ClientVisitingUserType | VisitingUserType;
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



//? RUTA DE PRUEBA PROTEGIDA CON VERIFICACIÓN DE TOKEN
// Middleware que verifica la validez del token
// Si es válido, agrega el usuario al request
const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.signedCookies?.acces_token_VisitingUser;
    if (!token) {
        res.status(401).json({ error: 'token no encontrado: usuario invalido' });
        return;
    }
    try {
        const userPayload = jsw.verify(token, SECRET_VALID_USER as string);
        req.userVisiting = userPayload as ClientVisitingUserType | VisitingUserType;
        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
        return;
    }
};


//? RUTA PROTEGIDA DE ACCESO RESTRINGIDO
// Ruta protegida GET /protegido
// Solo accesible si el token es válido
loginRoutes.get("/protegido", verifyToken, (_, res) => {
    res.status(200).json({
        ok: true,
        message: "Acceso permitido"
    });
});


//? CIERRE DE SESIÓN - LOGOUT
// Ruta POST /logout
// Elimina la cookie del token para cerrar la sesión
loginRoutes.post("/logout", (_, res) => {
    res.clearCookie("acces_token_VisitingUser", COOKIES_LOG_OPTIONS)
    res.json({ message: "Sesión cerrada, token eliminado correctamente" });
})



export default loginRoutes