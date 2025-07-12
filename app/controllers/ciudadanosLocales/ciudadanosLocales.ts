import User from "../user/user";
const { validarApellido, validarNombre } = User;

// Modelo de ciudadanos locales
import { localCitizens } from "../../models/ciudadanosLocales";

// Tipos
import { LocalCitizens } from "../../types/typeUser";

// Funciones utilitarias
import { validarNumEntero, validType } from "../../functions/functions";

// Clase de error personalizada
import { UserError } from "../user/errors/userError";




export type ErrorCreateNewLocalCitizens = {
    errorResponse?: {
        code?: number
        writeErrors?: [
            {
                err: {
                    op?: {
                        nombre: string,
                        apellido: string,
                        dni: number,
                        _id: string,
                        __v: number
                    }
                }
            }
        ]
    }
}


export class LocalCitizensClass {
    /**
     * Inserta uno o varios ciudadanos locales en la base de datos.
     * 
     * @param Data Array de objetos de tipo LocalCitizens a insertar.
     */
    static createNewLocalCitizens = async (Data: LocalCitizens[] = []) => {
        await localCitizens.insertMany(Data)
    }


    /**
     * Busca un ciudadano local por una propiedad específica (ej: nombre, apellido o dni).
     * 
     * @param prop Propiedad por la cual buscar (clave del documento).
     * @param valor Valor de la propiedad a buscar.
     * @returns El primer objeto encontrado o `false` si no existe.
     */
    static buscarPorProps = async (prop: string, valor: string | number): Promise<object | boolean> => {//!problema de tipado en retorno
        const usuario = await localCitizens.find({ [prop]: valor }).lean()
        if (usuario.length > 0) {
            return usuario[0]
        }
        return false
    }

    /**
     * Valida que el DNI sea válido.
     * 
     * - Verifica que exista.
     * - Verifica que sea un número entero.
     * - Verifica que tenga entre 7 y 8 dígitos (rango argentino típico).
     * 
     * @param dni DNI a validar.
     * @throws UserError si el DNI no cumple alguna condición.
     */
    static valydDni = async (dni: number) => {
        if (!dni) {//Validar que los campos no estén indefinidos
            throw new UserError("El campo DNI no existe", "BadRequest");
        }
        if (!validType(dni, 'number')) {//Validar que DNI sea de tipo number
            throw new UserError('El DNI no es un tipo de dato valido', "BadRequest");
        }
        if (!validarNumEntero(dni)) {//Validar que DNI sea de tipo entero y no decimal
            throw new UserError('El DNI incumple las condiciones de formato', "BadRequest")
        }
        if (!(dni >= 999999 && dni <= 99999999)) {//Validar que DNI sea de 7 o 8 digitos
            throw new UserError('El DNI incumple las condiciones de formato', "BadRequest")
        }
        if (await LocalCitizensClass.buscarPorProps('dni', dni)) {
            throw new UserError('El DNI de usuario ya existe', "Unauthorized")
        }
    }


    /**
     * Valida y prepara un ciudadano local antes de agregarlo individualmente, para luego agregarlo.
     * 
     * - Valida nombre y apellido usando funciones personalizadas.
     * - Valida DNI.
     * 
     * @param data Objeto de tipo LocalCitizens con los datos del ciudadano.
     */
    static oneAddCitizens = async (data: LocalCitizens) => {
        validarNombre(data.nombre)
        validarApellido(data.apellido)
        await this.valydDni(data.dni)//validar DNI
        const newCitizens = new localCitizens(data)
        await newCitizens.save()

    }

    /**
     * Elimina un ciudadano local de la base de datos.
     * 
     * @param data Objeto de tipo LocalCitizens que identifica al ciudadano a eliminar.
     */
    static deleteLocalCitizens = async (data: LocalCitizens) => {
        await localCitizens.deleteOne(data)
    }
    /**
     * Analiza un error devuelto al crear uno o varios ciudadanos locales y clasifica el tipo de error.
     * 
     * - Si el código de error es 11000, indica duplicado (generalmente DNI repetido).
     * - Devuelve información sobre el error, o un string para otros tipos.
     * 
     * @param error Error capturado durante la creación de ciudadanos.
     * @returns Objeto con tipo de error y DNI repetido, o string indicando otro tipo de error.
     */
    static errorCreateNewLocalCitizens = (error: ErrorCreateNewLocalCitizens) => {
        if (error.errorResponse?.code === 11000) {
            const { errorResponse } = error
            const { writeErrors } = errorResponse
            const stepOne = writeErrors && writeErrors[0]
            if (stepOne) {
                return {
                    typError: 'dni repeat',
                    dni: stepOne.err.op?.dni
                }
            }
            else {
                return 'otherError'
            }
        }
        return 'unknownError';
    }

}


