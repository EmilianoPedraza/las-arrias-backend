//clase
import { LocalCitizensClass } from "../../controllers/ciudadanosLocales/ciudadanosLocales"

//tipos
import { LocalCitizens } from '../../types/typeUser'
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

localCitizensRoutes.post('/agregar', async (req, res) => {
    try {
        await LocalCitizensClass.createNewLocalCitizens(req.body as LocalCitizens[])
        res.status(200).json({ ok: true })
        return
    } catch (error) {
        res.status(500).json({ ok: false, error: error })
    }
})
export default localCitizensRoutes