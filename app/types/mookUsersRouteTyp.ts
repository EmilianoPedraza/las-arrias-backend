
//*Se declara el tipo de usuario local para testing/mookUsersRoute
type MookLocalUserType = {
    nombre: string,
    apellido: string,
    nombreUsuario: string,
    email: string,
    dni: number,
    telefono?: number
}


interface LocalUsersArray extends Array<MookLocalUserType> { }


export type { MookLocalUserType, LocalUsersArray }