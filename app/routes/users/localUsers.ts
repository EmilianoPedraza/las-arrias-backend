import express, { json } from "express"

import { ErrorTypes } from "../../types/typesError"
const { Router } = express
const localUserRoute = Router()



localUserRoute.use(json())
localUserRoute.use(express.urlencoded({ extended: true }))

localUserRoute.get('/profile', (req, res) => {
    const id = req.body.id
    try {
        if (id) {
            console.log('me ejecute')
            res.json({ status: 'ok', id })
            return
        }
        res.status(401).json({ error: ErrorTypes.Unauthorized })
    } catch (error) {
        res.status(500).json({ error: ErrorTypes.InternalServerError })
    }


})

export default localUserRoute