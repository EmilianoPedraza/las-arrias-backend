import { loadEnvironmentVars, environmentVars } from "../../config/config";

import { UserError } from "./errors/userError"//Clase de error personalizada extendida
import bcrypt from "bcrypt"//Para encriptar contraseñas
import { validType, validarStringConExpresion } from "../../functions/functions"//Función que permite validar el tipo de dato de una variable
//Se importa el modelo de usuario creado para la base de datos
import { User as UserModel } from "../../models/usuario"; // se utiliza 'as' para renombrar User a UserModel y así evitar conflictos

import { ClientUserType, UserType } from "../../types/typeUser";
//!
import { validateEmail } from "../../functions/functions";
//!
//Carga las variables de entorno 
loadEnvironmentVars()
const { FIRST_AND_LASTNAME, VALID_USERNAME, VALID_PASSWORD, VALID_EMAIL } = environmentVars()

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



    //?COMPARAR CONTRASEÑA CON CONTRASEÑA ENCRIPTADA:(internamente encripta la contraseña que no está encriptada para compararla con la que si originalmente)
    static compararPsw = async (pswEncr: string, psw: string): Promise<boolean | never> => {
        try {
            if (await bcrypt.compare(psw, pswEncr)) {
                return true
            }
            return false
        } catch (error) {
            throw new UserError('No se a podido comprobar correctamente la contraseña', "InternalServerError");
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
        if (!validarStringConExpresion(nombre, FIRST_AND_LASTNAME as string)) {
            throw new UserError('El nombre incumple las condiciones de formato', "BadRequest")
        }
    }



    //?TODAS LAS VALIDACIONES PARA GARANTIZAR UN APELLIDO CON CONDICIONES DE FORMATO CORRECTO  O GENERA ERROR BADREQUEST
    static validarApellido(apellido: string) {
        if (!apellido) {
            throw new UserError('El campo apellido no existe', "BadRequest");
        }
        if (!validType(apellido, 'string')) {
            throw new UserError('El apellido no es un tipo de dato valido', "BadRequest")
        }
        if (!validarStringConExpresion(apellido, FIRST_AND_LASTNAME as string)) {
            throw new UserError('El apellido incumple las condiciones de formato', "BadRequest")
        }
    }



    //?TODAS LAS VALIDACIONES PARA GARANTIZAR UN NOMBRE DE USUARIO CON CONDICIONES DE FORMATO CORRECTO  O GENERA ERROR BADREQUEST
    static validarNombreUsuario(nomUser: string) {
        if (!nomUser) {
            throw new UserError('El campo nombreUsuario no existe', "BadRequest");
        }
        if (!validType(nomUser, 'string')) {
            throw new UserError('El nombre de usuario no es un tipo de dato valido', "BadRequest")
        }
        if (!validarStringConExpresion(nomUser, VALID_USERNAME as string)) {
            throw new UserError('El nombre de usuario incumple las condiciones de formato', "BadRequest")
        }
    }


    //?TODAS LAS VALIDACIONES PARA GARANTIZAR UN EMAIL CON CONDICIONES DE FORMATO CORRECTO  O GENERA ERROR BADREQUEST
    static validarEmail(email: string) {
        if (!email) {
            throw new UserError('El campo email no existe', "BadRequest");
        }
        if (!validType(email, 'string')) {
            throw new UserError('El email debe ser un string', "BadRequest")
        }
        if (!validarStringConExpresion(email, VALID_EMAIL as string) || !validateEmail(email)) {
            throw new UserError('El email no cumple con las condiciones de formato', "BadRequest")
        }
    }



    //?TODAS LAS VALIDACIONES PARA GARANTIZAR UN PASSWORD CON CONDICIONES DE FORMATO CORRECTO  O GENERA ERROR BADREQUEST
    static validarPassword(password: string) {
        if (!password) {
            throw new UserError('El campo password no existe', "BadRequest");
        }
        if (!validType(password, 'string')) {
            throw new UserError('El password debe ser un string', "BadRequest")
        }
        if (!validarStringConExpresion(password, VALID_PASSWORD as string)) {
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
        if (this.password.length < 7) {
            throw new UserError('Longitud de password insuficiente', "BadRequest")
        }
    }

    // //?LOGIN DE USUARIO
    static async login(nombreUser: string, password: string): Promise<UserType> {
        User.validarNombreUsuario(nombreUser)//valida el nombre de usuario, si no cumple con el formato de string genera error badrequest
        User.validarPassword(password)//valida la contraseña, si no cumple con el formato de string genera error badrequest
        const user = await User.buscarPorProps('nombreUsuario', nombreUser) as ClientUserType //retorna false si no existe el usuario, caso contrario lo trae
        if (!user) {
            throw new UserError('El campo nombreUsuario no existe', "BadRequest");
        }
        if (await User.compararPsw(user.password, password)) {//Comparar contraseña provista por el usuario desde el cliente con el de la base de datos
            return user
        }
        throw new UserError('Contraseña incorrecta', 'Unauthorized');
    }
}

