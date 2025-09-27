//Modelo localUser 
import { LocalUser } from "../../../models/usuario";
//Tipos de local user
import { LocalUserType, ClientLocalUserType } from "../../../types/users/localUsersTyp";
//Modulo de errores personalizados
import { UserError } from "../errors/userError";
//Función que permite validar el tipo de dato de una variable
import { validType, validarNumEntero } from "../../../functions/functions";
//
import { LocalCitizensClass } from "../../ciudadanosLocales/ciudadanosLocales";


/**
 * Clase que representa a un usuario local, heredando de la clase base User.
 * 
 * - `validateLocalUser()`: valida que los datos propios del usuario local cumplan con las condiciones de formato y unicidad.
 * - `guardarNuevoLocalUser()`: guarda un nuevo usuario local en la base de datos.
 * - `validateCitizen()`: comprueba que exista un ciudadano en el sistema que coincida con los datos del usuario local.
 * - `registerLocalUser()`: orquesta el proceso de registro, validando, encriptando la contraseña y guardando el nuevo usuario.
 * - `loginLocalUser()`: método estático que valida credenciales y retorna los datos del usuario en caso de login exitoso.
 */
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

    /**
     * Valida que los campos específicos de LocalUser cumplan con las condiciones necesarias.
     * - DNI debe existir, ser número entero y tener 7 u 8 dígitos.
     * - DNI debe ser único en la base de datos.
     * - Teléfono, si existe, debe ser numérico.
     */
    validateLocalUser = async () => {
        if (!this.dni) { // Validar que DNI esté definido
            throw new UserError("El campo DNI no existe", "BadRequest");
        }
        if (!validType(this.dni, 'number')) { // Validar tipo de dato
            throw new UserError('El DNI no es un tipo de dato valido', "BadRequest");
        }
        if (!validarNumEntero(this.dni)) { // Validar que sea entero
            throw new UserError('El DNI incumple las condiciones de formato', "BadRequest")
        }
        if (!(this.dni >= 999999 && this.dni <= 99999999)) { // Validar longitud (7 u 8 dígitos)
            throw new UserError('El DNI incumple las condiciones de formato', "BadRequest")
        }
        if (await User.buscarPorProps('dni', this.dni)) { // Validar que no exista ya en la BD
            throw new UserError('El DNI de usuario ya existe', "Unauthorized")
        }
        if (this.telefono && !validType(this.telefono, 'number')) { // Validar tipo de teléfono si existe
            throw new UserError('El Número de telefono no es un tipo de dato valido', "BadRequest");
        }
    }

    /**
     * Guarda un nuevo LocalUser en la base de datos, encapsulando la lógica de persistencia.
     * Lanza un error controlado en caso de fallo.
     */
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

    /**
     * Valida que exista un ciudadano registrado que coincida con los datos básicos
     * del LocalUser (nombre, apellido, DNI).
     */
    validateCitizen = async (): Promise<void> => {
        const data = { nombre: this.nombre, apellido: this.apellido, dni: this.dni }
        if (!await LocalCitizensClass.validateExistenceOfaCitizen(data)) {
            throw new UserError('Los datos no coinciden con ningún ciudadano', "BadRequest");
        }
    }

    /**
     * Registra un nuevo LocalUser en el sistema.
     * - Valida campos base de User.
     * - Valida campos específicos de LocalUser.
     * - Comprueba existencia de ciudadano asociado.
     * - Encripta la contraseña.
     * - Guarda el nuevo registro en la BD.
     */
    async registerLocalUser() {
        await this.validateRegisterUser()
        await this.validateLocalUser()
        await this.validateCitizen()
        await this.encriptarPsw()
        await this.guardarNuevoLocalUser()
    }

    /**
     * Método estático para autenticar a un LocalUser.
     * - Valida formato de nombre de usuario y contraseña.
     * - Busca al usuario por nombre de usuario.
     * - Compara la contraseña provista con la almacenada.
     * - Retorna datos esenciales del usuario si la autenticación es exitosa.
     */
    static async loginLocalUser(nombreUser: string, password: string): Promise<ClientLocalUserType> {
        User.validarNombreUsuario(nombreUser) // Validar formato de nombre de usuario
        User.validarPassword(password) // Validar formato de contraseña

        const user = await User.buscarPorProps('nombreUsuario', nombreUser) as LocalUserType // Buscar usuario
        if (!user) {
            throw new UserError('El campo nombreUsuario no existe', "BadRequest");
        }

        if (await User.compararPsw(user.password, password)) { // Comparar contraseñas
            const { _id, nombre, apellido, nombreUsuario, email, telefono, dni } = user
            return { _id, nombre, apellido, nombreUsuario, email, telefono, dni }
        }
        throw new UserError('Contraseña incorrecta', 'Unauthorized');
    }
}
