import { json, urlencoded, Router } from "express";
import { Faker, es } from '@faker-js/faker';
import { LocalUser } from "../models/usuario";
import bcrypt from "bcrypt"//Para encriptar contraseñas
//*para grear usuarios
import localUser from "../controllers/user/localUser/localUser";
import { UserError } from "../controllers/user/errors/userError";



type LocalUserType = {
    nombre: string,
    apellido: string,
    nombreUsuario: string,
    email: string,
    dni: number,
    telefono?: number
}


//*route
const testingRoute = Router();
//* middlewares
testingRoute.use(json())
testingRoute.use(urlencoded({ extended: true }))

const randomSeed = () => Math.floor(Math.random() * 100);

const faker = new Faker({ locale: [es] });
faker.seed(randomSeed());




const createEmail = (): string => {
    let email
    do {
        email = faker.internet.email();
    } while (/\.\@/.test(email)); // si hay ".@" → rechazar
    return email
}
const createPassword = () => {
    return faker.internet.password({ length: 8, memorable: true, pattern: /[A-Za-z0-9!@#$%^&*()_+]{8,}/ });
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


const encripta = async (password: string) => {
    try {
        const newpass = await bcrypt.hash(password, 10)
        return newpass
    } catch (error) {
        throw new Error('Error al encriptar');
    }
}

export const createUser = async (password: 'encript' | 'simple') => {
    const user = {
        nombre: faker.person.firstName(),
        apellido: faker.person.lastName(),
        email: createEmail(),
        password: createPassword(),
        creadoEn: faker.date.past(),
        actualizadoEn: faker.date.past(),
        dni: Math.floor(999999 + Math.random() * 9999999),
        nombreUsuario: '',
    }
    const newUserName = insertRandomCharacter(user.nombre, user.apellido)
    user['nombreUsuario'] = newUserName
    password === 'encript' && (user.password = await encripta(user.password))
    return user
}



interface LocalUsers extends Array<LocalUserType> { }

const createMultipleUsers = async (cant: number): Promise<LocalUsers> => {
    const users = [] as LocalUsers
    for (let i = 0; i < cant; i++) {
        users.push(await createUser('encript'))
    }
    return users
}





testingRoute.get('/register', (req, res) => {
    const typeReg = typeof req.query.type === "string" ? req.query.type : undefined;
    const cant = typeof req.query.cant === "string" ? req.query.cant : undefined;
    if (!typeReg || !cant) {
        res.status(400).json({ ok: false, message: 'Existen parametros indefinidos' });
        return
    }
    if (isNaN(Number(cant))) {
        res.status(400).json({ ok: false, message: 'La cantidad especificada no corresponde a un valor numerico' });
        return
    }
    if (typeReg === 'secuential') {
        res.redirect(`/test/secuential?cant=${cant}`)
        return
    }
    if (typeReg === 'many') {
        res.redirect(`/test/many?cant=${cant}`)
        return
    }
    res.status(400).json({ ok: false, message: 'La opcion de creacion de users no se reconoce' });
})



//Agregar varios usuarios
testingRoute.get('/many', async (req, res) => {
    try {
        const cant = typeof req.query.cant === "string" ? req.query.cant : undefined;
        if (!cant || isNaN(Number(cant))) {
            return res.status(400).json({ ok: false });
        }

        const cant_ = parseInt(cant as string);
        const newUsers = await createMultipleUsers(cant_);
        await LocalUser.insertMany(newUsers);

        return res.status(200).json({ users: newUsers });

    } catch (err) {
        console.log(err);
        return res.status(400).json({ ok: false });
    }
});


interface UsersErrors extends Array<{ nombreUsuario: string, error: string }> { }
interface UsuariosSave extends Array<{ nombreUsuario: string, nombre: string, password: string }> { }
testingRoute.get('/secuential', async (req, res) => {
    const usersErrors: UsersErrors = []
    const usuariosSave: UsuariosSave = []

    const cant = parseInt(req.query.cant as string)
    for (let i = 0; i <= cant; i++) {
        const user = await createUser('simple')
        const { nombre, apellido, dni, nombreUsuario, email, password } = user
        const userReg = new localUser(dni, undefined, nombre, apellido, nombreUsuario, email, password)
        let ok = true
        try {
            await userReg.validateRegisterUser()
            await userReg.validateLocalUser()
            await userReg.guardarNuevoLocalUser()
            await userReg.encriptarPsw()
        } catch (er) {
            er instanceof UserError && (usersErrors.push({ nombreUsuario, error: er.message }))
            ok = false
        }
        ok && (usuariosSave.push({ nombre, nombreUsuario, password }))
    }
    res.status(200).json({ usersOk: usuariosSave, usersNot: usersErrors, totalErrors: usersErrors.length, totalRegisters: usuariosSave.length })
})


export default testingRoute