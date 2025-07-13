import { json, Router, urlencoded } from "express";

//MIDDLEWARE Y LIBRERÍAS EXTERNAS
import cookieParser from 'cookie-parser';



//IMPORTACIONES, TIPOS, PROCEESOS Y VARIABLES
import { loadEnvironmentVars, environmentVars, isDev } from "../config/config"



//* CARGA LAS VARIABLES DE ENTORNO DESDE EL ARCHIVO `.ENV`
loadEnvironmentVars()
const { SECRET_VALID_USER } = environmentVars()

const logoutUserRoute = Router()

//* MIDDLEWARE PARA PARSEAR JSON Y DATOS DE FORMULARIOS
logoutUserRoute.use(json())
logoutUserRoute.use(urlencoded({ extended: true }))

//* MIDDLEWARE QUE PERMITE LEER COOKIES FIRMADAS DESDE EL CLIENTE
logoutUserRoute.use(cookieParser(SECRET_VALID_USER))


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
logoutUserRoute.post("/logout", (_, res) => {
    res.clearCookie("access_token", COOKIES_LOG_OPTIONS)
    res.clearCookie("access_successful", COOKIES_LOG_OPTIONS)
    res.json({ message: "Sesión cerrada, token eliminado correctamente" });
})


export default logoutUserRoute













