import mongoose from "mongoose";
import { createClient } from "redis";



//----------------para UserRedis
import XXH from 'xxhashjs' // Librería para generar hash

class RedisCacheManager {
    readonly client
    constructor() {
        this.client = createClient({
            url: 'redis://las_arrias_redis_service_dev:6379'
        })
    }

    async connectIfRequired(): Promise<void> {
        if (!this.client.isOpen || !this.client.isReady) {
            await this.client.connect()
            console.log('Conectado a Redis exitosamente')
            return
        }
        console.log('Ya estaba conectado a Redis')
    }
    //realiza la conexión a redis si es no se realizo
    async connectRedis(): Promise<true | false> {
        try {
            await this.connectIfRequired()
            return true
        } catch (error) {
            console.log('Error al intentar al ejecutar connectRedis\n', error)
            return false
        }
    }
}
export const conectionRedis = new RedisCacheManager()// instancia que se va a usar en el proyecto




//esquema original
type UserRedisType = {
    _id: mongoose.Types.ObjectId,
    email: string,
    nombreUsuario: string,
    nombre: string,
    apellido: string,
    __t: string
}
const seed = 0xABCD // Semilla para el hash
export class UserRedis {
    static hashFormation(stringForHash: string): string { return XXH.h32(stringForHash, seed).toString(16) }

    //guardados

    /**
     * Almacena los datos completos de un usuario en Redis utilizando una estructura de tipo Hash.
     * Cada usuario se guarda bajo una clave única (`user:<_id>`) y sus propiedades 
     * se almacenan como campos dentro del hash.
     * @param user - Objeto del tipo UserRedisType que contiene los datos del usuario.
     * @param server - Instancia del gestor de conexión a Redis (RedisCacheManager).
     */
    static async saveHashUser(user: UserRedisType, server: RedisCacheManager) {
        try {
            await server.connectRedis()//conecto a redis
            const { _id, email, __t, nombre, apellido, nombreUsuario } = user
            await server.client.hSet(`user:${_id}`, { email, __t, nombre, apellido, nombreUsuario })
        } catch (error) {
            console.log('UserRedis-saveHashUser', error)
        }
    }





    /**
     * Guarda la información de un usuario en Redis utilizando conjuntos (sets),
     * donde cada campo relevante del usuario se serializa y se asocia a su _id.
     *
     * @param user - Objeto con los datos del usuario (UserRedisType).
     * @param server - Instancia del gestor de conexión a Redis (RedisCacheManager).
     */
    static async saveSetUser(user: UserRedisType, server: RedisCacheManager) {
        try {
            await server.connectRedis()//conecto a redis
            const { nombreUsuario, nombre, apellido, _id } = user
            //    Serialización + hashing de cada campo.
            //    Se crea una "clave" (key) única para Redis que representa cada campo del usuario,
            //    aplicando un hash al valor original. Esto evita exponer datos sensibles o repetidos.
            //    El formato final es: "campo:hash(valor)"
            const serial_nombre = `nombre:${UserRedis.hashFormation(nombre)}`
            const serial_apellido = `apellido:${UserRedis.hashFormation(apellido)}`
            const serial_nombreUsuario = `nombreUsuario:${UserRedis.hashFormation(nombreUsuario)}`
            //almacenamiento en redis 
            await server.client
                .multi()//crea una cola de comandos que se enviarán a Redis en una sola operación.
                .sAdd(serial_nombre, `${_id}`)
                .sAdd(serial_apellido, `${_id}`)
                .sAdd(serial_nombreUsuario, `${_id}`)
                .exec()//envía todos los comandos juntos al servidor Redis.

            //    Resultado: El usuario queda indexado en Redis por sus campos principales (nombre, apellido, nombreUsuario)
            //    usando sets para permitir búsquedas inversas (por ejemplo, obtener todos los usuarios con cierto nombre).
        } catch (error) {
            console.log('UserRedis-saveSetUser:', error)
        }
    }

    //busquedas

    /**
     * Busca claves en Redis que coincidan con un patrón de campo y valor hasheado.
     * Este método utiliza el comando `SCAN` para recorrer las claves del servidor Redis 
     * de forma incremental y no bloqueante, buscando coincidencias con el patrón 
     * `{campo}:{hash}`. 
     * Es útil cuando no se conoce el valor exacto de la clave, pero sí el tipo de campo 
     * (por ejemplo, `nombre`, `apellido`, `nombreUsuario`) y el valor original 
     * antes de ser hasheado.
     * @param {RedisCacheManager} server - Instancia del manejador Redis encargado de la conexión.
     * @param {'nombre' | 'apellido' | 'nombreUsuario'} campo - Campo base del patrón de búsqueda.
     * @param {string} value - Valor original a buscar (será hasheado antes de comparar).
     * @param {number} max - Límite máximo de claves a devolver.
     * @returns {Promise<string[] | false>} - Devuelve un arreglo con las claves encontradas que coinciden 
     * con el patrón, o un arreglo vacío si no se encuentra ninguna coincidencia o hay un error,
     *  o si no hay coincidencias un false.
     */
    static async searchStringsUserRedis(server: RedisCacheManager, campo: 'nombre' | 'apellido' | 'nombreUsuario', value: string, max: number): Promise<string[] | false> {
        try {
            await server.connectRedis()// Asegura que la conexión con Redis esté activa antes de buscar
            const hashValue = UserRedis.hashFormation(value)// Hashea el valor de búsqueda para mantener coherencia con cómo se almacenan los datos
            const toSearch = `${campo}:${hashValue}`// Forma el patrón de búsqueda, por ejemplo: "nombre:HASH" o "apellido:HASH"
            let cursor: number | string = 0 // Inicializa el cursor en 0 (como exige SCAN en Redis)

            // Bucle de escaneo: recorre Redis en “páginas” hasta encontrar lo que busca o llegar al final
            do {
                // SCAN recorre claves parcialmente, evitando bloquear Redis como haría KEYS
                const res = await server.client.scan(String(cursor), { MATCH: toSearch, COUNT: 100 })
                // Actualiza el cursor con el valor devuelto; si es "0", significa que ya terminó el recorrido
                cursor = res.cursor
                // Si encontró más claves que el límite establecido, las devuelve inmediatamente
                if (res.keys.length > max) {
                    return res.keys
                }

                // Mientras el cursor no vuelva a 0, sigue recorriendo Redis
            } while (Number(cursor) != 0);
            return false
        } catch (error) {
            // Si ocurre algún error, se muestra en consola y se devuelve un arreglo vacío
            console.log('UserRedis-searchStringsUserRedis:', error)
            return false
        }
    }



    /**
     * Recupera la información completa de un usuario almacenada como Hash en Redis.
     * 
     * Este método accede a la estructura `Hash` asociada al usuario cuyo `_id` se 
     * pasa como parámetro. El hash se espera que esté guardado bajo la clave 
     * con formato `user:{_id}` y contenga campos como `email`, `nombre`, 
     * `apellido`, `nombreUsuario`, entre otros.
     * 
     * @param {string} _id - Identificador único del usuario (coincide con el usado en la base de datos).
     * @param {RedisCacheManager} server - Instancia del manejador Redis que administra la conexión y operaciones.
     * 
     * @returns {Promise<Record<string, string> | false>} 
     * Devuelve un objeto con los pares clave-valor del hash (por ejemplo, `{ nombre: 'Juan', apellido: 'Pérez', ... }`).
     * Si ocurre un error, devuelve `false`.
     */
    static async searchHashUserRedis(_id: string, server: RedisCacheManager): Promise<Record<string, string> | false> {
        try {
            await server.client.connect()
            const res = await server.client.hGetAll(`user:${_id}`)
            return res
        } catch (error) {
            console.log('UserRedis-searchHashUserRedis:', error)
            return false
        }
    }

}












