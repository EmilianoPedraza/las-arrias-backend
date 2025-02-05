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
//?VALIDAR QUE UNA CADENA DE STRING TENGA EL FORMATO EN BASE A UNA EXPRESIÓN REGULAR
const validarStringConExpresion = (str: string, exp: string): boolean => {
    const regex = new RegExp(exp);
    return regex.test(str);//retorna true si es valido y false en caso contrario
};


//?VALIDAR SI UN NÚMERO ES ENTERO
const validarNumEntero = (num: number): boolean => {
    if (Number.isInteger(num)) {
        //Se cumple si el número es entero
        return true
    }
    //caso contrario retorna false
    return false
}

export { validType, validarNumEntero, validarStringConExpresion };


