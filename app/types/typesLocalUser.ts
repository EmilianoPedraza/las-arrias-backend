export type ClientLocalUserType = {
    _id: string,
    nombre: string,
    apellido: string,
    nombreUsuario: string,
    email: string,
    dni: number,
    telefono?: number
}
export type LocalUserType = {
    password: string
} & ClientLocalUserType