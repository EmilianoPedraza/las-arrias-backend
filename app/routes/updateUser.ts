import { Router, json, urlencoded } from 'express'
import { verifyAccessSuccessfulToken } from './auth/midlewares'
import { loadEnvironmentVars, environmentVars } from '../config/config'
import cookieParser from 'cookie-parser'
import { RequestConToken } from '../types/tokens/accessTyps'
import jsw from 'jsonwebtoken'
import User from '../daos/user/user'

import { LocalUser } from '../models/usuario'

const userUpdate = Router()
loadEnvironmentVars()
const { SECRET_LOG_ACCES_TOKEN } = environmentVars()


userUpdate.use(json())
userUpdate.use(urlencoded({ extended: true }))
userUpdate.use(cookieParser(SECRET_LOG_ACCES_TOKEN))


//en el body se encuentran los datos nuevos a actualizar
userUpdate.put('/updateuser', verifyAccessSuccessfulToken, (req, res) => {
    const token = (req as RequestConToken).userToken
    const data = jsw.decode(token) as { [key: string]: any }
    const { _id } = data
    const updateData = { ...req.body }
    User.updateUser(_id, updateData, LocalUser)
    res.send('ok')
})


export default userUpdate