# Etapa 5 · Identidad sonora

Fecha: 5 de septiembre de 2026

## Objetivo

Reemplazar el audio de prototipo por una identidad sonora original, más cálida, reconocible y entretenida, sin sumar servicios pagos ni comprometer el rendimiento móvil.

## Cambios realizados

- Se rediseñaron desde cero los ocho sonidos existentes con síntesis multicapa, envolventes suaves, armónicos, paneo estéreo y ecos controlados.
- Se agregaron tres variaciones de botón para evitar que cada interacción produzca exactamente el mismo sonido.
- Se agregó una segunda variación del tic final para reducir la fatiga de la cuenta regresiva.
- El cambio de turno ahora combina impacto, acorde ascendente y cola espacial.
- La denuncia de falacia tiene una caída disonante breve y un remate cómico, sin convertirse en una alarma estridente.
- El tiempo agotado utiliza tres avisos descendentes y un golpe grave final.
- La victoria pasó a ser una cortina de 3,35 segundos con arpegio, acorde final y destellos estéreo.
- La ambientación pasó a ser un loop armónico de 16 segundos, deliberadamente discreto para no competir con las voces.
- Los eventos importantes reducen temporalmente la música de fondo para mantener una jerarquía clara.
- La música se detiene cuando la pestaña queda oculta y vuelve al regresar si el usuario tenía el audio activado.
- Se eliminó la superposición de dos efectos al activar el audio.

## Rendimiento y costo

- Todo el material es original y se genera localmente con `npm run audio:generate`; no hay licencias ni APIs externas.
- Los WAV se generan a 32 kHz estéreo, suficiente para interfaz y juego, con un peso total aproximado de 3 MB.
- Solo se precargan los tres botones y el cambio de fase. Los sonidos largos se cargan bajo demanda.
- El ambiente representa aproximadamente 2 MB y solo comienza después de una interacción del usuario.
- No se agregaron dependencias, almacenamiento, base de datos ni costos mensuales.

## Validación

- Análisis de duración, pico y RMS de los once archivos; ninguno supera el pico objetivo de 0,82.
- Activación y desactivación comprobadas en navegador.
- Recorrido del tutorial hasta la denuncia de falacia sin errores de consola.
- `npm run typecheck`: correcto.
- `npm run lint`: correcto.
- `npm test`: 9 pruebas correctas.
- `npm run build`: correcto.

## Archivos principales

- `scripts/generate-audio.mjs`: generador reproducible de la identidad sonora.
- `lib/sounds.ts`: reproducción, variaciones, niveles, vibración y ducking de ambiente.
- `components/SoundIdentity.tsx`: activación, pausa por visibilidad y preferencias.
- `public/audio/`: once archivos estéreo listos para producción.
