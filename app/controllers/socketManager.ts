
// import cookieParser from "cookie-parser";
import { UserRedis, conectionRedis } from "./redisCacheManager"
import { verifyAccessSuccessfulTokenSocket } from "../socket/midlewares"

import { Server, Namespace, DefaultEventsMap, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

class SocketManager {
    readonly socket: Server<DefaultEventsMap, DefaultEventsMap>;
    readonly publicSocket: Namespace<DefaultEventsMap, DefaultEventsMap>;
    readonly privateSocket: Namespace<DefaultEventsMap, DefaultEventsMap>;
    constructor(server: HTTPServer) {
        this.socket = new Server(server, {
            cors: {
                origin: "*",
                credentials: true,
            },
        });

        this.publicSocket = this.socket.of('/public');
        this.privateSocket = this.socket.of('/private');
        this.privateSocket.use(verifyAccessSuccessfulTokenSocket);
    }
}





class SocketUsersEvents {
    public static verifyUsernames(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        //es una coneccion habierta para verificar nombres de usuario, se utiliza para validaciones en tiempo real al registrar nuevos usuarios
        socket.on('client:searchUsername', async ({ username }: { username: string }) => {
            //falta validar caracteres que se ingresan
            console.log('Verificando nombre de usuario:', username)
            const searchResult = await UserRedis.searchKeySetUserRedis(conectionRedis, "nombreUsuario", username, 1)
            console.log('searchResult:', searchResult)
            socket.emit('server:searchUsernameRespose', (searchResult ? true : false))
        })
    }




    public static listUsers(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        //esta coneccion requerira de validacion de token para ser utulizada
        socket.on('client:searchListUsers', async (/*{ options: listUserOptions }*/) => {
            socket.emit('server:listUsernamesResponse', 'ok')
            // for (let key in listUserOptions) {
            // }
            // const searchResult = await UserRedis.searchStringsUserRedis(conectionRedis, "nombreUsuario", listUserOptions.name, cant)

        })
    }
}









//---------------------------------------------------------------------------------------------------

type ClientNewProyect = {
    creador: string,
    titulo: string,
    descripcion: string,
    imagenes: unknown, //a saber
    objetivos: string,
    ventajas: string,
}

type ClientDeleteProyect = {
    _id: string,
    titulo: string,
    creador: string
}


type ClientUpdateProyect = {
    _id: string,
    titulo: string,
    description: string,
    imagenes: unknown,
    objetivos: string,
    ventaja: string,
}

type ClientVoteProyect = {
    usuario: string, // _Id del usuario 
    proyecto: string, // _Id del proyecto
    tipo: 'positivo' | 'negativo'
    fecha: Date,
}
type ParamOn = {
    event: 'client:new-proyect' |
    'client:delete-proyect' |
    'client:update-proyect' |
    'client:vote-proyect',
    handles: ClientNewProyect | ClientDeleteProyect | ClientUpdateProyect | ClientVoteProyect
}
type ParamEmit = {
    event: 'server:search-proyect' | 'server:list-proyects',
    cant?: number,
    filter?: {
        _id?: string,
        titulo?: string,
        objetivos?: string,
        creadoEn?: Date
    }
}


class SocketProyectsEvents {
    readonly socket
    constructor(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        this.socket = socket
    }
    emit(options: ParamEmit) {
        console.log(options)

    }
    on(options: ParamOn) {
        console.log(options)
    }
}








export { SocketManager, SocketProyectsEvents, SocketUsersEvents }


