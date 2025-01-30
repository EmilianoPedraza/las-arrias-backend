import { Schema, model } from "mongoose";

// Tipo de hora: formato "HH:MM-HH:MM" o 'cerrado'
type Hora = `${string}:${string}-${string}:${string}` | 'cerrado'

// Función de validación para asegurarse que el formato del horario sea válido
const validHs = (hs: Hora): boolean => {
    const regex = /^(\d{2}:\d{2})-(\d{2}:\d{2})$|^cerrado$/;
    return regex.test(hs);
}

// Esquema para horarios de atención, que incluye mañana, tarde y noche
const horariosAtencionSchema = new Schema({
    mañana: { type: String, validate: { validator: validHs, message: "Horario de mañana mal ingresado" } },
    tarde: { type: String, validate: { validator: validHs, message: "Horario de tarde mal ingresado" } },
    noche: { type: String, required: false, validate: { validator: validHs, message: "Horario de noche mal ingresado" } }
});

// Esquema para ofertas, con descripción y fechas de inicio y fin
const ofertasSchema = new Schema({
    descripcion: { type: String, required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
});

// Esquema para los días de la semana con sus respectivos horarios de atención
const diasDeAtencionSchema = new Schema({
    lunes: horariosAtencionSchema,
    martes: horariosAtencionSchema,
    miercoles: horariosAtencionSchema,
    jueves: horariosAtencionSchema,
    viernes: horariosAtencionSchema,
    sabado: horariosAtencionSchema,
    domingo: horariosAtencionSchema,
});

//? Esquema base para "Negocio" o "Servicio", con información general como propietario, nombre, ubicación, etc.
const NegocioOservicioSchema = new Schema({
    propietario: { type: Schema.Types.ObjectId, ref: 'LocalUser' },  // Referencia al propietario del negocio
    nombre: { type: String, required: true, unique: true },  // Nombre único del negocio
    descripcion: { type: String, required: true },  // Descripción del negocio
    ubicacion: { type: String, required: true },  // Ubicación física del negocio
    creadoEn: { type: Date, default: Date.now },  // Fecha de creación del registro
    actualizadoEn: { type: Date, default: Date.now },  // Fecha de última actualización
    ofertas: { type: [ofertasSchema], default: [] },  // Lista de ofertas disponibles
}, { discriminatorKey: "__t" });  // Discriminador para diferenciar entre tipo de negocio

// Modelo general que utiliza el esquema base
const NegocioOservicio = model("NegocioOservicio", NegocioOservicioSchema);

// Modelo específico para "Negocio", añadiendo horarios de atención
const Negocio = NegocioOservicioSchema.discriminator('Negocio', new Schema({
    horariosAtencion: diasDeAtencionSchema,  // Horarios de atención para cada día de la semana
}));

// Modelo específico para "Servicio", sin horarios de atención definidos por ahora
const Servicio = NegocioOservicio.discriminator('Servicio', new Schema({
    // Horarios de atención pueden agregarse más tarde
}));

export { NegocioOservicio, Negocio, Servicio };