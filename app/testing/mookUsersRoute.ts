import { json, urlencoded, Router } from "express";// Framework 

import { Faker, es } from '@faker-js/faker';// Librería para generar datos falsos
import bcrypt from "bcrypt"; // Librería para encriptar contraseñas

import { LocalUser } from "../models/usuario";//Modelo de datos de usuario local
import { conectionRedis } from "../controllers/redisCacheManager";//Clase para manejar Redis
import localUser from "../daos/user/localUser/localUser";
import { LocalUsersArray } from "../types/mookUsersRouteTyp";
import { UserError } from "../daos/user/errors/userError";
import { Types } from "mongoose";
import { UserRedis } from "../controllers/redisCacheManager";

//* Se define el router principal de pruebas
const testingRoute = Router();

//* Middlewares para parsear requests
testingRoute.use(json()); // Acepta JSON en body
testingRoute.use(urlencoded({ extended: true })); // Acepta datos de formularios

//* Instancia de cliente Redis
conectionRedis.connectIfRequired()

/** Genera un número aleatorio (0–99) para inicializar Faker */
const randomSeed = () => Math.floor(Math.random() * 100);

//* Se crea instancia de Faker con localización en español
const faker = new Faker({ locale: [es] });
faker.seed(randomSeed()); // Se inicializa Faker con semilla aleatoria

/** Genera un email válido */
const createEmail = (): string => {
    let email;
    do {
        email = faker.internet.email(); // Email aleatorio
    } while (/\.\@/.test(email)); // Evita emails inválidos con ".@"
    return email;
};

/** Genera contraseña aleatoria de mínimo 8 caracteres */
const createPassword = () => {
    return faker.internet.password({
        length: 8, // Mínimo 8 caracteres
        memorable: true, // Intenta que sea recordable
        pattern: /[A-Za-z0-9!@#$%^&*()_+]{8,}/ // Permite letras, números y símbolos
    });
};

/** Construye un nombre de usuario a partir de nombre y apellido con modificaciones aleatorias */
const insertRandomCharacter = (nombre: string, apellido: string) => {
    const guion_ok = Math.random() < 0.3; // 30% chance de agregar guion
    const number_ok = Math.random() < 0.5; // 50% chance de agregar número
    const totalLastNme_ok = Math.random() < 0.5 ? 1 : undefined; // A veces usa dos apellidos

    const nombre_ = nombre.split(' ', 1); // Toma solo primer nombre
    const apellido_ = apellido.split(' ', totalLastNme_ok); // Uno o dos apellidos

    let newString = { userName: `${nombre_}${apellido_}` }; // Une nombre+apellido
    !totalLastNme_ok && (newString.userName = newString.userName.replace(/,/g, "")); // Elimina coma si hay dos apellidos

    const pos = Math.floor(1 + Math.random() * (newString.userName.length - 1)); // Posición aleatoria para guion
    const pos_2 = Math.floor(1 + Math.random() * (newString.userName.length));   // Posición aleatoria para número

    guion_ok && (newString.userName = newString.userName.slice(0, pos) + '_' + newString.userName.slice(pos)); // Inserta guion
    number_ok && (newString.userName = newString.userName.slice(0, pos_2) + Math.floor(Math.random() * 200) + newString.userName.slice(pos_2)); // Inserta número

    return newString.userName;
};

/** Encripta contraseña usando bcrypt */
const encripta = async (password: string) => {
    try {
        const newpass = await bcrypt.hash(password, 10); // 10 rondas de sal
        return newpass;
    } catch (error) {
        throw new Error('Error al encriptar');
    }
};

/** Crea un usuario falso */
export const createUser = async (password: 'encript' | 'simple') => {
    const user = {
        nombre: faker.person.firstName(), // Nombre
        apellido: faker.person.lastName(), // Apellido
        email: createEmail(), // Email válido
        password: createPassword(), // Contraseña aleatoria
        creadoEn: faker.date.past(), // Fecha pasada
        actualizadoEn: faker.date.past(), // Fecha pasada
        dni: Math.floor(999999 + Math.random() * 9999999), // DNI aleatorio
        nombreUsuario: '', // Se asigna luego
    };

    const newUserName = insertRandomCharacter(user.nombre, user.apellido); // Genera username único
    user['nombreUsuario'] = newUserName;

    password === 'encript' && (user.password = await encripta(user.password)); // Encripta si corresponde

    return user;
};

/** Genera múltiples usuarios */
const createMultipleUsers = async (cant: number): Promise<LocalUsersArray> => {
    const users = [] as LocalUsersArray;
    for (let i = 0; i < cant; i++) {
        users.push(await createUser('encript')); // Genera cada usuario encriptado
    }
    return users;
};

//* Ruta GET /register → redirige según parámetros
testingRoute.get('/register', (req, res) => {
    const typeReg = typeof req.query.type === "string" ? req.query.type : undefined;
    const cant = typeof req.query.cant === "string" ? req.query.cant : undefined;

    // Validación de parámetros
    if (!typeReg || !cant) {
        res.status(400).json({ ok: false, message: 'Existen parametros indefinidos' });
        return;
    }
    if (isNaN(Number(cant))) {
        res.status(400).json({ ok: false, message: 'La cantidad especificada no corresponde a un valor numerico' });
        return;
    }

    // Redirecciones según tipo de registro
    if (typeReg === 'secuential') {
        res.redirect(`/test/secuential?cant=${cant}`);
        return;
    }
    if (typeReg === 'many') {
        res.redirect(`/test/many?cant=${cant}`);
        return;
    }

    res.status(400).json({ ok: false, message: 'La opcion de creacion de users no se reconoce' });
});

//* Ruta GET /many → genera muchos usuarios y los guarda en Mongo
testingRoute.get('/many', async (req, res) => {
    try {
        const cant = typeof req.query.cant === "string" ? req.query.cant : undefined;
        if (!cant || isNaN(Number(cant))) {
            return res.status(400).json({ ok: false });
        }

        const cant_ = parseInt(cant as string);
        const newUsers = await createMultipleUsers(cant_); // Genera usuarios
        await LocalUser.insertMany(newUsers); // Inserta en MongoDB

        return res.status(200).json({ users: newUsers });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ ok: false });
    }
});

//* Interfaces para tipar arrays de resultados
interface UsersErrors extends Array<{ nombreUsuario: string, error: string }> { }
interface UsuariosSave extends Array<{ nombreUsuario: string, nombre: string, password: string }> { }

//* Ruta GET /secuential → genera usuarios uno por uno, valida y guarda en Redis y Mongo
testingRoute.get('/secuential', async (req, res) => {
    const usersErrors: UsersErrors = []; // Usuarios con error
    const usuariosSave: UsuariosSave = []; // Usuarios guardados correctamente

    const cant = parseInt(req.query.cant as string);

    for (let i = 0; i <= cant; i++) {
        const user = await createUser('simple'); // Usuario sin password encriptada
        const { nombre, apellido, dni, nombreUsuario, email, password } = user;

        const userReg = new localUser(dni, undefined, nombre, apellido, nombreUsuario, email, password); // Instancia controlador

        let ok = true;
        try {
            const newId = new Types.ObjectId()
            await userReg.validateRegisterUser(); // Valida datos de registro
            await userReg.validateLocalUser(); // Valida reglas propias de usuario local
            await userReg.encriptarPsw(); // Encripta password
            await userReg.guardarNuevoLocalUser(newId); // Guarda en Mongo

            // Guarda hash en Redis si Redis está conectado
            await UserRedis.saveHashUser({ nombre, apellido, nombreUsuario, _id: newId, email, __t: 'LocalUser' }, conectionRedis)
            await UserRedis.saveSetUser({ nombre, apellido, nombreUsuario, _id: newId, email, __t: 'LocalUser' }, conectionRedis)
        } catch (er) {
            // Manejo de errores personalizados
            er instanceof UserError && (usersErrors.push({ nombreUsuario, error: er.message }));
            ok = false;
        }

        // Si no hubo error, se añade a la lista de usuarios guardados
        ok && (usuariosSave.push({ nombre, nombreUsuario, password }));
    }

    // Respuesta final con usuarios OK y fallidos
    res.status(200).json({
        usersOk: usuariosSave,
        usersNot: usersErrors,
        totalErrors: usersErrors.length,
        totalRegisters: usuariosSave.length
    });
});

export default testingRoute;
