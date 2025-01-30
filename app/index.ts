import express from "express";
//Routes
import localUserRoute from "./routes/users/localUsers";

const app = express()

const PORT:number = 8080


//*SE LEVANTA EL SERVIDOR
const server = app.listen(PORT, ()=>{
    const port = server.address()
    
    console.log("Servidor conectado en puerto:", port)
})

server.on("error", error=>{
    console.error("Error al intentar levantar el servidor:\n", error)
})


// //?SOLO PARA PRUEBAS
// //se pone guin para ignorar un parametro(tamíen podía ser "_req")
// app.get('/prueba', (_req, res)=>{
//     res.send('Funciono correctamente')
// })
// // console.log("Hola mundo")


app.use("/", localUserRoute)