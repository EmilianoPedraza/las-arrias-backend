import dotenv from "dotenv"
import path from "path";


const ruta = path.resolve(__filename, "../../../.env")
console.log(ruta)


/**
 * Carga las variables de entorno desde un archivo .env utilizando dotenv,
 * y devuelve un objeto con las configuraciones necesarias para seguridad
 * y validaciones de usuario en la aplicación.
 * 
 * Variables devueltas:
 * - SECRET_VALID_USER: Clave secreta para firmar tokens y cookies de sesión.
 * - FIRST_AND_LASTNAME: Expresión regular para validar nombres y apellidos.
 * - VALID_EMAIL: Expresión regular para validar correos electrónicos.
 * - VALID_USERNAME: Expresión regular para validar nombres de usuario.
 * - VALID_PASSWORD: Expresión regular para validar contraseñas seguras.
 */

export default function env() {
    dotenv.config({
        path: path.resolve(ruta)
    })
    const { SECRET_VALID_USER, FIRST_AND_LASTNAME, VALID_EMAIL, VALID_USERNAME, VALID_PASSWORD } = process.env
    return { SECRET_VALID_USER, FIRST_AND_LASTNAME, VALID_EMAIL, VALID_USERNAME, VALID_PASSWORD }
}



// import parseArgs from "minimist"

// const options = {
//     alias: {
//         m: 'modo',
//         p: 'port'
//     },
//     default: {
//         modo: "dev",
//         port: 8080,
//     }
// }
