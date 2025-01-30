import { Schema } from "mongoose";

//* Tipo de hora: formato "HH:MM-HH:MM" o 'cerrado'
type Hora = `${string}:${string}-${string}:${string}` | 'cerrado'

//* Función de validación para asegurarse que el formato del horario sea válido
const validHs = (hs: Hora): boolean => {
    const regex = /^(\d{2}:\d{2})-(\d{2}:\d{2})$|^cerrado$/;
    return regex.test(hs);
}

//* Esquema para horarios de atención, que incluye mañana, tarde y noche
export const horariosAtencionSchema = new Schema({
    mañana: { type: String, validate: { validator: validHs, message: "Horario de mañana mal ingresado" } },
    tarde: { type: String, validate: { validator: validHs, message: "Horario de tarde mal ingresado" } },
    noche: { type: String, required: false, validate: { validator: validHs, message: "Horario de noche mal ingresado" } }
});

