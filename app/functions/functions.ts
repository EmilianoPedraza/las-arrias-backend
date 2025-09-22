import validator from "validator";

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


const validateEmail = (email: string): boolean => {
    const options = {
        allow_display_name: false, // "John Doe <john@example.com>"
        require_display_name: false,
        allow_utf8_local_part: false, // desactiva caracteres "raros" en la parte local
        require_tld: true,           // exige TLD (.com, .net, etc.)
        ignore_max_length: false     // respeta 254 chars total / 64 local
    };
    return validator.isEmail(email, options)
}

export { validType, validarNumEntero, validarStringConExpresion, validateEmail };


