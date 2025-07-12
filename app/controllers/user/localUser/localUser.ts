//Modelo localUser
import { LocalUser } from "../../../models/usuario";
//Tipos de local user
import { ClientLocalUserType, LocalUserType } from "../../../types/typeUser";
//Modulo de errores personalizados
import { UserError } from "../errors/userError";
//Función que permite validar el tipo de dato de una variable
import { validType, validarNumEntero } from "../../../functions/functions";
//
import { LocalCitizensClass } from "../../ciudadanosLocales/ciudadanosLocales";


//Clase base
import User from "../user";
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
            throw new UserError("El campo DNI no existe", "BadRequest");
        }
        if (!validType(this.dni, 'number')) {//Validar que DNI sea de tipo number
            throw new UserError('El DNI no es un tipo de dato valido', "BadRequest");
        }
        if (!validarNumEntero(this.dni)) {//Validar que DNI sea de tipo entero y no decimal
            throw new UserError('El DNI incumple las condiciones de formato', "BadRequest")
        }
        if (!(this.dni >= 999999 && this.dni <= 99999999)) {//Validar que DNI sea de 7 o 8 digitos
            throw new UserError('El DNI incumple las condiciones de formato', "BadRequest")
        }
        if (await User.buscarPorProps('dni', this.dni)) {
            throw new UserError('El DNI de usuario ya existe', "Unauthorized")
        }
        if (this.telefono && !validType(this.telefono, 'number')) {
            throw new UserError('El Número de telefono no es un tipo de dato valido', "BadRequest");
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
            throw new UserError('Error al intentar guardar el nuevo usuario en la base de datos', "InternalServerError");
        }
    }



    //?VALIDAR QUE EXISTA UN CIUDADANO QUE COINCIDA CON LOS DATOS DEL lOCALUSER
    validateCitizen = async (): Promise<void> => {
        const data = { nombre: this.nombre, apellido: this.apellido, dni: this.dni }
        if (!await LocalCitizensClass.validateExistenceOfaCitizen(data)) {
            throw new UserError('Los datos no coinciden con ningún ciudadano', "BadRequest");
        }
    }

    //?REGISTRAR UN NUEVO USUARIO
    async registerLocalUser() {
        //Validar que todos los campos de User cumplan con sus condiciones de formato y más.
        await this.validateRegisterUser()
        //Validar que todos los campos de localUser cumplan con sus condiciones de formato y más.
        await this.validateLocalUser()
        //Validar que el usuario exista en la base de datos de ciudadanos.
        await this.validateCitizen()
        //?SE CAMBIA LA CONTRASEÑA INGRESADA DESEDE EL LADO DEL CLIENTE POR UNA CONTRASEÑA ENCRIPTADA
        await this.encriptarPsw()
        //Se guarda el documento.
        await this.guardarNuevoLocalUser()
    }



    //?LOGIN DE USUARIO
    static async loginLocalUser(nombreUser: string, password: string): Promise<ClientLocalUserType> {
        User.validarNombreUsuario(nombreUser)//valida el nombre de usuario, si no cumple con el formato de string genera error badrequest
        User.validarPassword(password)//valida la contraseña, si no cumple con el formato de string genera error badrequest
        const user = await User.buscarPorProps('nombreUsuario', nombreUser) as LocalUserType//retorna false si no existe el usuario, caso contrario lo trae
        if (!user) {
            throw new UserError('El campo nombreUsuario no existe', "BadRequest");
        }
        if (await User.compararPsw(user.password, password)) {//Comparar contraseña provista por el usuario desde el cliente con el de la base de datos
            const { _id, nombre, apellido, nombreUsuario, email, telefono, dni } = user
            return { _id, nombre, apellido, nombreUsuario, email, telefono, dni }
        }
        throw new UserError('Contraseña incorrecta', 'Unauthorized');
    }
}


