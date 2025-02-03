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
    //?VALIDAR QUE TODOS LOS CAMPOS DE lLOCALUSER CUMPLAN CON SUS CONDICIONES DE FORMATO Y MÁS
    validateLocalUser() {
        if (!this.dni) {//Validar que los campos no estén indefinidos
            throw new Error("El campo dni no existe");
        }
        if (!validType(this.dni, 'number')) {//Validar que DNI sea de tipo number
            throw new Error('El DNI no es un tipo de dato valido');
        }
        if (!validarNumEntero(this.dni)) {//Validar que DNI sea de tipo entero y no decimal
            throw new Error('El DNI incumple las condiciones de formato')
        }
        if (!(this.dni >= 999999 && this.dni <= 99999999)) {//Validar que DNI sea de 7 o 8 digitos
            throw new Error('El DNI incumple las condiciones de formato')
        }
        //*Validar si existe número de telefono, validar si es de tipo number--->Pendiente a mejorar
        if (this.telefono && !validType(this.telefono, 'number')) {
            throw new Error('El Número de telefono no es un tipo de dato valido');
        }
    }
    //Metódo para crear un localUser
    createLocalUser() {
        //?VALIDAR QUE TODOS LOS CAMPOS DE USER CUMPLAN CON SUS CONDICIONES DE FORMATO Y MÁS
        this.validateUser()
        //?VALIDAR QUE TODOS LOS CAMPOS DE lLOCALUSER CUMPLAN CON SUS CONDICIONES DE FORMATO Y MÁS
        this.validateLocalUser()
    }
}

