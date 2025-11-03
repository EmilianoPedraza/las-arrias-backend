import { Request } from "express";
import { UserType } from "../users/userTyp";

//actualmente implementado en access-successful.ts
export type AccesToken = { _id: string, __t: string }


export interface ReqSocket {
    // cookies firmadas (cuando usas cookie-parser('<secret>'))
    signedCookies?: {
        accessSuccessful?: string; // aquí guarda el JWT
        [key: string]: string | undefined;
    };
}



export type UserAuthorizations = {
    createProjects: boolean
    getProyects: boolean
    getBusiness: boolean
    getServices: boolean
    createBusiness: boolean
    createService: boolean
    configData: boolean,
} & AccesToken


//actualmente implementado en middlewares.ts
export interface RequestConToken extends Request {
    // userTokenVerificado?: AccesToken;
    userToken: string;
}
//implementado en access.ts
export interface RequestUserType {
    userReqClient?: UserType
}
