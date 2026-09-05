# Auditoría técnica — La Quinta Pata

Fecha: 4 de septiembre de 2026

## Diagnóstico ejecutivo

El repositorio correcto es `darwin-mega/La-quinta-pata-pmv-1`. No corresponde al
repositorio público homónimo de una asociación ni a `juicio-publico`, que es otro
juego. El producto tiene un MVP jugable con dos modalidades: cada participante
en su dispositivo y mesa compartida.

La aplicación compila, pasa TypeScript, no tiene vulnerabilidades conocidas en
`npm audit` y completó una prueba real de dos jugadores desde la creación de sala
hasta el resultado de una ronda.

## Diagnóstico del despliegue de Vercel

El dominio `la-quinta-pata-pmv-1.vercel.app` está operativo. La falla HTTP 503
tenía dos capas: el código desplegado hacía doble serialización de las salas y el
proyecto seguía apuntando a la base Upstash `la-quinta-pata` (`cool-hamster`), que
había sido eliminada por inactividad. Los logs confirmaron el fallo de DNS
`ENOTFOUND cool-hamster-87881.upstash.io`.

La corrección guarda objetos directamente y conserva compatibilidad de lectura
con salas antiguas doblemente serializadas. En Vercel se retiró únicamente la
conexión obsoleta de La Quinta Pata y se conectó la base activa Free Tier
`juicio-publico-multi` (`cheerful-cougar`). La conexión de Juicio no fue alterada.
Ambos juegos comparten infraestructura gratuita, pero La Quinta Pata aísla todas
sus claves con los prefijos `lqp:` y `lqp:lock:`.

El código de La Quinta Pata no importa ni utiliza Supabase. Sin embargo, los logs
del proyecto Supabase `darwin-mega's Project` muestran un flujo OAuth de Juicio
con `redirect_to=https://la-quinta-pata-pmv-1.vercel.app/auth/callback`. Es una
mezcla de configuración de autenticación de Juicio que debe corregirse en sus URL
de redirección, pero no es la causa del HTTP 503 de las salas.

## Hallazgos corregidos

- Se eliminó la identidad residual de "La Jaula" en paquete, PWA, sesiones y URL
  de respaldo.
- Se cambiaron los textos de interfaz "Juicio Express", "bajo juicio" y "tu
  juicio" para no confundir este producto con el juego Juicio.
- Se actualizó Next.js 14 a Next.js 16, junto con React 19, ESLint y tipos.
- Se migraron los parámetros dinámicos de App Router a la API asíncrona actual.
- Se reemplazó la configuración antigua de ESLint por Flat Config.
- Se agregó `sharp` para optimización de imágenes en producción.
- Se retiró `@vercel/kv`, que no estaba siendo utilizado.
- Se corrigió el guardado en Upstash Redis: el cliente ya serializa objetos y
  antes se le entregaba un JSON pre-serializado, con riesgo de recuperar una
  cadena en lugar de una sala.
- Se adoptó `LA_QUINTA_PATA_SESSION_SECRET` y se conservó compatibilidad temporal
  con `LA_JAULA_SESSION_SECRET`.
- Se agregó el requisito explícito de Node.js 20.9 o superior.

## Verificación realizada

- `npm run lint`: sin errores; quedan seis advertencias de navegación interna.
- `npm run typecheck`: correcto.
- `npm run build`: correcto con Next.js 16.3.4 y Turbopack.
- `npm audit`: cero vulnerabilidades.
- Prueba de producción: inicio HTTP 200, creación de sala, ingreso del segundo
  jugador, selección automática de tema, inicio y cierre de debate, dos votos y
  generación de ganador.

## Estado operativo y próximos pasos

La salida a producción quedó completada: Vercel usa Redis persistente, el commit
validado fue redesplegado con la configuración actual y una prueba remota de dos
sesiones llegó desde la creación de sala hasta el resultado final. La API informó
explícitamente `persistenceMode: redis`.

Como control operativo conviene jugar una ronda desde dos teléfonos reales y
vigilar durante los primeros días el consumo del Free Tier. Si el uso crece, el
primer ajuste debe ser reducir el sondeo de estado antes de ampliar o pagar
infraestructura.

## Riesgos y oportunidades priorizadas

### Alta

- Proteger o sanear `GET /api/room/[roomId]/state`: hoy cualquiera que conozca un
  código puede leer el estado completo, incluidos identificadores y votos.
- Agregar límites de frecuencia a crear sala, unirse y enviar acciones. Los
  códigos de cuatro letras son prácticos, pero tienen un espacio pequeño.
- Incorporar pruebas automatizadas del motor y de las transiciones de estado;
  actualmente la verificación principal es manual/integrada.

### Media

- Sustituir el sondeo cada segundo por eventos en tiempo real o, al menos,
  backoff y pausa cuando la pestaña no está visible.
- Hacer atómica la liberación del lock Redis mediante compare-and-delete y
  extender/renovar el lock en operaciones largas.
- Eliminar las seis advertencias ESLint reemplazando `window.location.href` por
  navegación de App Router.
- Mejorar recuperación de sesión, abandono de sala y reasignación de host.

### Baja

- Eliminar recursos de video duplicados entre `img/` y `public/media/`.
- Dejar de versionar `tsconfig.tsbuildinfo`, que es un artefacto generado.
- Agregar analítica de embudo: crear sala, ingreso, inicio, ronda completada y
  abandono.

## Visión de producto

La fortaleza del MVP no es solo "debatir": es convertir una conversación social
en una experiencia guiada, con tensión, turnos, falacias y una resolución clara.
La prioridad de producto debería ser reducir la fricción de la primera partida:
crear sala en menos de un minuto, explicar cada rol justo cuando aparece y
permitir reconexión sin perder la ronda. Después conviene trabajar retención con
mazos temáticos, historial de partidas y temas compartibles.
