import { loadEnvironmentVars, environmentVars } from "../config/config"
import { model, Schema } from "mongoose"


loadEnvironmentVars()
const { FIRST_AND_LASTNAME } = environmentVars()


const validNameAndLastName = new RegExp(FIRST_AND_LASTNAME as string)

const administratorUsersShema = new Schema({
    nombre: { type: String, required: true, match: validNameAndLastName },
    apellido: { type: String, required: true, match: validNameAndLastName },
    dni: {
        type: Number, required: true, unique: true, validate: {
            validator: function (value: number) {
                return value >= 999999 && value <= 99999999;
            },
            message: "dni-valor invalido.",
        },
    },
    password: { type: String, required: true },
}, { discriminatorKey: '__t' })


const administratorUsersModel = model('administrators', administratorUsersShema)



const adminUser = administratorUsersModel.discriminator('generalManager', new Schema({}))




export { adminUser }