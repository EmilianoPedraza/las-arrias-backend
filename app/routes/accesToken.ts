import { Router } from "express";
import { RequestConToken, verifyAccesToken, verifyAccessSuccessfulToken } from "./auth/midlewares";

//MANEJO DE TOKENS JWT
import jsw from "jsonwebtoken";


//* CARGA LAS VARIABLES DE ENTORNO DESDE EL ARCHIVO `.ENV`


const acceesRoute = Router()


acceesRoute.get("/access", verifyAccesToken, (req, res) => {
    const token = (req as RequestConToken).userToken;
    const decoded = jsw.decode(token);

    console.log(decoded);
    res.status(200).json({
        ok: true,
        message: "Acceso permitido"
    });
});


acceesRoute.get("/access-successful", verifyAccessSuccessfulToken, (req, res) => {
    const token = (req as RequestConToken).userToken;
    const decoded = jsw.decode(token);

    console.log(decoded);
    res.status(200).json({
        ok: true,
        message: "Acceso permitido"
    });
});
export default acceesRoute