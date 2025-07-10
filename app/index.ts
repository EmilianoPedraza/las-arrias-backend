import express from "express";
import cors from "cors"
//!PRUEBA
import localCitizensRoutes from "./routes/admin/LocalCitizens"
import adminUserRoute from "./routes/admin/admin";
//!-------
//Coneccion a mongoAtlas
import { connectDb } from "./config/connectDb";
import { loadEnvironmentVars, environmentVars } from "./config/config";

//Routes
import localUserRoute from "./routes/register/localUsers/localUsers";
import visitinUserRoute from "./routes/register/visitingUsers/visitingUsers";
import login from "./routes/login/login";
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

//solo de prueba
app.use("/", acceesRoute)


app.use("/localUser/", localUserRoute)
app.use("/visitingUser/", visitinUserRoute)

//!PUREBA
app.use('/admin', localCitizensRoutes)
app.use('/admin', adminUserRoute)
//!