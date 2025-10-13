import { Server } from "socket.io"
import http from "http"
import { app } from '../index'
import { UserType } from "../types/users/userTyp"

class SocketManager {
    readonly httpServer: http.Server
    readonly socket
    constructor() {
        this.httpServer = http.createServer(app)
        this.socket = new Server(this.httpServer)
    }
}







class SocketUsersEvents {
    readonly user
    constructor(user: UserType, socket: Server) {
        this.user = user
    }
    public static verifyUsernames(socket: Server) {
        socket.on('client:searchUsernames', (data) => {
            // Handle the searchUsernames event here
            socket.emit('server:searchUsernamesRespose', () => {
            })
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
    constructor(socket: Server) {
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


