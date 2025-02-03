//Función que permite validar el tipo de dato de una variable
import { validType } from "../../functions/functions"
//Para obtener expresiónes regulares de validación de strings
import { EXPRESIONS_TYPES_VALID_USER } from "../../types/expresions";


export default class User {
    constructor(
        public nombre: string,
        public apellido: string,
        public nombreUsuario: string,
        public email: string,
        public password: string,
        // public creadoEn: Date,
        // public actualizadoEn: Date
    ) { }

    //?VALIDAR QUE UNA CADENA DE STRING TENGA EL FORMATO CORRECTO PARA SER EMAIL
    static validarCorreo = (email: string): boolean => {
        const regex = new RegExp(EXPRESIONS_TYPES_VALID_USER.VALID_EMAIL);
        return regex.test(email);//retorna true si es valido y false en caso contrario
    };

    //?VALIDAR QUE UNA CADENA DE STRING TENGA EL FORMATO CORRECTO PARA SER UN NOMBRE DE USUARIO
    static validarNombreUsuario = (userName: string): boolean => {
        const regex = new RegExp(EXPRESIONS_TYPES_VALID_USER.VALID_USERNAME)
        return regex.test(userName)//retorna true si es valido y false en caso contrario
    }

    //?VALIDAR QUE UNA CADENA DE STRING TENGA EL FORMATO CORRECTO PARA SER UN PASSWORD
    static validPassword = (password: string): boolean => {
        const regex = new RegExp(EXPRESIONS_TYPES_VALID_USER.VALID_PASSWORD)
        return regex.test(password)//retorna true si es valido y false en caso contrario
    }

    //?VALIDAR QUE UNA CADENA DE STRING TENGA EL FORMATO CORRECTO PARA SER UN PASSWORD
    static validNombreYapellido = (nombreOapellido: string): boolean => {
        const regex = new RegExp(EXPRESIONS_TYPES_VALID_USER.FIRST_AND_LASTNAME)
        return regex.test(nombreOapellido)//retorna true si es valido y false en caso contrario
    }

    //?VALIDAR QUE TODOS LOS CAMPOS DE USER CUMPLAN CON SUS CONDICIONES DE FORMATO Y MÁS
    validateUser() {
        //!Validaciones de nombre
        if (!this.nombre) {
            throw new Error('El campo nombre no existe')
        }
        if (!validType(this.nombre, 'string')) {
            throw new Error('El nombre no es un tipo de dato valido')
        }
        if (!User.validNombreYapellido(this.nombre)) {
            throw new Error('El nombre incumple las condiciones de formato')
        }
        //!Validaciones de apellido
        if (!this.apellido) {
            throw new Error('El campo apellido no existe');
        }
        if (!validType(this.apellido, 'string')) {
            throw new Error('El apellido no es un tipo de dato valido')
        }
        if (!User.validNombreYapellido(this.apellido)) {
            throw new Error('El nombre incumple las condiciones de formato')
        }
        //!Validaciones de nombre de usuario
        if (!this.nombreUsuario) {
            throw new Error('El campo nombreUsuario no existe');
        }
        if (!validType(this.nombreUsuario, 'string')) {
            throw new Error('El nombre de usuario no es un tipo de dato valido')
        }
        if (!User.validarNombreUsuario(this.nombreUsuario)) {
            throw new Error('El nombre de usuario incumple las condiciones de formato')
        }
        //!Validaciones de email
        if (!this.email) {
            throw new Error('El campo email no existe');
        }
        if (!validType(this.email, 'string')) {
            throw new Error('El email debe ser un string')
        }
        if (!User.validarCorreo(this.email)) {
            throw new Error('El email no cumple con las condiciones de formato')
        }
        //!Validaciones de password
        if (!this.password) {
            throw new Error('El campo password no existe');
        }
        if (!validType(this.password, 'string')) {
            throw new Error('El password debe ser un string')
        }
        if (!User.validPassword(this.password)) {
            throw new Error('El password no cumple con las condiciones de formato')
        }

    }
}

