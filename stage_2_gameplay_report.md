# La Quinta Pata — Informe de Etapa 2

Inicio: 4 de septiembre de 2026 · cierre: 5 de septiembre de 2026

## Objetivo

Mejorar la entrada al juego, el ritmo de una ronda, la detección de falacias, la respuesta audiovisual móvil y el cierre compartible, sin aumentar el costo de infraestructura ni mezclar datos con Juicio.

## Trabajo realizado

- Tutorial jugable de cuatro pasos en `/tutorial`: postura, argumento, falacia y criterio de voto.
- Acceso al tutorial desde la portada.
- Selector de falacias con una vista rápida de las seis más frecuentes y catálogo completo por nivel.
- Inicio automático del debate al terminar la preparación; el host conserva “Empezar ahora”.
- Vibración contextual en dispositivos compatibles para turno, denuncia, fin del reloj, cambio de fase, botones y victoria.
- Resultado compartible mediante el menú nativo del dispositivo o portapapeles como alternativa.
- Recuperación de la última sala desde la portada, primer avance seguro de etapa 3.
- Navegación interna migrada al enrutador de Next.js; se eliminaron seis advertencias de calidad.
- Sin tablas, servicios ni variables nuevas: se conserva el almacenamiento gratuito compartido y el espacio de claves `lqp:` ya aislado.

## Premisas agregadas

### Intensidad media

1. **Sociedad — Meritocracia:** La meritocracia describe peor la realidad de lo que ayuda a motivar.
2. **Filosofía — Astrología:** La astrología puede ser valiosa aunque no sea una ciencia.
3. **Trabajo — Selección con IA:** Una empresa debería poder usar inteligencia artificial para elegir a quién contratar.
4. **Relaciones — Privacidad adolescente:** Los padres deberían poder revisar el celular de sus hijos menores sin permiso.

### Intensidad filosa

5. **Ética — Aborto:** El aborto voluntario durante las primeras semanas debería ser una decisión de la persona embarazada.
6. **Ética — Eutanasia:** La eutanasia debería permitirse a adultos con sufrimiento irreversible.
7. **Política — Ingreso básico universal:** Un ingreso básico universal sería más justo que condicionar cada ayuda estatal.
8. **Política — Crisis climática:** La crisis climática justifica limitar consumos individuales de alto impacto.
9. **Ciencia — Mejoras genéticas:** Deberíamos permitir mejoras genéticas humanas, no solo curar enfermedades.
10. **Ética — Donación de órganos:** Pagar por la donación de órganos podría salvar más vidas de las que pondría en riesgo.
11. **Ética — Animales como alimento:** Criar animales para alimento será visto como una injusticia moral.
12. **Sociedad — Apropiación cultural:** La apropiación cultural puede causar un daño que justifique límites sociales.
13. **Filosofía — Experiencias paranormales:** Una experiencia paranormal personal puede justificar una creencia aunque no convenza a los demás.
14. **Tecnología — IA y gobierno:** Una inteligencia artificial podría tomar mejores decisiones públicas que representantes electos.
15. **Educación — Religión en la escuela pública:** La educación religiosa tiene lugar en la escuela pública si incluye varias creencias.
16. **Sociedad — Trabajo sexual:** Regular el trabajo sexual protege más que intentar eliminarlo.
17. **Relaciones — Monogamia:** La monogamia es más una norma cultural que una necesidad afectiva.
18. **Política — Cárceles y reinserción:** Las cárceles deberían reemplazarse en gran parte por sistemas de reparación y reinserción.

Cada premisa incluye dos ángulos defendibles. El objetivo editorial no es afirmar una respuesta correcta, sino crear una tensión clara entre valores, riesgos y consecuencias.

## Falacias agregadas

1. **Inversión de la carga de la prueba — “Probá que no”:** quien afirma traslada a otros la obligación de refutar algo que todavía no respaldó.
2. **Razonamiento circular — “La calesita”:** la conclusión se usa como su propia prueba.
3. **Selección sesgada / cherry picking — “Elegir solo lo que conviene”:** se muestran datos favorables y se oculta evidencia relevante contraria.
4. **Apelación a la ignorancia — “Nadie lo descartó”:** algo se da por verdadero porque no se probó falso, o al revés.
5. **Falsa equivalencia — “Poner todo al mismo nivel”:** se equiparan casos cuyas diferencias importan para evaluarlos.
6. **Costo hundido — “Ya invertimos demasiado”:** se continúa una mala decisión por recursos pasados que ya no se pueden recuperar.
7. **Falacia de composición — “De la parte al todo”:** se atribuye al conjunto lo que solo se sabe de sus partes.
8. **Equívoco — “Cambiar el sentido”:** una palabra cambia de significado dentro del argumento para aparentar validez.

Todas incluyen definición en lenguaje cotidiano, nombre técnico y ejemplo concreto. El catálogo pasa de 12 a 20 falacias.

## Criterio editorial y fuentes

Los temas se eligieron por su capacidad de revelar desacuerdos de valores y por aparecer de forma recurrente en investigación sobre religión, derechos, tecnología, privacidad y sociedad. Para aborto se evitó formular afirmaciones médicas dentro de la premisa y se tomó como referencia el encuadre de salud pública y derechos de la OMS. Para tecnología y privacidad se usaron líneas de investigación de Pew Research Center. Los temas esotéricos se formularon como debates epistemológicos sobre el valor de la experiencia y la diferencia entre reflexión simbólica y conocimiento verificable.

- OMS: https://www.who.int/es/news-room/fact-sheets/detail/abortion
- Pew Research Center, áreas de investigación: https://www.pewresearch.org/our-research/
- Pew Research Center, IA y capacidades humanas: https://www.pewresearch.org/science/2025/09/17/views-of-ais-impact-on-society-and-human-abilities/

## Verificación

- TypeScript: aprobado.
- Build de producción: aprobado, incluida la nueva ruta estática `/tutorial`.
- ESLint: aprobado sin errores.
- Tutorial móvil: flujo completo aprobado en 390 × 844, sin errores de consola.
- Producción: nueva ruta y cambios visibles en `https://la-quinta-pata-pmv-1.vercel.app`.
- E2E de producción: sala `TJAM` creada, dos participantes incorporados por API, tres jugadores recuperados por el host y ronda iniciada.
- Transición automática: la preparación terminó y el servidor mostró el debate activo sin intervención manual.
- Selector real: vista “Rápidas” con seis opciones y nivel avanzado con las nuevas falsa equivalencia, composición y equívoco.
- Persistencia: endpoint de estado respondió HTTP 200 con `persistenceMode=redis`.
- Recuperación: la portada mostró el acceso a la última sala creada.
- Consola del navegador: sin errores ni advertencias durante tutorial y creación de sala.
