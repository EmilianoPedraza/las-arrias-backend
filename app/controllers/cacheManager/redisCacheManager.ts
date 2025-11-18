
import { createClient } from "redis";
import { loadEnvironmentVars, environmentVars } from "../../config/config";
loadEnvironmentVars()
const { REDIS_HOST } = environmentVars()

export class RedisCacheManager {
    readonly client
    constructor() {
        this.client = createClient({
            url: REDIS_HOST
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



