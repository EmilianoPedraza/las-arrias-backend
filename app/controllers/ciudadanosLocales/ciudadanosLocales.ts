
//Modelo ciudadanos locales
import { localCitizens } from "../../models/ciudadanosLocales";
//tipos
import { LocalCitizens } from "../../types/typeUser";



export class LocalCitizensClass {
    static createNewLocalCitizens = async (Data: LocalCitizens[] = []) => {
        await localCitizens.insertMany(Data)
    }
    static deleteLocalCitizens = async (data: LocalCitizens) => {
        try {
            await localCitizens.deleteOne(data)
        } catch (error) {

        }
    }
}

