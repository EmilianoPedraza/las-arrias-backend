
// import cookieParser from "cookie-parser";
import { environmentVars, loadEnvironmentVars } from "../config/config";
import { UserRedis, conectionRedis } from "./redisCacheManager"
import { verifyAccessSuccessfulTokenSocket } from "../socket/midlewares"
import { Server, Namespace, DefaultEventsMap, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

loadEnvironmentVars()
const { ORIGINS, ALLOWEDHEADERS } = environmentVars()


class SocketManager {
    readonly socket: Server<DefaultEventsMap, DefaultEventsMap>;
    readonly publicSocket: Namespace<DefaultEventsMap, DefaultEventsMap>;
    readonly privateSocket: Namespace<DefaultEventsMap, DefaultEventsMap>;
    constructor(server: HTTPServer) {
        this.socket = new Server(server, {
            cors: {
                origin: [ORIGINS || ''],
                credentials: true,
                allowedHeaders: ALLOWEDHEADERS,
                methods: ['GET', 'POST']
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
            console.log('client:searchUsername - username:', username)
            const searchResult = await UserRedis.searchKeySetUserRedis(conectionRedis, "nombreUsuario", username, 1)
            console.log('searchResult:', searchResult)
            socket.emit('server:searchUsernameRespose', (searchResult ? true : false))
        })
    }


    /**
     * Escucha un evento del cliente para buscar usuarios por nombre y devuelve sus IDs asociados.
     * 
     * Este método se ejecuta dentro del contexto de una conexión WebSocket.
     * Al recibir el evento `client:searchListUsers`, busca en Redis las claves que coincidan
     * con el nombre de usuario proporcionado, obtiene sus valores y devuelve un array con los IDs encontrados.
     * 
     * @param socket - Instancia del socket del cliente conectada al servidor.
     * 
     * @returns void - No retorna un valor directo, pero emite un evento con los resultados al cliente.
     */
    public static listUsers(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        socket.on('client:searchListUsers', async ({ username }: { username: string }): Promise<void> => {
            // Log informativo para verificar el nombre de usuario recibido desde el cliente.
            console.log('Verificando nombre de usuario:', username)
            // Llama a un método auxiliar que busca claves en Redis cuyo nombre contenga el valor recibido.
            // searchKeySetUserRedis devuelve un array de claves (strings) que coinciden con el patrón.
            // Parámetros:
            //  - conectionRedis → instancia del cliente Redis.
            //  - "nombreUsuario" → parte fija del patrón de búsqueda.
            //  - username → término de búsqueda ingresado por el usuario.
            //  - 5 → límite máximo de coincidencias a devolver.
            const searchResult = await UserRedis.searchKeySetUserRedis(conectionRedis, "nombreUsuario", username, 5)
            // Inicializa el array que contendrá los IDs de los usuarios encontrados.
            let result: string[] = []
            // Verifica que existan resultados válidos antes de continuar.
            if (searchResult && searchResult.length > 0) {
                // Itera secuencialmente sobre cada clave encontrada.
                // Se usa for...of en lugar de forEach porque permite usar await correctamente.
                for (const key of searchResult) {
                    try {
                        // Obtiene el valor asociado a la clave actual desde Redis.
                        // getValueKeyString debería retornar el valor (ID del usuario) o null si no existe.
                        const userId = await UserRedis.getValueKeyString(key, conectionRedis);
                        if (userId) result = [...userId];
                    } catch (error) {
                        console.log('SocketUserEvents-listUsers():', error)
                    }
                }
            }
            // Una vez finalizada la iteración, se envía el resultado al cliente
            // mediante un evento personalizado del servidor.
            socket.emit('server:listUsernamesResponse', result);
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


