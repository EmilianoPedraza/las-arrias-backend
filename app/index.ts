
import express from "express";
//Coneccion a mongoAtlas
import { connectDb } from "./config/connectDb";

//Routes
import localUserRoute from "./routes/users/localUsers/localUsers";
import visitinUserRoute from "./routes/users/visitingUsers/visitingUsers";


const app = express()

//Conectar a mongo atlas
connectDb()



//levantamiento del servidor
const PORT: number = 8080
const server = app.listen(PORT, () => {
    const port = server.address()

    console.log("Servidor conectado en puerto:", port)
})

server.on("error", error => {
    console.error("Error al intentar levantar el servidor:\n", error)
})

app.use("/localUser/", localUserRoute)
app.use("/visitingUser/", visitinUserRoute)