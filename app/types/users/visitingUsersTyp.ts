//Datos que se le envian al cliente (sin password)
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

