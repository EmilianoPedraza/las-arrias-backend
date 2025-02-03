export enum EXPRESIONS_TYPES_VALID_USER {
    FIRST_AND_LASTNAME = "^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$",
    VALID_EMAIL = "^[a-zA-Z1-9]+(\\.[a-zA-Z1-9]+)*@[a-zA-Z]+\\.[a-zA-Z]+$",
    VALID_USERNAME = "^(?!.*[{}\\[\\]()\":;'?~`´^&-])(?=[a-zA-Z1-9_]+(\\.[a-zA-Z1-9_]+)*$)[a-zA-Z1-9_]+(\\.[a-zA-Z1-9_]+)*$",
    VALID_PASSWORD = "^(?!.*\\.\\.)[A-Za-zÁÉÍÓÚáéíóúÑñ1-9_]+(?:\\.[A-Za-zÁÉÍÓÚáéíóúÑñ1-9_]+)*[^.]$",
}















//?                                          VALID_EMAIL:
//*Expresión en formato JS:      /^[a-zA-Z1-9]+(\.[a-zA-Z1-9]+)*@[a-zA-Z]+\.[a-zA-Z]+$/
/*
Esta expresión regular está diseñada para validar correos electrónicos con caracteres alfanuméricos y puntos,
pero solo en ciertas posiciones y con una estructura básica de dominio.


✅ Permite:
                Parte local (antes del @):
                    Letras (mayúsculas y minúsculas): [a-zA-Z].
                    Números del 1 al 9: [1-9].
                    Puntos: . (pero no de forma consecutiva).
                    El primer carácter debe ser una letra o un número y no puede ser solo un punto.

                Parte del dominio (después del @):
                    Letras (mayúsculas y minúsculas): [a-zA-Z].

                Extensión del dominio (después del punto en el dominio):
                    Letras (mayúsculas y minúsculas): [a-zA-Z].
🚫 Lo que no permite:
                No permite espacios en blanco en ninguna parte del correo.

                No permite caracteres especiales fuera de letras, números y puntos en la parte local o el dominio
                (por ejemplo, no se permiten guiones, comas, signos de más, etc.).

                No permite puntos consecutivos en la parte local antes del @ ni después del @.

                No permite más de un @. Solo se permite uno, que debe separar la parte local del dominio.

                No permite que el correo termine con un punto.
*/


//?                                     VALID_USERNAME:
//*Expresión en formato JS:     /^(?!.*[{}\[\]()":;'?~`´^&-])(?=[a-zA-Z1-9_]+(\.[a-zA-Z1-9_]+)*$)[a-zA-Z1-9_]+(\.[a-zA-Z1-9_]+)*$/
/*
Resumen de validaciones
✅ Permitidos
            Letras (a-z, A-Z).
            Números (1-9).
            Guion bajo (_).
            Punto (.) con la condición de que esté rodeado de caracteres permitidos y no sea consecutivo.
🚫 No permitidos
            Espacios en blanco.
            Símbolos matemáticos (+, -, *, /, =, etc.).
            Llaves, corchetes y paréntesis ({ } [ ] ( )).
            Comillas (' " ).
            Dos puntos y punto y coma (: ;).
            Signo de pregunta (?).
            Tildes y caracteres especiales (á, é, í, ó, ú, ñ, ~, ^, &, etc.).
            Punto al inicio o al final.
            Puntos consecutivos.

*/

//?                                     FIRST_AND_LASTNAME
//*Expresión en formato JS:    /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/
/*
✅ Lo que permite:
            Letras mayúsculas y minúsculas (A-Z, a-z).
            Letras con acento (ÁÉÍÓÚ, áéíóú).
            La letra ñ en ambas formas (Ñ, ñ).
            Cadenas sin espacios ni caracteres especiales.
❌ Lo que NO permite:
            Espacios en blanco (" ").
            Guion bajo (_) o guion medio (-).
            Puntos (.) o cualquier otro signo de puntuación.
            Corchetes {}, [], paréntesis ().
            Símbolos matemáticos (+, -, *, /, =, etc.).
            Caracteres especiales como @, &, !, ?, :, ;, ", ', ~, etc..

*/

//?                                          VALID_PASSWORD
//*Expresión en formato JS:         "^(?!.*\\.\\.)[A-Za-zÁÉÍÓÚáéíóúÑñ1-9_]+(?:\\.[A-Za-zÁÉÍÓÚáéíóúÑñ1-9_]+)*[^.]$"
/*
2️⃣ Validaciones que realiza
✅ Lo que permite:
        ✔ Letras mayúsculas y minúsculas (A-Z, a-z).
        ✔ Letras con tildes (ÁÉÍÓÚáéíóú).
        ✔ La letra Ñ y ñ.
        ✔ Números del 1 al 9.
        ✔ Guion bajo _.
        ✔ Puntos . (pero solo si están bien ubicados).

❌ Lo que prohíbe:
        🚫 Espacios en blanco.
        🚫 Números 0 (opcional para más seguridad).
        🚫 Puntos al inicio o al final del string.
        🚫 Puntos consecutivos (..).
        🚫 Símbolos matemáticos: + - * / % = < >.
        🚫 Caracteres especiales: { } [ ] ( ) ; : ? ! " ' &.
        🚫 No puede llevar tildes dobles o combinaciones raras.

*/


//?                                         VALID_DNI

//*Expresión en formato JS                  /^\d{7,8}$/