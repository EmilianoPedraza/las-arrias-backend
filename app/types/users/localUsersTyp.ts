//Datos que se le envian al cliente (sin password)
export type ClientLocalUserType = {
    _id: string,
    nombre: string,
    apellido: string,
    nombreUsuario: string,
    email: string,
    dni: number,
    telefono?: number
}

//lo que se recive, para login
export type LocalUserType = {
    password: string
} & ClientLocalUserType

