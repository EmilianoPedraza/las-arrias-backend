import { loadEnvironmentVars, environmentVars } from "./config";
import mongoose from "mongoose";



loadEnvironmentVars()
const { MONGO } = environmentVars()




const connectDb = async () => {
    try {
        const rut = MONGO
        const conn = await mongoose.connect(rut as string)
        console.log(`connectDb-MongoDb-cluster-conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`connectDb-MongoDb-cluster-ERROR:\n${error}`);
    }
}


export { connectDb }
