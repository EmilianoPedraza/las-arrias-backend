import mongoose from "mongoose"
import { loadEnvironmentVars, environmentVars, isDev } from "../config/config";


loadEnvironmentVars()
const { MONGO } = environmentVars()


class MongoDbManager {
    readonly connect
    constructor() {
        this.connect = this.connectIfRequired()
    }
    async connectIfRequired(): Promise<boolean | mongoose.Mongoose> {
        try {
            const status = mongoose.connection.readyState;

            if (status === 2) {
                console.log("La conexión está en proceso de apertura.");
                return false;
            }

            if (status === 1) {
                console.log("Ya existe una conexión activa.");
                return true;
            }

            if (status === 0 || status === 3) {
                const conn = isDev ? await mongoose.connect(MONGO as string) : await mongoose.connect(MONGO as string, {
                    tls: true,
                    tlsAllowInvalidCertificates: isDev ? false : true,
                });
                console.log(`Mongo conectado: ${conn.connection.host}`);
                return conn;
            }

            return false;
        } catch (err) {
            console.error("Error al conectar con MongoDB:", err);
            throw err;
        }
    }
}

const conectionMongo = new MongoDbManager()

export default conectionMongo