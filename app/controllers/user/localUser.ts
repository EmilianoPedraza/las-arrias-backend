//Función que permite validar el tipo de dato de una variable
import { validType } from "../../functions/functions";
//Clase base
import User from "./user";

export class localUser extends User {
    constructor(
        public dni: number,
        public telefono: number | undefined,
        nombre: string,
        apellido: string,
        nombreUsuario: string,
        email: string,
        password: string
    ) {
        super(nombre, apellido, nombreUsuario, email, password)
    }
    //Validar si los campos son correctos
    validateLocalUser() {
        if (!validType(this.dni, 'number')) {
            throw new Error("El DNI debe ser un número");
        }
        if (this.telefono && !validType(this.telefono, 'number')) {
            throw new Error("El teléfono debe ser un número");
        }
    }
    //Metódo para crear un localUser
    createLocalUser() {
        try {
            this.validateUser()
            this.validateLocalUser()
            return 'ok'
        } catch (error) {
            return error
        }
    }
}

