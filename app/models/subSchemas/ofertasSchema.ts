import { Schema } from "mongoose";

//* Esquema para ofertas, con descripción y fechas de inicio y fin
export const ofertasSchema = new Schema({
    descripcion: { type: String, required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
});

