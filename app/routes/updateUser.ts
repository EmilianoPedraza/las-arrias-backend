import { Router, json, urlencoded } from 'express'
import { verifyAccessSuccessfulToken } from './auth/midlewares'
import { loadEnvironmentVars, environmentVars } from '../config/config'
import cookieParser from 'cookie-parser'
import { RequestConToken } from '../types/tokens/accessTyps'
import jsw from 'jsonwebtoken'
import User from '../daos/user/user'
import { UserError } from '../daos/user/errors/userError'

import { LocalUser } from '../models/usuario'

const userUpdate = Router()
loadEnvironmentVars()
const { SECRET_LOG_ACCES_TOKEN } = environmentVars()


userUpdate.use(json())
userUpdate.use(urlencoded({ extended: true }))
userUpdate.use(cookieParser(SECRET_LOG_ACCES_TOKEN))


//en el body se encuentran los datos nuevos a actualizar
userUpdate.put('/updateuser', verifyAccessSuccessfulToken, async (req, res) => {
    const token = (req as RequestConToken).userToken
    try {
        const data = jsw.decode(token) as { [key: string]: any }
        const { _id } = data
        const updateData = { ...req.body }
        await User.updateUser(_id, updateData, LocalUser)
        res.status(200).json({ ok: true })
    } catch (error) {
        if (error instanceof UserError) {
            res.status(error.status).json({ error: error.type, message: error.message })
            return
        }
        res.status(200).json({ ok: false, error: error })
    }
})


export default userUpdate