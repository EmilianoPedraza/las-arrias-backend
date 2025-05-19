import { Request, Response, NextFunction, Router } from "express";



//MANEJO DE TOKENS JWT
import jsw from "jsonwebtoken";

//IMPORTACIONES, TIPOS, PROCEESOS Y VARIABLES
import { loadEnvironmentVars, environmentVars } from "../config/config"

// import { UserError } from "../controllers/user/errors/userError";

// import { UserType } from "../types/typeUser"



//* CARGA LAS VARIABLES DE ENTORNO DESDE EL ARCHIVO `.ENV`
loadEnvironmentVars()
const { SECRET_VALID_USER } = environmentVars()

const acceesRoute = Router()


type TokenJsw = { _id: string, __t: string }



//* EXTENSIÓN DE LA INTERFAZ REQUEST PARA INCLUIR LA PROPIEDAD `USER`
declare global {
    namespace Express {
        interface Request {
            userTokenVerificado?: TokenJsw;
            userToken: string
        }
    }
}



//? RUTA DE PRUEBA PROTEGIDA CON VERIFICACIÓN DE TOKEN
// Middleware que verifica la validez del token
// Si es válido, agrega el usuario al request
const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.signedCookies?.acces_token;
    if (!token) {
        res.status(401).json({ error: 'token no encontrado: usuario invalido' });
        return;
    }
    try {
        jsw.verify(token, SECRET_VALID_USER as string);
        req.userToken = token;

        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
        return;
    }
};


//? RUTA PROTEGIDA DE ACCESO RESTRINGIDO
// Ruta protegida GET /protegido
// Solo accesible si el token es válido
acceesRoute.get("/acces", verifyToken, (req, res) => {
    const decoded = jsw.decode(req.userToken);
    console.log(decoded)// en teoria deberia mostrar los datos cifrados que le pase, pero muestra null
    res.status(200).json({
        ok: true,
        message: "Acceso permitido"
    });
});


export default acceesRoute