type Tipo = string | number | boolean | object | undefined | null;
type TipoValido = 'string' | 'number' | 'boolean' | 'object' | 'undefined' | 'null';

//? Función que valida si el tipo de `valor` coincide con el tipo esperado `tipe`.
//* `valor`: el valor a comprobar, que puede ser de tipo `Tipo`.
//* `tipe`: el tipo que esperamos que sea el valor, que debe ser una de las cadenas definidas en `TipoValido`.
const validType = (valor: Tipo, tipe: TipoValido): boolean => {
    // La función usa el operador `typeof` para obtener el tipo de `valor` y lo compara con `tipe`.
    // Retorna `true` si los tipos coinciden, de lo contrario `false`.

    return typeof valor === tipe
}

const validarCadena = (str: string) => {
    if (validType(str, 'string')) {
        const regex = /[{}\[\]\/\*]/;
        return !regex.test(str); // Retorna true si NO contiene esos caracteres
    }
    throw new Error("validarCadena: El valor ingresado no es un string");

};


const validarNumEntero = (num: number): boolean => {
    if (Number.isInteger(num)) {
        //Se cumple si el número es entero
        return true
    }
    //caso contrario retorna false
    return false
}

export { validType, validarCadena, validarNumEntero };


