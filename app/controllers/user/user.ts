
import { UserError } from "./errors/userError"//Clase de error personalizada extendida
import bcrypt from "bcrypt"//Para encriptar contraseñas
import { validType, validarStringConExpresion } from "../../functions/functions"//Función que permite validar el tipo de dato de una variable
import { EXPRESIONS_TYPES_VALID_USER } from "../../enums/expresions";//Para obtener expresiónes regulares de validación de strings
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
    //?BUSCAR UN USUARIO POR CAMPO, SI EXISTE RETORNA UN ARRAY CON EL USUARIO, CASO CONTRARIO FALSE
    static buscarPorProps = async (prop: string, valor: string | number): Promise<object | boolean> => {//!problema de tipado en retorno
        const usuario = await UserModel.find({ [prop]: valor }).lean()
        if (usuario.length > 0) {
            return usuario[0]
        }
        return false
    }

    //?ENCRIPTAR CONTRASEÑA
    encriptarPsw = async (): Promise<true | never> => {
        try {
            const newPsw = await bcrypt.hash(this.password, 10)
            this.password = newPsw
            return true
        } catch (error) {
            throw new UserError('Hubo un problema en la base de datos', "InternalServerError");
        }
    }
    //?COMPARAR CONTRASEÑA DESENCRIPTADA CON CONTRASEÑA ENCRIPTADA
    static compararPsw = async (pswEncr: string, psw: string): Promise<boolean | never> => {
        try {
            if (await bcrypt.compare(psw, pswEncr)) {
                return true
            }
            return false
        } catch (error) {
            throw new UserError('No se a podido combrobar correctamente la contraseña', "InternalServerError");
        }
    }
    //?TODAS LAS VALIDACIONES PARA GARANTIZAR UN NOMBRE CON CONDICIONES DE FORMATO CORRECTO
    static validarNombre(nombre: string) {
        if (!nombre) {
            throw new UserError('El campo nombre no existe', "BadRequest")
        }
        if (!validType(nombre, 'string')) {
            throw new UserError('El nombre no es un tipo de dato valido', "BadRequest")
        }
        if (!validarStringConExpresion(nombre, EXPRESIONS_TYPES_VALID_USER.FIRST_AND_LASTNAME)) {
            throw new UserError('El nombre incumple las condiciones de formato', "BadRequest")
        }
    }
    //?TODAS LAS VALIDACIONES PARA GARANTIZAR UN APELLIDO CON CONDICIONES DE FORMATO CORRECTO
    static validarApellido(apellido: string) {
        if (!apellido) {
            throw new UserError('El campo apellido no existe', "BadRequest");
        }
        if (!validType(apellido, 'string')) {
            throw new UserError('El apellido no es un tipo de dato valido', "BadRequest")
        }
        if (!validarStringConExpresion(apellido, EXPRESIONS_TYPES_VALID_USER.FIRST_AND_LASTNAME)) {
            throw new UserError('El apellido incumple las condiciones de formato', "BadRequest")
        }
    }
    //?TODAS LAS VALIDACIONES PARA GARANTIZAR UN NOMBRE DE USUARIO CON CONDICIONES DE FORMATO CORRECTO O GENERA ERROR BADREQUEST
    static validarNombreUsuario(nomUser: string) {
        if (!nomUser) {
            throw new UserError('El campo nombreUsuario no existe', "BadRequest");
        }
        if (!validType(nomUser, 'string')) {
            throw new UserError('El nombre de usuario no es un tipo de dato valido', "BadRequest")
        }
        if (!validarStringConExpresion(nomUser, EXPRESIONS_TYPES_VALID_USER.VALID_USERNAME)) {
            throw new UserError('El nombre de usuario incumple las condiciones de formato', "BadRequest")
        }
    }
    //?TODAS LAS VALIDACIONES PARA GARANTIZAR UN EMAIL CON CONDICIONES DE FORMATO CORRECTO
    static validarEmail(email: string) {
        if (!email) {
            throw new UserError('El campo email no existe', "BadRequest");
        }
        if (!validType(email, 'string')) {
            throw new UserError('El email debe ser un string', "BadRequest")
        }
        if (!validarStringConExpresion(email, EXPRESIONS_TYPES_VALID_USER.VALID_EMAIL)) {
            throw new UserError('El email no cumple con las condiciones de formato', "BadRequest")
        }
    }
    static validarPassword(password: string) {
        if (!password) {
            throw new UserError('El campo password no existe', "BadRequest");
        }
        if (!validType(password, 'string')) {
            throw new UserError('El password debe ser un string', "BadRequest")
        }
        if (!validarStringConExpresion(password, EXPRESIONS_TYPES_VALID_USER.VALID_PASSWORD)) {
            throw new UserError('El password no cumple con las condiciones de formato', "BadRequest")
        }
    }

    //?VALIDAR QUE TODOS LOS CAMPOS DE USER CUMPLAN CON SUS CONDICIONES DE FORMATO Y MÁS
    async validateRegisterUser() {
        //!Validaciones de nombre
        User.validarNombre(this.nombre)//validar que el el string cumpla las condiciones
        //!Validaciones de apellido
        User.validarApellido(this.apellido)//validar que el el string cumpla las condiciones
        //!Validaciones de nombre de usuario
        User.validarNombreUsuario(this.nombreUsuario)//validar que el el string cumpla las condiciones
        if (await User.buscarPorProps('nombreUsuario', this.nombreUsuario)) {
            throw new UserError('El nombre de usuario ya existe en la base de datos', "Unauthorized")
        }
        //!Validaciones de email
        User.validarEmail(this.email)//validar que el el string cumpla las condiciones
        if (await User.buscarPorProps('email', this.email)) {
            throw new UserError('El email ya existe en la base de datos', "Unauthorized")
        }
        //!Validaciones de password
        User.validarPassword(this.password)//validar que el el string cumpla las condiciones
    }
}

