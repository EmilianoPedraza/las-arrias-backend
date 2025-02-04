import { LocalUser } from "../../models/usuario";
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
    validateLocalUser = async () => {
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
        if (await User.buscarPorProps('dni', this.dni)) {
            throw new Error('El DNI de usuario ya existe')
        }
        if (this.telefono && !validType(this.telefono, 'number')) {
            throw new Error('El Número de telefono no es un tipo de dato valido');
        }
    }
    //?GUARDAR UN NUEVO DOCUMENTO(UN LOCALUSER)
    guardarNuevoLocalUser = async () => {
        try {
            const nuevoUsuario = new LocalUser({
                nombre: this.nombre,
                apellido: this.apellido,
                nombreUsuario: this.nombreUsuario,
                email: this.email,
                password: this.password,
                dni: this.dni,
                telefono: this.telefono
            })
            await nuevoUsuario.save()
        } catch (error) {
            throw new Error('Error al intentar guardar el nuevo usuario en la base de datos');

        }
    }
    //?CREAR UN NUEVO USUARIO
    async createLocalUser() {
        //?VALIDAR QUE TODOS LOS CAMPOS DE USER CUMPLAN CON SUS CONDICIONES DE FORMATO Y MÁS
        await this.validateUser()
        //?VALIDAR QUE TODOS LOS CAMPOS DE lLOCALUSER CUMPLAN CON SUS CONDICIONES DE FORMATO Y MÁS
        await this.validateLocalUser()
        //?SE CAMBIA LA CONTRASEÑA INGRESADA DESEDE EL LADO DEL CLIENTE POR UNA CONTRASEÑA ENCRIPTADA
        await this.encriptarPsw()
        await this.guardarNuevoLocalUser()
    }
}

