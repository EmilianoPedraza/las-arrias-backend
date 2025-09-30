import { createClient } from "redis";

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

    async saveInRedis(key: string, argument: string): Promise<void> {
        try {
            await this.client.sAdd(key, argument)
        } catch (error) {
            console.log(`Error al intentar guardar\nkey:${key}\nargument:${argument}`)
        }
    }

    async searchInRedis(key: string, argument: string): Promise<boolean | void> {
        try {
            const res = await this.client.sIsMember(key, argument)
            return res === 1 ? true : false
        } catch (err) {
            console.log(`Error al intentar busccar\nkey:${key}\nargument:${argument}`)
        }
    }
}

const conectionRedis = new RedisCacheManager()
export default conectionRedis