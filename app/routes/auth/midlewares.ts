import { loadEnvironmentVars, environmentVars } from "../../config/config";
import { Request, Response, NextFunction } from "express";

import jsw from "jsonwebtoken"



loadEnvironmentVars()
const { SECRET_LOG_ACCES_TOKEN, SECRET_LOG_ACCES_USER_TOKEN, SECRET_LOG_ADMIN_USER } = environmentVars()

export type AccesToken = { _id: string, __t: string }
export interface RequestConToken extends Request {
    userTokenVerificado?: AccesToken;
    userToken: string;
}



/**
 * Middleware para verificar el token firmado `access_token_admin_general` en las cookies.
 * 
 * - Si el token existe y es válido, se guarda en `req.userToken` y se continúa al siguiente middleware.
 * - Si no existe o es inválido, devuelve un error 401 (No autorizado).
 * 
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 * @param next Función para pasar al siguiente middleware.
 * @returns Respuesta con error 401 si no hay token válido.
 */
const verifyAccesTokenAdminGeneral = (req: Request, res: Response, next: NextFunction) => {
    const token = req.signedCookies?.access_token_admin_general;
    if (!token) {
        res.status(401).json({ error: 'token no encontrado: usuario invalido' });
        return;
    }
    try {
        jsw.verify(token, SECRET_LOG_ADMIN_USER as string);
        (req as RequestConToken).userToken = token;
        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
        return;
    }
};






/**
 * Middleware para validar el token firmado `access_token` en las cookies.
 * 
 * - Verifica si el token existe y es válido.
 * - Si es válido, se agrega `userToken` al objeto `req`.
 * - Si no existe o es inválido, devuelve un error 401 (No autorizado).
 * 
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 * @param next Función para pasar al siguiente middleware.
 * @returns Respuesta con error 401 si no hay token válido.
 */
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




/**
 * Middleware para verificar el token firmado `access_successful` en las cookies.
 * 
 * - Valida si el token existe y es correcto.
 * - Si es válido, se guarda en `req.userToken` y se continúa al siguiente middleware.
 * - Si no existe o está vencido, devuelve un error 401 (No autorizado).
 * 
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 * @param next Función para pasar al siguiente middleware.
 * @returns Respuesta con error 401 si no hay token válido.
 */
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


export { verifyAccesToken, verifyAccessSuccessfulToken, verifyAccesTokenAdminGeneral }