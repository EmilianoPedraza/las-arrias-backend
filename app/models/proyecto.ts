import {Schema, model} from "mongoose"


const proyectsSchema = new Schema({
    titulo: {type:String, required:true},
    descripcion:{type:String, required:true},
    creador: {type: String, required:true, ref:'LocalUser'},

    imagenes:{type:[String], validate:{
        //Definimos arr: string[] explícitamente para que TypeScript entienda que arr es un array de strings.
        validator:(array:[string])=>array.length > 1 && array.length < 7,
        //Agregamos un message personalizado, que se mostrará si la validación falla.
        message: 'Debe incluir al menos 2 imagenes y como maximo 6 imagenes'
    }},

    objetivos: {type:String, required:true},
    ventajas: {type:String, required:true},
    votos: [{ type: Schema.Types.ObjectId, ref: "Voto" }], // Referencias a los votos
    estado:{type:String, enum:['pendiente', 'aprobado', 'rechazado'], default:'pendiente'},
    creadoEn: { type: Date, default: Date.now },
    actualizadoEn: { type: Date, default: Date.now },

})


export const  Proyect = model('Proyect', proyectsSchema)