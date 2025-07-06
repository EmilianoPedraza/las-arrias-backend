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
 * - SECRET_VALID_USER: Clave secreta para firmar tokens y cookies de sesión_______.
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
 * - SECRET_LOG_ACCES_TOKEN:
 * - SECRET_LOG_ACCES_USER_TOKEN:
 */
export const environmentVars = () => {
    const { MONGO_CLOUSER_LA, SECRET_VALID_USER, MONGO_COMPAS_DB_LA, PORT, ORIGINS_PROD, ORIGINS_DEV, SECRET_LOG_ACCES_TOKEN, SECRET_LOG_ACCES_USER_TOKEN } = process.env

    const ALLOWEDHEADERS = [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin']
    const METHODS = ['GET', 'POST', 'PUT', 'DELETE']
    const ORIGINS = isDev ? ORIGINS_DEV : ORIGINS_PROD
    const CREDENTIALS = true


    const FIRST_AND_LASTNAME = "^(?!.*\\s{2})[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ]{3,}(?:\\s[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ]{3,}){0,2}$"
    const VALID_EMAIL = "^[a-zA-Z0-9]+(\\.[a-zA-Z0-9]+)*@[a-zA-Z]+\\.[a-zA-Z]+$"
    const VALID_USERNAME = "^(?!.*\\.\\.)(?!.*_\\.)(?!.*\\._)[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ0-9](?:[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ0-9_.]*(?:\\.[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ0-9])?)*$"
    const VALID_PASSWORD = "^(?!.*\\.\\.)[A-Za-zÁÀÉÈÍÌÓÒÚÙáàéèíìúùÑñ0-9_]+(?:\\.[A-Za-zÁÀÉÈÍÌÓÒÚÙáàéèíìúùÑñ0-9_]+)*[^.]$"

    return { MONGO_CLOUSER_LA, SECRET_VALID_USER, FIRST_AND_LASTNAME, VALID_EMAIL, VALID_USERNAME, VALID_PASSWORD, MONGO_COMPAS_DB_LA, PORT, ORIGINS, METHODS, ALLOWEDHEADERS, CREDENTIALS, SECRET_LOG_ACCES_TOKEN, SECRET_LOG_ACCES_USER_TOKEN }
}






