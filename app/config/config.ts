import dotenv from "dotenv"

import minimist from "minimist";

export const isDev = minimist(process.argv.slice(2)).mode === "dev"

import path from "path";

const rutaType = isDev ? 'dev.env' : '.env'
const ruta = path.resolve(__filename, `../../../${rutaType}`)


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
 * - SECRET_LOG_ADMIN_USER: Secret para coookie y json de user amdin
 * - MONGO_COMPAS_DB_LA: Ruta de coneccion para desarrollo con mongo copass.
 * - PORT: Puerto de la api.
 * - ORIGINS: Opcions para cors.
 * - METHODS: Opcion para cors.
 * - ALLOWEDHEADERS : Opcion para cors.
 * - CREDENTIALS: Opcion para cors.
 * - SECRET_LOG_ACCES_TOKEN:
 * - SECRET_LOG_ACCES_USER_TOKEN:
 * -REDIS_HOST: Host de redis
 */
export const environmentVars = () => {
    const { MONGO_CLOUSER_LA, SECRET_VALID_USER, MONGO, PORT, ORIGINS, SECRET_LOG_ACCES_TOKEN, SECRET_LOG_ACCES_USER_TOKEN, SECRET_LOG_ADMIN_USER, REDIS_HOST } = process.env

    const ALLOWEDHEADERS = [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin']
    const METHODS = ['GET', 'POST', 'PUT', 'DELETE']
    const CREDENTIALS = true

    const FIRST_AND_LASTNAME = "^(?!.*\\s{2})[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ]{3,}(?:\\s[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ]{3,}){0,2}$"
    //? const FIRST_AND_LASTNAME = !isDev ? "^(?!.*\\s{2})[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ]{3,}(?:\\s[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ]{3,}){0,2}$" : ''

    const VALID_EMAIL = "^(?=.{1,254}$)(?=[^@]{1,64}@)[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$"
    const VALID_USERNAME = "^(?!.*\\.\\.)(?!.*_\\.)(?!.*\\._)[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ0-9](?:[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ0-9_.]*(?:\\.[A-Za-zÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÑñ0-9])?)*$"
    const VALID_PASSWORD = "^(?!.*\\.\\.)[A-Za-zÁÀÉÈÍÌÓÒÚÙáàéèíìúùÑñ0-9_]+(?:\\.[A-Za-zÁÀÉÈÍÌÓÒÚÙáàéèíìúùÑñ0-9_]+)*[^.]$"

    return { MONGO_CLOUSER_LA, SECRET_VALID_USER, FIRST_AND_LASTNAME, VALID_EMAIL, VALID_USERNAME, VALID_PASSWORD, MONGO, PORT, ORIGINS, METHODS, ALLOWEDHEADERS, CREDENTIALS, SECRET_LOG_ACCES_TOKEN, SECRET_LOG_ACCES_USER_TOKEN, SECRET_LOG_ADMIN_USER, REDIS_HOST }
}




