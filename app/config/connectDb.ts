import { loadEnvironmentVars, environmentVars, isDev } from "./config";

import mongoose from "mongoose";

loadEnvironmentVars()
const { MONGO_CLOUSER_LA } = environmentVars()


const MONGO_COMPAS_DB_LA = "mongodb://localhost:27017/Las-Arrias-Web-Server"

const connectDb = async () => {
    try {
        const rut = !isDev ? MONGO_COMPAS_DB_LA : MONGO_CLOUSER_LA

        const conn = await mongoose.connect(rut as string)
        console.log(`connectDb-MongoDb-cluster-conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`connectDb-MongoDb-cluster-ERROR:\n${error}`);
    }
}

export { connectDb }
