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
 */
export const environmentVars = () => {
    const { MONGO_CLOUSER_LA, SECRET_VALID_USER } = process.env
    const FIRST_AND_LASTNAME = "^(?!.*\\s{2})[A-Za-zÁáÉéÍíÓóÚúÜüÑñ]{3,}(?:\\s[A-Za-zÁáÉéÍíÓóÚúÜüÑñ]{3,}){0,2}$"
    const VALID_EMAIL = "^[a-zA-Z1-9]+(\\.[a-zA-Z1-9]+)*@[a-zA-Z]+\\.[a-zA-Z]+$"
    const VALID_USERNAME = "^(?!.*_\\.)[A-Za-zÁáÉéÍíÓóÚúÜüÑñ0-9](?:[A-Za-zÁáÉéÍíÓóÚúÜüÑñ0-9_.]*(?:\\.[A-Za-zÁáÉéÍíÓóÚúÜüÑñ0-9])?)*$"
    const VALID_PASSWORD = "^(?!.*\\.\\.)[A-Za-zÁÉÍÓÚáéíóúÑñ1-9_]+(?:\\.[A-Za-zÁÉÍÓÚáéíóúÑñ1-9_]+)*[^.]$"

    return { MONGO_CLOUSER_LA, SECRET_VALID_USER, FIRST_AND_LASTNAME, VALID_EMAIL, VALID_USERNAME, VALID_PASSWORD }
}






