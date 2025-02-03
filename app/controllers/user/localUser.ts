//Función que permite validar el tipo de dato de una variable
import { validType, validarNumEntero } from "../../functions/functions";
//Clase base
import User from "./user";

export default class localUser extends User {
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
        //Validar que DNI sea de tipo number
        if (!validType(this.dni, 'number')) {
            throw new Error('El DNI no es un tipo de dato valido');
        }
        //Validar que DNI sea de tipo entero y no decimal
        if (!validarNumEntero(this.dni)) {
            throw new Error('El DNI incumple las condiciones de formato')
        }
        //Validar que DNI sea de 7 o 8 digitos
        if (this.dni >= 1_000_000 && this.dni <= 99_999_999) {
            throw new Error('El DNI incumple las condiciones de formato')
        }
        //Validar si existe número de telefono y validar si es de tipo number
        if (this.telefono && !validType(this.telefono, 'number')) {
            throw new Error('El Número de telefono no es un tipo de dato valido');
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

