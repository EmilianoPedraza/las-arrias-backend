import { Router, urlencoded, json } from "express";
import User from "../daos/user/user";
import cookieParser from "cookie-parser"
import { loadEnvironmentVars, environmentVars } from "../config/config";
import { verifyAccessSuccessfulToken } from "./auth/midlewares";
import { RequestConToken } from "../types/tokens/accessTyps";
import jsw from 'jsonwebtoken'
loadEnvironmentVars()
const { SECRET_LOG_ACCES_TOKEN } = environmentVars()


const deleteUserRoute = Router()


//* MIDDLEWARE PARA PARSEAR JSON Y DATOS DE FORMULARIOS
deleteUserRoute.use(json())
deleteUserRoute.use(urlencoded({ extended: true }))
deleteUserRoute.use(cookieParser(SECRET_LOG_ACCES_TOKEN))

deleteUserRoute.delete("/deleteuser", verifyAccessSuccessfulToken, (req, res) => {
    const password = req.body.password;
    const token = (req as RequestConToken).userToken
    if (password && token) {
        const data = jsw.decode(token) as { [key: string]: any }
        User.deleteUser(password as string, data._id)
        res.status(200).clearCookie('access_successful').clearCookie('access_token').json({ ok: true })
    }

})


export default deleteUserRoute