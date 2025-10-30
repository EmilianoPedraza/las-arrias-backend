import { Server, Socket, DefaultEventsMap } from "socket.io"
import http from "http"
import { app } from '../index'
// import { UserType } from "../types/users/userTyp"
import { UserRedis, conectionRedis } from "./redisCacheManager"



type SocketTypeParam = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
class SocketManager {
    readonly httpServer: http.Server
    readonly socket
    constructor() {
        this.httpServer = http.createServer(app)
        this.socket = new Server(this.httpServer)
    }
}





class SocketUsersEvents {
    public static verifyUsernames(socket: SocketTypeParam) {
        //es una coneccion habierta para verificar nombres de usuario, se utiliza para validaciones en tiempo real al registrar nuevos usuarios
        socket.on('client:searchUsername', async ({ username }: { username: string }) => {
            //falta validar caracteres que se ingresan
            console.log('Verificando nombre de usuario:', username)
            const searchResult = await UserRedis.searchKeySetUserRedis(conectionRedis, "nombreUsuario", username, 1)
            console.log('searchResult:', searchResult)
            socket.emit('server:searchUsernameRespose', (searchResult ? true : false))
        })
    }




    public static listUsers(socket: SocketTypeParam) {
        //esta coneccion requerira de validacion de token para ser utulizada
        socket.on('client:searchListUsers', async (/*{ options: listUserOptions }*/) => {
            socket.emit('server:listUsernamesResponse', 'ok')
            // for (let key in listUserOptions) {


            // }
            // const searchResult = await UserRedis.searchStringsUserRedis(conectionRedis, "nombreUsuario", listUserOptions.name, cant)

        })
    }
}






const dataopen = () => {
    console.log("Iniciando servicio de WebSockets dataopen...")
    //sockets
    const socketServer = new SocketManager()//coneccion
    const { socket: so } = socketServer
    // Iniciar el servidor en el puerto 8080
    socketServer.httpServer.listen(8030, () => {
        console.log('Servidor WebSocket escuchando en http://localhost:8080')
    })
    so.on('connection', async (socket) => {
        console.log('Nuevo cliente conectado:', socket.id)
        await SocketUsersEvents.verifyUsernames(socket)
        // SocketUsersEvents.listUsers(socket)
    })


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
    constructor(socket: SocketTypeParam) {
        this.socket = socket
    }
    emit(options: ParamEmit) {
        console.log(options)

    }
    on(options: ParamOn) {
        console.log(options)
    }
}








export { SocketManager, SocketProyectsEvents, /*SocketUsersEvents,*/ dataopen }


