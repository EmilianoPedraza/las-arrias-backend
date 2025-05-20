import dotenv from "dotenv"

import minimist from "minimist";

export const isDev = minimist(process.argv.slice(2)).mode === "dev"

import path from "path";

const ruta = path.resolve(__filename, "../../../.env")

/**
 * Carga las variables de entorno desde un archivo .env utilizando dotenv,
 * y devuelve un objeto con las configuraciones necesarias para seguridad
 * y validaciones de usuario en la aplicación.
 */

export const loadEnvironmentVars = () => {
    dotenv.config({
        path: ruta
    })
}

/**
 *  * Variables de process.env:
 * - MONGO_CLOUSER_LA: Ruta de coneccion para clouser mongo atlas.
 * - SECRET_VALID_USER: Clave secreta para firmar tokens y cookies de sesión.
 * - FIRST_AND_LASTNAME: Expresión regular para validar nombres y apellidos.
 * - VALID_EMAIL: Expresión regular para validar correos electrónicos.
 * - VALID_USERNAME: Expresión regular para validar nombres de usuario.
 * - VALID_PASSWORD: Expresión regular para validar contraseñas seguras.
 * - MONGO_COMPAS_DB_LA: Ruta de coneccion para desarrollo con mongo copass.
 * - PORT: Puerto de la api.
 * - ORIGINS: Opcions para cors.
 * - METHODS: Opcion para cors.
 * - ALLOWEDHEADERS : Opcion para cors.
 * - CREDENTIALS: Opcion para cors.
 */
export const environmentVars = () => {
    const { MONGO_CLOUSER_LA, SECRET_VALID_USER, MONGO_COMPAS_DB_LA, PORT, ORIGINS_PROD } = process.env

    const ALLOWEDHEADERS = [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        "multipart/form-data"]
    const METHODS = ['GET', 'POST', 'PUT', 'DELETE']
    const ORIGINS = isDev ? "*" : ORIGINS_PROD
    const CREDENTIALS = !isDev


    const FIRST_AND_LASTNAME = "^(?!.*\\s{2})[A-Za-zÁáÉéÍíÓóÚúÜüÑñ]{3,}(?:\\s[A-Za-zÁáÉéÍíÓóÚúÜüÑñ]{3,}){0,2}$"
    const VALID_EMAIL = "^[a-zA-Z1-9]+(\\.[a-zA-Z1-9]+)*@[a-zA-Z]+\\.[a-zA-Z]+$"
    const VALID_USERNAME = "^(?!.*_\\.)[A-Za-zÁáÉéÍíÓóÚúÜüÑñ0-9](?:[A-Za-zÁáÉéÍíÓóÚúÜüÑñ0-9_.]*(?:\\.[A-Za-zÁáÉéÍíÓóÚúÜüÑñ0-9])?)*$"
    const VALID_PASSWORD = "^(?!.*\\.\\.)[A-Za-zÁÉÍÓÚáéíóúÑñ1-9_]+(?:\\.[A-Za-zÁÉÍÓÚáéíóúÑñ1-9_]+)*[^.]$"

    return { MONGO_CLOUSER_LA, SECRET_VALID_USER, FIRST_AND_LASTNAME, VALID_EMAIL, VALID_USERNAME, VALID_PASSWORD, MONGO_COMPAS_DB_LA, PORT, ORIGINS, METHODS, ALLOWEDHEADERS, CREDENTIALS }
}






