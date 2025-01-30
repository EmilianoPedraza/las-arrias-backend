import { Schema, model } from "mongoose";
//Subesquemas
import { horariosAtencionSchema } from "./subSchemas/horariosAtencion";
import { ofertasSchema } from "./subSchemas/ofertasSchema";


//* Esquema para los días de la semana con sus respectivos horarios de 
//* atención
const diasDeAtencionSchema = new Schema({
    lunes: horariosAtencionSchema,
    martes: horariosAtencionSchema,
    miercoles: horariosAtencionSchema,
    jueves: horariosAtencionSchema,
    viernes: horariosAtencionSchema,
    sabado: horariosAtencionSchema,
    domingo: horariosAtencionSchema,
});


//? Esquema base para "Negocio" o "Servicio", con información general
//? como propietario, nombre, ubicación, etc.
const NegocioOservicioSchema = new Schema({
    propietario: { type: Schema.Types.ObjectId, ref: 'LocalUser' },  // Referencia al propietario del negocio
    nombre: { type: String, required: true, unique: true },  // Nombre único del negocio
    descripcion: { type: String, required: true },  // Descripción del negocio
    ubicacion: { type: String, required: true },  // Ubicación física del negocio
    creadoEn: { type: Date, default: Date.now },  // Fecha de creación del registro
    actualizadoEn: { type: Date, default: Date.now },  // Fecha de última actualización
    ofertas: { type: [ofertasSchema], default: [] },  // Lista de ofertas disponibles
}, { discriminatorKey: "__t" });  // Discriminador para diferenciar entre tipo de negocio

//? Modelo general que utiliza el esquema base
const NegocioOservicio = model("NegocioOservicio", NegocioOservicioSchema);

//? Modelo específico para "Negocio", añadiendo horarios de atención
const Negocio = NegocioOservicioSchema.discriminator('Negocio', new Schema({
    horariosAtencion: diasDeAtencionSchema,  // Horarios de atención para cada día de la semana
}));

// Modelo específico para "Servicio", sin horarios de atención definidos por ahora
const Servicio = NegocioOservicio.discriminator('Servicio', new Schema({
    // Horarios de atención pueden agregarse más tarde
}));

export { NegocioOservicio, Negocio, Servicio };