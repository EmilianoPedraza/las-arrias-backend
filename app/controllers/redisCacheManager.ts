import mongoose from "mongoose";
import { createClient } from "redis";
import { normalizarString } from "../functions/functions"


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


type UserRedisUpdateType = {
    nombreUsuario?: string,
    nombre?: string,
    apellido?: string,
    email?: string,
    __t?: string
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
    static async saveSetUser(user: UserRedisType, server: RedisCacheManager) {//*-------------------
        try {
            await server.connectRedis()//conecto a redis
            const { nombreUsuario, nombre: no, apellido: ap, _id } = user
            const nombre = normalizarString(no)//*serailizacion-todo mayuscula
            const apellido = normalizarString(ap)//*serailizacion-todo mayuscula
            //    Serialización + hashing de cada campo.
            //    Se crea una "clave" (key) única para Redis que representa cada campo del usuario,
            //    aplicando un hash al valor original. Esto evita exponer datos sensibles o repetidos.
            //    El formato final es: "campo:hash(valor)"
            const serial_nombre = `nombre:${UserRedis.hashFormation(nombre)}:${UserRedis.hashFormation(`${_id}`)}`
            const serial_apellido = `apellido:${UserRedis.hashFormation(apellido)}:${UserRedis.hashFormation(`${_id}`)}`
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
     * El metodo realiza el hasheo en caso de ser necesario de forma automatica.
     * @param {RedisCacheManager} server - Instancia del manejador Redis encargado de la conexión.
     * @param {'nombre' | 'apellido' | 'nombreUsuario'} campo - Campo base del patrón de búsqueda.
     * @param {string} value - Valor original a buscar (será hasheado antes de comparar).
     * @param {number} max - Límite máximo de claves a devolver.
     * @returns {Promise<string[] | false>} - Devuelve un arreglo con las claves encontradas que coinciden 
     * con el patrón, o un arreglo vacío si no se encuentra ninguna coincidencia o hay un error,
     *  o si no hay coincidencias un false.
     */
    static async searchKeySetUserRedis(server: RedisCacheManager, campo: 'nombre' | 'apellido' | 'nombreUsuario', value: string, max: number): Promise<string[] | false> {
        try {
            await server.connectRedis()// Asegura que la conexión con Redis esté activa antes de buscar
            const value_ = campo === 'nombre' || campo === 'apellido' ? normalizarString(value) : value //*normalizo o no dependiendo del campo
            const hashValue = UserRedis.hashFormation(value_)// Hashea el valor de búsqueda para mantener coherencia con cómo se almacenan los datos
            const toSearch = `${campo}:${hashValue}*`// Forma el patrón de búsqueda, por ejemplo: "nombre:HASH" o "apellido:HASH"
            let cursor: number | string = 0 // Inicializa el cursor en 0 (como exige SCAN en Redis)
            let response: string[] = []
            //? COUNT proporcional al max, limitado a un máximo razonable (p. ej. 1000)
            const count = Math.min(
                Math.max(Math.ceil(max * 2), 10), // al menos 10, al máximo 1000
                1000
            )
            // Bucle de escaneo: recorre Redis en “páginas” hasta encontrar lo que busca o llegar al final
            do {
                // SCAN recorre claves parcialmente, evitando bloquear Redis como haría KEYS
                const res = await server.client.scan(String(cursor), { MATCH: toSearch, COUNT: count })
                // Actualiza el cursor con el valor devuelto; si es "0", significa que ya terminó el recorrido
                cursor = res.cursor
                // Agrega las claves encontradas
                response.push(...res.keys);
                // Si encontró más claves que el límite establecido, las devuelve inmediatamente
                if (response.length >= max) {
                    response = response.slice(0, max);
                    break
                }
                // Mientras el cursor no vuelva a 0, sigue recorriendo Redis
            } while (Number(cursor) != 0);
            if (response && response.length >= 1) return response;
            return false
        } catch (error) {
            // Si ocurre algún error, se muestra en consola y se devuelve un arreglo vacío
            console.log('UserRedis-deleteKeyInRedis:', error)
            return false
        }
    }


    static async getValueKeyString(key: string, server: RedisCacheManager) {
        const res = await server.client.get(key)
        return res ? res : false
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
            await server.connectRedis()
            const res = await server.client.hGetAll(`user:${_id}`)
            return res
        } catch (error) {
            console.log('UserRedis-searchHashUserRedis:', error)
            return false
        }
    }




    static async deleteKeyInRedis(_id: string, server: RedisCacheManager) {
        await server.connectRedis()
        try {
            if (_id) {
                const serialId = UserRedis.hashFormation(_id)
                //!si se pasa solo id se busca en redis, se obtiene nombre y todo lo demas de redis, y con eso se eliminan demas keys
                const res = await server.client.hGetAll(`user:${_id}`)


                const serialLastName = UserRedis.hashFormation(
                    normalizarString(res.apellido)//*normalizacion del apellido y luego se hashea
                )
                const serialName = UserRedis.hashFormation(
                    normalizarString(res.nombre)//*normalizacion del nombre y luego se hashea
                )
                const serialUserName = UserRedis.hashFormation(res.nombreUsuario)//*solo se hashea

                await server.client.del(`nombre:${serialName}:${serialId}`)//?Se eliminan en cadenas
                await server.client.del(`apellido:${serialLastName}:${serialId}`)//?Se eliminan en cadenas
                await server.client.del(`nombreUsuario:${serialUserName}`)//?Se eliminan en cadenas
                await server.client.del(`user:${_id}`)//?Se elimina en hashes
            }
            return false

        } catch (error) {
            console.log('UserRedis-deleteKeyInRedis:', error)
            return false
        }
    }


    /**
     * Actualiza los datos de un usuario almacenado en Redis.
     * 
     * Este método se utiliza para sincronizar cambios en los datos de un usuario que ya existe en el sistema.
     * Realiza una actualización sobre los campos internos del Hash del usuario (`user:{_id}`), y además,
     * actualiza las claves relacionadas (como nombre, apellido o nombreUsuario) que funcionan como índices secundarios
     * para búsquedas rápidas dentro de Redis.
     * 
     * Flujo general:
     * 1. Conecta al servidor Redis (si no está conectado).
     * 2. Genera un hash único del `_id` del usuario.
     * 3. Busca el hash actual del usuario en Redis.
     * 4. Si no se encuentra, detiene la ejecución (evita sobreescribir datos inexistentes).
     * 5. Itera sobre las propiedades que deben actualizarse:
     *    - Actualiza el campo dentro del Hash (`HSET`).
     *    - Si el campo es `nombre`, `apellido` o `nombreUsuario`, actualiza las claves asociadas con `RENAME`,
     *      garantizando consistencia en los índices secundarios.
     * 
     * En resumen, este método mantiene sincronizados los datos del usuario en Redis sin perder las referencias
     * necesarias para búsquedas y acceso rápido.
     * 
     * @param _id ID del usuario (ObjectId de MongoDB)
     * @param user Objeto con los campos a actualizar (UserRedisUpdateType)
     * @param server Instancia del manejador de caché (RedisCacheManager)
     * @returns true | false
     */
    static async updateDataUser(_id: mongoose.Types.ObjectId, user: UserRedisUpdateType, server: RedisCacheManager): Promise<boolean> {
        try {
            await server.connectRedis()
            const hash_id = UserRedis.hashFormation(`${_id}`)
            if (user && _id) {
                const oldUserHash = await UserRedis.searchHashUserRedis(`${_id}`, server)
                //? Si no se encontró el hash en Redis, salir para evitar indexar 'false'
                if (!oldUserHash) {
                    return false
                }


                //?modificacion en set
                const props = Object.keys(user) as (keyof UserRedisUpdateType)[]//props en array 
                for (const prop of props) {
                    const newVal = user[prop];

                    await server.client.hSet(`user:${_id}`, `${prop}`, `${newVal}`);//?modifica en hashes


                    if (prop === 'apellido' || prop === 'nombre') {
                        const oldKey = `${prop}:${UserRedis.hashFormation(
                            normalizarString(oldUserHash[prop]))
                            }:${hash_id}`
                        const newKey = `${prop}:${UserRedis.hashFormation(
                            normalizarString(newVal as string)//*normalizacion del nuevo nombre o apellido
                        )}:${hash_id}`
                        //* eliminar del set viejo y agregar al nuevo
                        await server.client.rename(oldKey, newKey)
                    }
                    else if (prop === 'nombreUsuario') {
                        const oldKey = `nombreUsuario:${UserRedis.hashFormation(oldUserHash[prop])}`
                        const newKey = `nombreUsuario:${UserRedis.hashFormation(newVal as string)}`
                        await server.client.rename(oldKey, newKey)
                    }
                }
                return true
            }
            return false
        } catch (error) {
            console.log('UserRedis-UpdateDataUser:', error)
            return false
        }
    }
}




/*
Para buscar podria
1-buscar de forma directa en usernames sin normalización.








 */






