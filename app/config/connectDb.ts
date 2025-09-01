import { loadEnvironmentVars, environmentVars, isDev } from "./config";

import mongoose from "mongoose";


//para redis

// import { createClient } from "redis";

loadEnvironmentVars()
const { MONGO_CLOUSER_LA, MONGO_COMPAS_DB_LA } = environmentVars()

const connectDb = async () => {
    try {
        const rut = isDev ? MONGO_COMPAS_DB_LA : MONGO_CLOUSER_LA

        const conn = await mongoose.connect(rut as string)
        console.log(`connectDb-MongoDb-cluster-conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`connectDb-MongoDb-cluster-ERROR:\n${error}`);
    }
}


// const conectRedis = async () => {
//     return createClient({
//         url: 'redis://localhost:6379',
//     })
// }

export { connectDb, /*conectRedis*/ }
