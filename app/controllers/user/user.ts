//Para encriptar contraseñas
import bcrypt from "bcrypt"
//Función que permite validar el tipo de dato de una variable
import { validType } from "../../functions/functions"
//Tipos
import { FindUser } from "../../types/modelTypes";
//Para obtener expresiónes regulares de validación de strings
import { EXPRESIONS_TYPES_VALID_USER } from "../../types/expresions";
//Se importa el modelo de usuario creado para la base de datos
import { User as UserModel } from "../../models/usuario"; // se utiliza 'as' para renombrar User a UserModel y así evitar conflictos

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
    //?ENCRIPTAR CONTRASEÑA
    encriptarPsw = async (): Promise<true | never> => {
        try {
            const newPsw = await bcrypt.hash(this.password, 10)
            this.password = newPsw
            return true
        } catch (error) {
            throw new Error('Error procesando contraseña');
        }
    }
    //?COMPARAR CONTRASEÑA DESENCRIPTADA CON CONTRASEÑA ENCRIPTADA
    compararPsw = async (password: string): Promise<boolean | never> => {
        try {
            if (await bcrypt.compare(password, this.password)) {
                return true
            }
            return false
        } catch (error) {
            throw new Error('Error procesando contraseña');
        }
    }

    //?BUSCAR UN USUARIO POR CAMPO, SI EXISTE RETORNA UN ARRAY CON EL USUARIO, CASO CONTRARIO FALSE
    static buscarPorProps = async (prop: string, valor: string | number): Promise<FindUser | boolean | unknown> => {//!problema de tipado en retorno
        const usuario = await UserModel.find({ [prop]: valor })
        if (usuario.length > 0) {
            return usuario[0]
        }
        return false
    }

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
    async validateUser() {
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
        if (await User.buscarPorProps('nombreUsuario', this.nombreUsuario)) {
            throw new Error('El nombre de usuario ya existe')
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

