
//!SOLO PARA PRUEBAS USAMOS ESTE SECRET
// Importaciones y tipos
import { ClientLocalUserType } from "../../../types/typesLocalUser";
import { SECRET_VALID_USER } from "../../../enums/expresions";
import express, { json, Request, Response, NextFunction } from "express";

//
import cookieParser from 'cookie-parser';
//Tipos de errores
import { UserError } from "../../../controllers/user/errors/userError"
//controladores
import localUser from "../../../controllers/user/localUser/localUser"
//jsonwebtoken
import jsw from "jsonwebtoken"




const { Router } = express
const loginUser = Router()


loginUser.use(json())
loginUser.use(express.urlencoded({ extended: true }))


//!SOLO POR EL MOMENTO
// Se agrega cookie-parser como middleware
loginUser.use(cookieParser(SECRET_VALID_USER.secret));


const createToken = (user: ClientLocalUserType): string => {
    const token = jsw.sign({ user }, SECRET_VALID_USER.secret, { expiresIn: '1h' })
    return token
}
// Extend the Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: ClientLocalUserType;
        }
    }
}




//?PARA VALIDAR INGRESO DE USUARIOS
//Middleware
const validarCredenciales = async (req: Request, res: Response, next: NextFunction) => {
    const { nombreUsuario, password } = req.body;
    try {
        const user = await localUser.loginLocalUser(nombreUsuario, password);
        req.user = user;
        next();
    } catch (err) {
        if (err instanceof UserError) {
            res.status(err.status).json({ error: err.type, message: err.message })
            return
        }
        res.status(500).json({ error: "InternalError", message: "Ocurrió un error inesperado" });
    }

};
//Ruta
loginUser.post('/login', validarCredenciales, async (req, res) => {
    try {
        const user = req.user
        const token = createToken(user as ClientLocalUserType)
        res.status(200)
            .cookie("acces_token", token, {
                httpOnly: true,//la coookie solo se puede acceder en el servidor
                // secure: true,//la cokki solo se puede acceder en https
                //sameSite: "strict",// la cookie solo se puede acceder en el mismo dominio
                signed: true, // 🔒 importante si queremos validar firmas
                maxAge: 60 * 60 * 1000 // 1 hora
            })
            .json({ ok: true })
    } catch (err) {
        res.status(500).send({ error: "InternalError", message: "Ocurrio un error en la base de datos" })
    }
})


//?PARA ELIMINAR TOKEN

loginUser.post("/logout", (_, res) => {
    res.clearCookie("acces_token", {
        httpOnly: true,//la coookie solo se puede acceder en el servidor
        //secure: false,//la cokki solo se puede acceder en https
        signed: true,
        //sameSite: "strict",// la cookie solo se puede acceder en el mismo dominio
        //httpOnly: true,//la coookie solo se puede acceder en el servidor
        //secure: true,//la cokki solo se puede acceder en https
        //sameSite: "strict",// la cookie solo se puede acceder en el mismo dominio
    })

    res.json({ message: "Sesión cerrada, token eliminado correctamente" });
})


//?PRUEBA UTILIZANDO RUTA PROTEGIDA

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.signedCookies?.acces_token;
    if (!token) {
        res.status(401).json({ error: 'token no encontrado: usuario invalido' });
        return;
    }
    try {
        const userPayload = jsw.verify(token, SECRET_VALID_USER.secret);
        req.user = userPayload as ClientLocalUserType;
        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
        return;
    }
};


loginUser.get("/protegido", verifyToken, (_, res) => {
    res.status(200).json({
        ok: true,
        message: "Acceso permitido"
    });
});

export default loginUser