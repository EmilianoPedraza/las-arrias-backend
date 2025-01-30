import rutaMongoUsers from "../vars";//!temporal, solo para desarrollo
import mongoose from "mongoose";


const connectDb = async()=>{
    try {
        const conn = await mongoose.connect(rutaMongoUsers as string)
        console.log(`connectDb-MongoDb-cluster-conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`connectDb-MongoDb-cluster-ERROR:\n${error}`);
    }
}

export {connectDb}
