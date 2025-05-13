import { VisitingUser } from "../../../models/usuario";
import { UserError } from "../errors/userError";
import User from "../user";

export default class visitingUser extends User {
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
        await this.guardarNuevoVisitingUSser()
    }

}