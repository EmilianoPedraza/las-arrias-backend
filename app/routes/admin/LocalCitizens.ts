import { UserError } from "../../controllers/user/errors/userError"

//clase
import { LocalCitizensClass } from "../../controllers/ciudadanosLocales/ciudadanosLocales"
//middleware de validacion de administradores
import { verifyAccesTokenAdminGeneral } from "../auth/midlewares"

//tipos
import { LocalCitizens } from '../../types/typeUser'
import { ErrorCreateNewLocalCitizens } from '../../controllers/ciudadanosLocales/ciudadanosLocales'
//route
import express from "express"
const { json, Router, urlencoded } = express
const localCitizensRoutes = Router()

localCitizensRoutes.use(json())
localCitizensRoutes.use(urlencoded({ extended: true }))


localCitizensRoutes.get('/prueba', (_, res) => {
    console.log('ok')
    res.send('ok')
})

localCitizensRoutes.post('/agregarCiudadanos', verifyAccesTokenAdminGeneral, async (req, res) => {
    try {
        await LocalCitizensClass.createNewLocalCitizens(req.body as LocalCitizens[])
        res.status(200).json({ ok: true })
        return
    } catch (error) {
        const resError = LocalCitizensClass.errorCreateNewLocalCitizens(error as ErrorCreateNewLocalCitizens)
        res.status(500).json({ ok: false, error: resError })
    }
})



localCitizensRoutes.post('/addCitizen', verifyAccesTokenAdminGeneral, async (req, res) => {
    try {
        await LocalCitizensClass.oneAddCitizens(req.body)
        res.status(200).json({
            ok: true
        })
    } catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        //en caso de que no sea ningún error de clase extendida
        res.status(500).send({ error: "InternalError", message: "Ocurrio un error en la base de datos" })
    }
})
export default localCitizensRoutes