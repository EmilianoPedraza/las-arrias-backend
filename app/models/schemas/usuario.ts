import {model, Schema} from "mongoose"



//? schema con datos en común de los 2 roles de usuario
// El discriminator es una forma de tener todos los usuarios en una misma colección,
//una manera organizada y escalable de manejar múltiples tipos de usuario.
/*
Ventajas de usar Discriminator:
Reutilización del esquema base sin duplicar código.
Misma colección en MongoDB, más fácil de gestionar.
filtros más eficientes, podés buscar todos los usuarios con
*/
const userBaseScrema = new Schema({
    nombre: {type:String, required:true},
    apellido:{type:String, required:true},
    nombreUsuario:{type:String, required:true, unique:true},
    email:{type:String, required:true,unique:true,match: /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook)\.(com|es|org)$/},
    password:{type:String, required:true},
    creadoEn: { type: Date, default: Date.now },
    actualizadoEn: { type: Date, default: Date.now },
},{discriminatorKey:"__t"}) 


//?Modelo base
const User = model('User', userBaseScrema)


//*Modelo de esquema de usuario visitante
const VisitingUser = User.discriminator('VisitingUser', new Schema({}))

//*Modelo de esquema de usuario local
const LocalUser = User.discriminator('LocalUser',
     new Schema({
        dni: { type: Number, required: true, unique: true },
        contribuciones: { type: Number, default: 0 }})
)


export {LocalUser, VisitingUser, User}


