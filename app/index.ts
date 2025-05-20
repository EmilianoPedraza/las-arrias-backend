import express from "express";
import cors from "cors"

//Coneccion a mongoAtlas
import { connectDb } from "./config/connectDb";
import { loadEnvironmentVars, environmentVars } from "./config/config";

//Routes
import localUserRoute from "./routes/users/localUsers/localUsers";
import visitinUserRoute from "./routes/users/visitingUsers/visitingUsers";
import login from "./routes/login"
import acceesRoute from "./routes/accesToken";
import logout from "./routes/logout"

const app = express()

//Conectar a mongo atlas
connectDb()


loadEnvironmentVars()
const { PORT, ORIGINS, METHODS, ALLOWEDHEADERS, CREDENTIALS } = environmentVars()



//levantamiento del servidor
const server = app.listen(PORT, () => {
    const port = server.address()

    console.log("Servidor conectado en puerto:", port)
})

server.on("error", error => {
    console.error("Error al intentar levantar el servidor:\n", error)
})


app.use(cors({
    origin: ORIGINS,
    methods: METHODS,
    allowedHeaders: ALLOWEDHEADERS,
    credentials: CREDENTIALS,
    //   exposedHeaders: ...,
    //   optionsSuccessStatus: ...,
    //   preflightContinue: ...,
}))

app.use("/", logout)
app.use("/", login)
app.use("/", acceesRoute)
app.use("/localUser/", localUserRoute)
app.use("/visitingUser/", visitinUserRoute)