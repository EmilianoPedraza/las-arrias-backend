import jsw from "jsonwebtoken"
import { UserType } from "../../../types/users/userTyp"

//* CREACIÓN DE TOKEN JWT
/**
 * Genera un token JWT válido por 1 hora
 * @param user - Usuario autenticado
 * @returns Token firmado como string
 */
const createToken = (userr: /*UserType*/ object, secret: string): string => {
    const token = jsw.sign(userr, secret, { expiresIn: '1h' })
    return token
}



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


export { createToken, response }