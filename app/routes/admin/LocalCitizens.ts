import { UserError } from "../../daos/user/errors/userError"

//clase
import { LocalCitizensClass, ErrorCreateNewLocalCitizens } from "../../daos/ciudadanosLocales/ciudadanosLocales"
//tipos
import { LocalCitizens } from '../../types/users/userTyp'
//middleware de validacion de administradores
import { verifyAccesTokenAdminGeneral } from "../auth/midlewares"
//!
import User from "../../daos/user/user"
//route
import { json, Router, urlencoded, Request, Response, NextFunction } from "express"
const localCitizensRoutes = Router()

//!
const { validarApellido, validarNombre } = User




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












const validCitizen = async (req: Request, res: Response, next: NextFunction) => {
    const { nombre: n, apellido: a, dni: d } = req.body
    try {
        validarNombre(n)
        validarApellido(a)
        await LocalCitizensClass.valydDni(d)
        if (!await LocalCitizensClass.validateExistenceOfaCitizen(req.body)) {
            throw new UserError('Los datos no coinciden con ningún ciudadano', "BadRequest");
        }
        next()
    } catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        //en caso de que no sea ningún error de clase extendida
        res.status(500).send({ error: "InternalError", message: "Ocurrio un error en la base de datos" })

    }

}

localCitizensRoutes.post('/validCitizen', validCitizen, async (_, res) => {
    res.status(200).json({ ok: true })
})
export default localCitizensRoutes