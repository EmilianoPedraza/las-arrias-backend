//Expresiónes regulares para validar strings para datos del usuario
import { EXPRESIONS_TYPES_VALID_USER } from "../types/enums/expresions"
import { model, Schema } from "mongoose"

//? schema con datos en común de los 2 roles de usuario
// El discriminator es una forma de tener todos los usuarios en una misma colección,
//una manera organizada y escalable de manejar múltiples tipos de usuario.
/*
Ventajas de usar Discriminator:
Reutilización del esquema base sin duplicar código.
Misma colección en MongoDB, más fácil de gestionar.
filtros más eficientes, podés buscar todos los usuarios con
*/



//expresiónes regulares desde una cadena de texto correspondiente a una expresión regular
const validEmail = new RegExp(EXPRESIONS_TYPES_VALID_USER.VALID_EMAIL)
const valiUsername = new RegExp(EXPRESIONS_TYPES_VALID_USER.VALID_USERNAME)
const validNameAndLastName = new RegExp(EXPRESIONS_TYPES_VALID_USER.FIRST_AND_LASTNAME)

//?Esquema base de usuario
const userBaseScrema = new Schema({
    nombre: { type: String, required: true, match: validNameAndLastName },
    apellido: { type: String, required: true, match: validNameAndLastName },
    nombreUsuario: { type: String, required: true, unique: true, match: valiUsername },
    email: { type: String, required: true, unique: true, match: validEmail },
    password: { type: String, required: true },
    creadoEn: { type: Date, default: Date.now },
    actualizadoEn: { type: Date, default: Date.now },
}, { discriminatorKey: "__t" })


//?Modelo base
const User = model('User', userBaseScrema)


//*Modelo de esquema de usuario visitante
const VisitingUser = User.discriminator('VisitingUser', new Schema({}))

//*Modelo de esquema de usuario local
const LocalUser = User.discriminator('LocalUser',
    new Schema({
        dni: {
            type: Number, required: true, unique: true, validate: {
                validator: function (value: number) {
                    return value >= 999999 && value <= 99999999;
                },
                message: "dni-valor invalido.",
            },
        },
        telefono: { type: Number, required: false },
        contribuciones: { type: Number, default: 0 }
    })
)


export { LocalUser, VisitingUser, User }


