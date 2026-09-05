# La Quinta Pata — Etapa 4: seguridad y robustez

Fecha: 5 de septiembre de 2026

## Objetivo

Endurecer las salas y reducir consumo de la cuenta gratuita sin modificar la experiencia central, agregar servicios ni mezclar datos con Juicio.

## Protecciones incorporadas

- `GET /api/room/[roomId]/state` exige una cookie de sesión válida y firmada.
- La sesión debe corresponder al host o a un jugador real de esa sala.
- Las sesiones se rechazan también del lado del servidor al superar cuatro horas, aunque alguien intente reutilizar manualmente una cookie vieja.
- Durante la votación, cada jugador puede ver su elección y cuántas personas votaron, pero no la elección ni la justificación de los demás.
- Los votos se revelan al llegar a resultados.
- Los temas guardados por la sala quedan visibles únicamente para el host.
- Las votaciones de falacias ocultan la identidad de los demás votantes mientras están abiertas.

## Límites de frecuencia

Se reutiliza Redis con claves aisladas `lqp:rate:`; no se agregó infraestructura.

- Crear sala: 12 intentos cada 10 minutos por red de origen.
- Unirse a una sala: 30 intentos cada 10 minutos por red de origen y sala.
- Acciones de juego: 180 por minuto por jugador y sala.
- Ante Redis no disponible en desarrollo, existe un respaldo local en memoria.
- Las respuestas limitadas usan HTTP 429, `Retry-After` y contadores estándar.

## Eficiencia del sondeo

- Lobby, preparación, votación y resultados: una consulta cada 2,5 segundos en lugar de una por segundo.
- Debate activo: conserva una consulta por segundo para respetar turnos y reloj.
- Pestaña oculta: el sondeo se pausa por completo.
- Al volver a la pestaña o enfocar la ventana, se sincroniza inmediatamente.
- Se evita iniciar una nueva consulta si todavía hay otra en curso.

Con una sala esperando jugadores, el cambio reduce las lecturas periódicas de 60 a 24 por minuto por dispositivo. En segundo plano las reduce a cero.

## Concurrencia Redis

- El lock de sala dura diez segundos para tolerar operaciones algo más lentas.
- La liberación ahora es un `compare-and-delete` atómico mediante Lua: una función solo puede borrar el lock si todavía conserva exactamente su token.

## Pruebas automatizadas

Se agregó Vitest 3.2.6, compatible con Node 20 y sin vulnerabilidades conocidas al momento de la instalación.

La suite cubre:

1. Identificadores y textos únicos para las 125 premisas.
2. Filtrado del mazo Vida cotidiana + Tranqui.
3. Reciclado del mazo cuando se agotan sus temas.
4. Ocultamiento de votos y temas guardados.
5. Revelación de votos al llegar a resultados.
6. Rechazo de sesiones ajenas.
7. Caducidad de sesiones a las cuatro horas.
8. Bloqueo al superar un límite de frecuencia.
9. Flujo API completo: crear, bloquear acceso anónimo, unir jugador, leer con sesión y comenzar partida.

## Comandos de control

```bash
npm test
npm run content:audit
npm run typecheck
npm run lint
npm run build
npm audit
```
