
import express, { json } from "express"
import registerRoutes from "./registerRoutes"
import loginRoutes from "./loginRoutes"


const { Router } = express
const localUserRoute = Router()


localUserRoute.use(json())
localUserRoute.use(express.urlencoded({ extended: true }))






localUserRoute.get("/prueba", (_, res) => {
    res.status(200).json({ ok: true })
})

localUserRoute.use("/", registerRoutes)
localUserRoute.use("/", loginRoutes)
export default localUserRoute  