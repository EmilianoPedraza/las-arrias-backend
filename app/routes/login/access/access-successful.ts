import { Router } from "express";
import jsw from "jsonwebtoken"
import cookieParser from "cookie-parser";
import COOKIES_LOG_OPTIONS from "../configCookies/configCookies";
import User from "../../../daos/user/user";
import { createToken } from "../functions/functions";
import { loadEnvironmentVars, environmentVars } from "../../../config/config";
import { verifyAccesToken } from "../../auth/midlewares";
import { UserType } from "../../../types/users/userTyp";
import { RequestConToken, AccesToken, UserAuthorizations } from "../../../types/tokens/accessTyps";


loadEnvironmentVars()
const { SECRET_LOG_ACCES_USER_TOKEN } = environmentVars()
const loginAccescSuccessful = Router()
loginAccescSuccessful.use(cookieParser(SECRET_LOG_ACCES_USER_TOKEN))




const setPermissions = (user: UserType): UserAuthorizations | any => {
    const localUserAuthorizations = {
        createProjects: true,
        getProyects: true,
        getBusiness: true,
        getServices: true,
        createBusiness: true,
        createService: true,
        configData: true,
    }
    const visitingUserAuthorizations = {
        createProjects: false,
        getProyects: false,
        getBusiness: true,
        getServices: true,
        createBusiness: false,
        createService: false,
        configData: true,
    }
    try {
        let user_authorizations = {}
        const u = { _id: user._id, __t: user.__t }
        if (user.__t === 'VisitingUser') {
            user_authorizations = { ...u, ...visitingUserAuthorizations }
        }
        if (user.__t === 'LocalUser') {
            user_authorizations = { ...u, ...localUserAuthorizations }
        }
        return user_authorizations as UserAuthorizations
    } catch (error) {
        console.log(error)
    }
}





loginAccescSuccessful.post('/access-successful', verifyAccesToken, async (req, res) => {
    const { userToken } = (req as RequestConToken)
    try {
        const dateToken = jsw.decode(userToken)
        const user = await User.buscarPorProps('_id', (dateToken as AccesToken)._id)
        if (typeof user !== 'boolean') {
            const accessSuccessful = setPermissions(user as UserType)
            const token = createToken(accessSuccessful, SECRET_LOG_ACCES_USER_TOKEN as string)
            res.status(200).cookie('access_successful', token, COOKIES_LOG_OPTIONS).json({ ok: true })
        }
    } catch (error) {
        res.status(500).json({ error: "InternalError", message: "Ocurrio un error en la base de datos" })
    }
})


export default loginAccescSuccessful