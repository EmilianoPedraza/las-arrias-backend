# Las Arrias API

Las Arrias API es una API REST full, que parte como microservicio de Las Arrias web, siendo esta ultima una aplicacion web.
Esta API Rest se encarga de validar usuarios a travez de tokens de verificacion y de guardar datos con mongoDB
, mongo Atlas y en memoria con Redis. El uso de Redis en este proyecto sirve para manejar mejor algunas de las validaciones
que se ejecutan en tiempo real, como tambien datos de mensajeria entre usuarios registrados ya validados.
