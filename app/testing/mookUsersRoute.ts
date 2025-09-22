import { Router } from "express";
import { Faker, es } from '@faker-js/faker';
import { LocalUser } from "../models/usuario";

//route
const testingRoute = Router();

const randomSeed = () => Math.floor(Math.random() * 100);

const createFirstName = (): string => {
    //configuracion de faker para español
    const faker = new Faker({ locale: [es] });
    faker.seed(randomSeed());
    return faker.person.firstName();
}
const createLastName = (): string => {
    const faker = new Faker({ locale: [es] });
    faker.seed(randomSeed());
    return faker.person.lastName();
}

const createEmail = (): string => {
    const faker = new Faker({ locale: [es] });
    let email
    faker.seed(randomSeed());
    do {
        email = faker.internet.email();
    } while (/\.\@/.test(email)); // si hay ".@" → rechazar
    return email
}
const createPassword = () => {
    const faker = new Faker({ locale: [es] });
    faker.seed(randomSeed());
    return faker.internet.password({ length: 8, memorable: true, pattern: /[A-Za-z0-9!@#$%^&*()_+]{8,}/ });
}

const createDate = () => {
    const faker = new Faker({ locale: [es] });
    faker.seed(randomSeed())
    return faker.date.past()
}

const insertRandomCharacter = (nombre: string, apellido: string) => {
    //si es true se genera el guion de ubicacion aleatoria
    const guion_ok = Math.random() < 0.3
    //si es true se genera el numero de ubicacion aleatoria
    const number_ok = Math.random() < 0.5
    //si es true se utilizan ambos apellidos en el nombre de usuario
    const totalLastNme_ok = Math.random() < 0.5 ? 1 : undefined

    //se eliminan los espacios en caso de que existan dos nombres de usuario
    const nombre_ = nombre.split(' ', 1)
    //lo mismo que arriba peroooo, se usan  los dos o un apellido dependiendo de totalLastNme_ok
    const apellido_ = apellido.split(' ', totalLastNme_ok)


    let newString = { userName: `${nombre_}${apellido_}` }
    //si se usan ambos apellidos se debe eliminar la coma resultante 
    !totalLastNme_ok && (newString.userName = newString.userName.replace(/,/g, ""))
    //posicion aleatorioa de guion
    const pos = Math.floor(1 + Math.random() * (newString.userName.length - 1));
    //posicion aleatoria de numero
    const pos_2 = Math.floor(1 + Math.random() * (newString.userName.length));
    guion_ok && (newString.userName = newString.userName.slice(0, pos) + '_' + newString.userName.slice(pos));
    number_ok && (newString.userName = newString.userName.slice(0, pos_2) + Math.floor(Math.random() * 200) + newString.userName.slice(pos_2))

    return newString.userName
}

type LocalUserType = {
    nombre: string,
    apellido: string,
    nombreUsuario: string,
    email: string,
    dni: number,
    telefono?: number
}

export const createUser = () => {
    const user = {
        nombre: createFirstName(),
        apellido: createLastName(),
        email: createEmail(),
        password: createPassword(),
        creadoEn: createDate(),
        actualizadoEn: createDate(),
        dni: Math.floor(999999 + Math.random() * 99999999),
        nombreUsuario: '',
    }
    const newUserName = insertRandomCharacter(user.nombre, user.apellido)
    user['nombreUsuario'] = newUserName
    return user
}



interface LocalUsers extends Array<LocalUserType> { }

const createMultipleUsers = (cant: number): LocalUsers => {
    const users = [] as LocalUsers
    for (let i = 0; i < cant; i++) {
        users.push(createUser())
    }
    return users
}



testingRoute.get('/register', async (req, res) => {
    //
    const cant = typeof req.query.cant === "string" ? req.query.cant : undefined;
    if (!(isNaN(Number(cant)))) {
        const cant_: number = parseInt(cant as string)
        const newUsers = createMultipleUsers(cant_)
        await LocalUser.insertMany(newUsers)
        console.log(newUsers)
        res.status(200).json({
            users: newUsers
        })
    }
    res.status(400).json({
        ok: false
    })
})
export default testingRoute