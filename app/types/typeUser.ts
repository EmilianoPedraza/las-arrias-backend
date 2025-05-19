//lo que se maneja en el backend
export type ClientLocalUserType = {
    _id: string,
    nombre: string,
    apellido: string,
    nombreUsuario: string,
    email: string,
    dni: number,
    telefono?: number
}

//lo que se recive
export type LocalUserType = {
    password: string
} & ClientLocalUserType


//-----------------------------------------------------------------

//lo que se maneja en el backend
export type ClientVisitingUserType = {
    _id: string,
    nombre: string,
    apellido: string,
    nombreUsuario: string,
    email: string,
}
//lo que se recive
export type VisitingUserType = {
    password: string
} & ClientVisitingUserType


//-----------------------------------------------------------------

type ClientUser = ClientLocalUserType | ClientVisitingUserType

//lo que se maneja en el backend
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

//lo que se recive
export type ClientUserType = {
    password: string
} & ClientUser

