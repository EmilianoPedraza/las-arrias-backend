import { loadEnvironmentVars, environmentVars } from "../../config/config";
import { Request, Response, NextFunction } from "express";

import jsw from "jsonwebtoken"



loadEnvironmentVars()
const { SECRET_LOG_ACCES_TOKEN, SECRET_LOG_ACCES_USER_TOKEN } = environmentVars()

export type AccesToken = { _id: string, __t: string }
export interface RequestConToken extends Request {
    userTokenVerificado?: AccesToken;
    userToken: string;
}







// Middleware que verifica la validez del token acces_token
// Si es válido, agrega el usuario al request
const verifyAccesToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.signedCookies?.access_token;
    if (!token) {
        res.status(401).json({ error: 'token no encontrado: usuario invalido' });
        return;
    }
    try {
        jsw.verify(token, SECRET_LOG_ACCES_TOKEN as string);
        (req as RequestConToken).userToken = token;
        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
        return;
    }
};


const verifyAccessSuccessfulToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.signedCookies?.access_successful;
    if (!token) {
        res.status(401).json({ error: 'token no encontrado: usuario invalido' });
        return;
    }
    try {
        jsw.verify(token, SECRET_LOG_ACCES_USER_TOKEN as string);
        (req as RequestConToken).userToken = token;

        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
        return;
    }
}


export { verifyAccesToken, verifyAccessSuccessfulToken }