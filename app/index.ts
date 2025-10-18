import express from "express";
import cors from "cors"
// Rutas para operaciones de administración de ciudadanos locales y usuarios administradores
import localCitizensRoutes from "./routes/admin/LocalCitizens"
import adminUserRoute from "./routes/admin/admin";

// Conexión a la base de datos MongoDB Atlas
import connectionMongo from "./controllers/mongoDbManager";

// Configuraciones de entorno y entorno actual (desarrollo o producción)
import { loadEnvironmentVars, environmentVars, isDev } from "./config/config";

// Rutas de registro para usuarios locales y visitantes
import localUserRoute from "./routes/register/localUsers/localUsers";
import visitinUserRoute from "./routes/register/visitingUsers/visitingUsers";

// Rutas de login, logout, verificación de tokens y validaciones de usuario
import login from "./routes/login/login";
//* import acceesRoute from "./routes/accesToken";
import logout from "./routes/logout"
import userChecks from "./routes/userChecks";

//!
// Para implementar socket Io
// import { Server } from "socket.io"
// import { createServer } from "http"



// import test from "./testing/mookUsersRoute"; //*solo pruebas
import deleteUserRoute from "./routes/deleteUser"; //! Falta que elimine ambos tokens, no solo uno
//!



export const app = express()
//Creacion de servidor HTTP
// const httpServer = createServer(app)
// const io = new Server(httpServer)

// Establecer conexión con la base de datos MongoDB Atlas: internamente ya se asegura de cargar las variables de entorno
connectionMongo.connectIfRequired()
// Inicializar variables de entorno
loadEnvironmentVars()
const { PORT, ORIGINS, METHODS, ALLOWEDHEADERS, CREDENTIALS } = environmentVars()

// Inicio del servidor en el puerto especificado
const server = app.listen(PORT, () => {
    const port = server.address()

    console.log("Servidor conectado en puerto:", port)
})

server.on("error", error => {
    console.error("Error al intentar levantar el servidor:\n", error)
})


// Middleware de desarrollo: mide el tiempo de respuesta de cada solicitud HTTP
if (isDev) {
    try {
        const responseTime = require('response-time');
        app.use(responseTime());
    } catch (error) {
        console.log("No se ejecuto middleware response-time")
    }
}

// Configuración del middleware CORS para control de acceso entre dominios
app.use(cors({
    origin: ORIGINS,
    methods: METHODS,
    allowedHeaders: ALLOWEDHEADERS,
    credentials: CREDENTIALS,
    //   exposedHeaders: ...,
    //   optionsSuccessStatus: ...,
    //   preflightContinue: ...,
}))


//?Rutas base para autenticación y sesión
app.get("/prueba", (_, res) => {
    res.json({ message: "La API! está en línea y funcionando correctamente." })
})
app.use("/", logout)
app.use("/", login)

// Registro de usuarios locales y visitantes
app.use("/localUser/", localUserRoute)
app.use("/visitingUser/", visitinUserRoute)

// Validación de existencia de nombre de usuario //!(en etapa de pruebas y en desarrollo aún)
app.use("/check", userChecks)

// Rutas exclusivas para administración //!(en etapa de pruebas y en desarrollo aún)
app.use('/admin', adminUserRoute)

// Rutas para operaciones de administración y validación de ciudadanos locales //!(en etapa de pruebas y en desarrollo aún)
app.use('/admin', localCitizensRoutes)

//Ruta para eliminar usuario
app.use('/', deleteUserRoute)


// //!
// app.use('/test', test)
// //!