
//Modelo ciudadanos locales
import { localCitizens } from "../../models/ciudadanosLocales";
//tipos
import { LocalCitizens } from "../../types/typeUser";

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
    //Agregar varios o un documento... recibe un array
    static createNewLocalCitizens = async (Data: LocalCitizens[] = []) => {
        await localCitizens.insertMany(Data)
    }
    //Elimina un documento
    static deleteLocalCitizens = async (data: LocalCitizens) => {
        await localCitizens.deleteOne(data)
    }
    //comprueba el error a la hora de agregar varios o un documento
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
    }

}


