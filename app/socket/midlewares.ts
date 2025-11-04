import { loadEnvironmentVars, environmentVars } from "../config/config";
import { Socket, DefaultEventsMap, ExtendedError } from "socket.io"
import { ReqSocket, RequestConToken } from "../types/tokens/accessTyps";

import jsw from "jsonwebtoken"



loadEnvironmentVars()
const { SECRET_LOG_ACCES_USER_TOKEN } = environmentVars()







const verifyAccessSuccessfulTokenSocket = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, next: (err?: ExtendedError) => void): void => {
    try {
        const req = socket.request as ReqSocket;
        const token = req.signedCookies?.accessSuccessful;
        if (!token) {
            return next(new Error("Token ausente"))
        }
        const decoded = jsw.verify(token, SECRET_LOG_ACCES_USER_TOKEN as string);
        (req as RequestConToken).userToken = token;
        console.log(decoded)
        next();
    } catch (error) {
        console.error("Error validando JWT en socket private:", error)
        next(new Error("Token inválido o expirado"))
    }
}

export { verifyAccessSuccessfulTokenSocket }