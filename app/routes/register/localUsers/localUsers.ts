
import express, { json } from "express"
import registerRoutes from "./registerRoutes"


const { Router } = express
const localUserRoute = Router()


localUserRoute.use(json())
localUserRoute.use(express.urlencoded({ extended: true }))






localUserRoute.get("/prueba", (_, res) => {
    res.status(200).json({ ok: true })
})

localUserRoute.use("/", registerRoutes)
export default localUserRoute  