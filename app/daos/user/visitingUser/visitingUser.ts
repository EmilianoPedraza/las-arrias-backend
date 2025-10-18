import { VisitingUser } from "../../../models/usuario";
import { UserError } from "../errors/userError";
import User from "../user";
import { VisitingUserType, ClientVisitingUserType } from '../../../types/users/visitingUsersTyp'
import { conectionRedis, UserRedis } from "../../../controllers/redisCacheManager";
import { Types } from 'mongoose'



export default class visitingUser extends User {
    private _id: Types.ObjectId
    constructor(
        nombre: string,
        apellido: string,
        nombreUsuario: string,
        email: string,
        password: string
    ) {
        {
            super(nombre, apellido, nombreUsuario, email, password)
        }
        this._id = new Types.ObjectId()
    }
    guardarNuevoVisitingUSser = async () => {
        try {
            const newUser = new VisitingUser({
                nombre: this.nombre,
                apellido: this.apellido,
                nombreUsuario: this.nombreUsuario,
                email: this.email,
                password: this.password
            })
            await newUser.save()
        } catch (error) {
            throw new UserError('Error al intentar guardar el nuevo usuario en la base de datos', "InternalServerError");
        }
    }
    //?REGISTRAR UN NUEVO USUARIO
    async registerVisitingUser() {
        //Validar que todos los campos de User cumplan con sus condiciones de formato y más
        await this.validateRegisterUser()
        //?SE CAMBIA LA CONTRASEÑA INGRESADA DESEDE EL LADO DEL CLIENTE POR UNA CONTRASEÑA ENCRIPTADA
        await this.encriptarPsw()
        const userForRedis = {
            _id: this._id,
            nombre: this.nombre,
            apellido: this.apellido,
            email: this.email,
            nombreUsuario: this.nombreUsuario,
            __t: 'VisitingUser'
        }
        await UserRedis.saveHashUser(userForRedis, conectionRedis)//se guarda como hash, para almacenar la mayoria de datos
        await UserRedis.saveSetUser(userForRedis, conectionRedis)//se guarda como set mas que todo para busquedas rapidas
        await this.guardarNuevoVisitingUSser()
    }



    //?LOGIN DE USUARIO
    static async loginVisitinUser(nombreUser: string, password: string): Promise<ClientVisitingUserType> {
        User.validarNombreUsuario(nombreUser)//valida el nombre de usuario, si no cumple con el formato de string genera error badrequest
        User.validarPassword(password)//valida la contraseña, si no cumple con el formato de string genera error badrequest
        const user = await User.buscarPorProps('nombreUsuario', nombreUser) as VisitingUserType//retorna false si no existe el usuario, caso contrario lo trae
        if (!user) {
            throw new UserError('El campo nombreUsuario no existe', "BadRequest");
        }
        if (await User.compararPsw(user.password, password)) {//Comparar contraseña provista por el usuario desde el cliente con el de la base de datos
            console.log(user)
            const { _id, nombre, apellido, nombreUsuario, email } = user
            return { _id, nombre, apellido, nombreUsuario, email }
        }
        throw new UserError('Contraseña incorrecta', 'Unauthorized');
    }
}

