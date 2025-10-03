
import User from "../user";
import { UserError } from "../errors/userError";
import { adminUser } from '../../../models/administrators'
import { validarNumEntero, validType } from "../../../functions/functions";
import bcrypt from "bcrypt"//Para encriptar contraseñas

const { validarPassword, validarApellido, validarNombre, compararPsw } = User

export type AdminUser = {
    _id: string,
    __t: string,
    nombre: string
    apellido: string,
    password: string,
    dni: number
}




export class UserAdmin {
    //?TODAS LAS VALIDACIONES PARA GARANTIZAR UN NOMBRE DE USUARIO CON CONDICIONES DE FORMATO CORRECTO  O GENERA ERROR BADREQUEST
    constructor() { }

    //?BUSCAR UN USUARIO POR CAMPO, SI EXISTE RETORNA UN ARRAY CON EL USUARIO, CASO CONTRARIO FALSE
    static buscarPorProps = async (prop: string, valor: string | number): Promise<object | boolean> => {//!problema de tipado en retorno
        const usuario = await adminUser.find({ [prop]: valor }).lean()
        if (usuario.length > 0) {
            return usuario[0]
        }
        return false
    }


    static valydDni = async (dni: number) => {
        if (!dni) {//Validar que los campos no estén indefinidos
            throw new UserError("El campo DNI no existe", "BadRequest");
        }
        if (!validType(dni, 'number')) {//Validar que DNI sea de tipo number
            throw new UserError('El DNI no es un tipo de dato valido', "BadRequest");
        }
        if (!validarNumEntero(dni)) {//Validar que DNI sea de tipo entero y no decimal
            throw new UserError('El DNI incumple las condiciones de formato', "BadRequest")
        }
        if (!(dni >= 999999 && dni <= 99999999)) {//Validar que DNI sea de 7 o 8 digitos
            throw new UserError('El DNI incumple las condiciones de formato', "BadRequest")
        }
    }


    static encriptarPsw = async (password: string): Promise<string | never> => {
        try {
            const newPsw = await bcrypt.hash(password, 17)
            password = newPsw
            return newPsw
        } catch (error) {
            throw new UserError('Hubo un problema en la base de datos', "InternalServerError");
        }
    }

    static createAdmin = async (dt: AdminUser) => {
        const data = { ...dt }
        validarNombre(data.nombre)//validar que el nombre no tenga caracteres riesgosos
        validarApellido(data.apellido)//alidar que apellido no tenga caracteres riesgosos.
        await this.valydDni(data.dni)//validar DNI
        validarPassword(data.password)//validar que el password no tenga caracteres riesgosos
        const nwPsswrd = await this.encriptarPsw(data.password)//crear contra hasheada
        data.password = nwPsswrd //se pasa la nueva contraseña
        const admin = new adminUser(data)
        await admin.save()
    }


    static loginUserAdmin = async (data: AdminUser) => {
        validarNombre(data.nombre)
        validarApellido(data.apellido)
        await this.valydDni(data.dni)
        validarPassword(data.password)
        const admin = await UserAdmin.buscarPorProps('dni', data.dni) as AdminUser
        if (!admin) {
            throw new UserError('No se a encontrado un administrador con ese DNI', "BadRequest");
        }
        if (await compararPsw(admin.password, data.password)) {
            console.log('desde loginUserAdmin', admin)
            return admin
        }
        throw new UserError('Contraseña incorrecta', 'Unauthorized');
    }

}