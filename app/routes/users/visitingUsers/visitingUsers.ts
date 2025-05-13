import express, { json } from "express"


const { Router } = express
const visitinUserRoute = Router()

visitinUserRoute.use(json())
visitinUserRoute.use(express.urlencoded({ extended: true }))




visitinUserRoute.get("/prueba", (_, res) => {
    res.status(200).json({ ok: true })
})


export default visitinUserRoute