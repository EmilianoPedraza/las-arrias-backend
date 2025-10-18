import { ClientLocalUserType } from "./localUsersTyp"//tipos de usuarios locales
import { ClientVisitingUserType } from "./visitingUsersTyp"//tipos de usuarios visitantes


//-----------------------------------------------------------------
//lo que se le envia al cliente (puede ser local o visitante)
type ClientUser = ClientLocalUserType | ClientVisitingUserType

//Lo que retorna User al hacer login(puede ser local o visitante)
export type UserType = {
    _id: string,
    __t?: 'LocalUser' | 'VisitingUser'
    nombre: string,
    apellido: string,
    nombreUsuario: string,
    email: string,
    dni?: number,
    telefono?: number
}

// lo que se ingresa en login
export type ClientUserType = {
    password: string
} & ClientUser



//Para ciudadanos locales(para realizar nuevas cargas con permiso de administrador)
export type LocalCitizens = {
    _id: string,
    nombre: string,
    apellido: string,
    dni: number,
}
