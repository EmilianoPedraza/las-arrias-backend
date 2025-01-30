import {Schema, model} from "mongoose"

const votoSchema = new Schema({
    usuario: {type: Schema.Types.ObjectId, ref:"LocalUser", required:true},
    proyecto: {type: Schema.Types.ObjectId, ref:"Proyect", required:true},
    tipo:{type:String, enum:['positivo', 'negativo'], required:true},
    fecha: { type: Date, default: Date.now },
})

export const Voto = model('Voto', votoSchema)