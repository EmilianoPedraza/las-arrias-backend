import { loadEnvironmentVars, environmentVars } from "../../config/config";

import { UserError } from "./errors/userError" // Clase de error personalizada extendida
import bcrypt from "bcrypt" // Para encriptar contraseñas
import { validType, validarStringConExpresion } from "../../functions/functions" // Funciones de validación
import { User as UserModel } from "../../models/usuario"; // Se renombra 'User' a 'UserModel' para evitar conflictos

import { ClientUserType, UserType, CacheCallBack } from "../../types/users/userTyp";

// import RedisCacheManager from "../../controllers/redisCacheManager";

import { UserRedis, conectionRedis } from "../../controllers/redisCacheManager";
import { validateEmail } from "../../functions/functions";

// Carga las variables de entorno 
loadEnvironmentVars()
const { FIRST_AND_LASTNAME, VALID_USERNAME, VALID_PASSWORD, VALID_EMAIL } = environmentVars()

/**
 * Clase base User que representa a un usuario del sistema.
 * 
 * Métodos principales:
 * - `buscarPorProps()`: busca usuarios en la BD por propiedad.
 * - `encriptarPsw()`: encripta la contraseña del usuario antes de guardarla.
 * - `compararPsw()`: compara contraseñas en texto plano con contraseñas encriptadas.
 * - `validarNombre()`, `validarApellido()`, `validarNombreUsuario()`, `validarEmail()`, `validarPassword()`: validan campos individuales según condiciones de formato y reglas de negocio.
 * - `validateRegisterUser()`: valida todos los campos del usuario antes de registrarlo en la BD.
 * - `login()`: valida credenciales de acceso y retorna el usuario autenticado.
 * - `saveCacheHash()`: genera un hash del nombre de usuario y lo envía a través de un callback (ej. para almacenamiento en Redis).
 */
export default class User {
    constructor(
        public nombre: string,
        public apellido: string,
        public nombreUsuario: string,
        public email: string,
        public password: string,
    ) { }

    /**
     * Busca un usuario en la base de datos de mongo por una propiedad específica.
     * @param prop - Propiedad a buscar (ej: 'email', 'nombreUsuario').
     * @param valor - Valor asociado a la propiedad.
     * @returns El usuario encontrado o `false` si no existe.
     */
    static buscarPorProps = async (prop: string, valor: string | number): Promise<object | false> => {
        const usuario = await UserModel.find({ [prop]: valor }).lean()
        if (usuario.length > 0) {
            return usuario[0]
        }
        return false
    }

    /**
     * Encripta la contraseña del usuario utilizando bcrypt.
     * Reemplaza la contraseña original con la encriptada.
     */
    encriptarPsw = async (): Promise<true | never> => {
        try {
            const newPsw = await bcrypt.hash(this.password, 10)
            this.password = newPsw
            return true
        } catch (error) {
            throw new UserError('Hubo un problema en la base de datos', "InternalServerError");
        }
    }

    /**
     * Compara una contraseña encriptada con una en texto plano.
     * @param pswEncr - Contraseña encriptada almacenada.
     * @param psw - Contraseña en texto plano provista por el usuario.
     * @returns `true` si coinciden, de lo contrario `false`.
     */
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

    /**
     * Valida que el nombre cumpla con las condiciones de formato.
     * Lanza un error si el valor es inválido.
     */
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

    /**
     * Valida que el apellido cumpla con las condiciones de formato.
     */
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

    /**
     * Valida que el nombre de usuario cumpla con las condiciones de formato.
     */
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

    /**
     * Valida que el email cumpla con las condiciones de formato y sea válido.
     */
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

    /**
     * Valida que el password cumpla con las condiciones de formato y seguridad.
     */
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

    /**
     * Valida todos los campos de un usuario antes de ser registrado en la BD.
     * - Nombre
     * - Apellido
     * - Nombre de usuario (único)
     * - Email (único)
     * - Contraseña (formato y longitud)
     */
    async validateRegisterUser() {
        User.validarNombre(this.nombre)
        User.validarApellido(this.apellido)
        User.validarNombreUsuario(this.nombreUsuario)
        //! Aquí se verifica que el nombre de usuario no exista ya en redis ⬇⬇
        const searchUserNmRedis = await UserRedis.searchStringsUserRedis(conectionRedis, 'nombreUsuario', this.nombreUsuario, 1)
        console.log(__dirname, '\n', searchUserNmRedis)

        //Esto es para verificar en mongo si existe el nombre de usuario
        // const searchUserNmMongo = await User.buscarPorProps('nombreUsuario', this.nombreUsuario)

        if (searchUserNmRedis) {
            throw new UserError('El nombre de usuario ya existe en la base de datos', "Unauthorized")
        }
        User.validarEmail(this.email)
        if (await User.buscarPorProps('email', this.email)) {
            throw new UserError('El email ya existe en la base de datos', "Unauthorized")
        }
        User.validarPassword(this.password)
        if (this.password.length < 7) {
            throw new UserError('Longitud de password insuficiente', "BadRequest")
        }
    }

    /**
     * Autentica a un usuario mediante nombre de usuario y contraseña.
     * @returns El usuario autenticado si las credenciales son correctas.
     */
    static async login(nombreUser: string, password: string): Promise<UserType> {
        User.validarNombreUsuario(nombreUser)
        User.validarPassword(password)
        const user = await User.buscarPorProps('nombreUsuario', nombreUser) as ClientUserType
        if (!user) {
            throw new UserError('El campo nombreUsuario no existe', "BadRequest");
        }
        if (await User.compararPsw(user.password, password)) {
            return user
        }
        throw new UserError('Contraseña incorrecta', 'Unauthorized');
    }



    /**
     * 
     * @param password 
     */
    static async deleteUser(password: string, _id: string): Promise<void> {
        User.validarPassword(password)
        //busco en mongo el usuario
        const user = await User.buscarPorProps('_id', _id) as ClientUserType
        console.log(user)
        if (user) {
            this.compararPsw(user.password as string, password)
            //* await conectionRedis.deleteInRedis('usernames', XXH.h32(user.nombreUsuario, seed).toString(16))
            await UserModel.deleteOne({ _id })
        }
    }
}
