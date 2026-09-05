# La Quinta Pata — Auditoría editorial y avance de etapa 3

Fecha: 5 de septiembre de 2026

## Resultado ejecutivo

- Catálogo final auditado: **20 falacias**, con 20 nombres técnicos, 20 nombres cotidianos y 20 mecanismos conceptuales únicos.
- Banco final: **96 premisas con texto e identificador únicos**.
- Se reemplazó `Non sequitur` porque era una categoría demasiado amplia y podía superponerse con otros errores. En su lugar se incorporó **Afirmación del consecuente**.
- Se reescribieron 13 premisas cercanas a otras ya existentes.
- Se agregaron 12 premisas nuevas: nueve vinculadas con Uruguay o América Latina y tres filosóficas.
- Se agregó trazabilidad editorial visible durante la preparación de la ronda.
- Se incorporó `npm run content:audit` para detectar futuras repeticiones exactas de identificador, texto, nombre técnico, nombre cotidiano o clave conceptual.

## Auditoría conceptual de falacias

Las falacias no se consideran diferentes solo porque tengan otro nombre. La separación aplicada es por el mecanismo que hace fallar el razonamiento:

1. **Ad hominem:** ataque a la persona.
2. **Hombre de paja:** deformación de la postura.
3. **Falso dilema:** eliminación de alternativas.
4. **Apelación a la emoción:** emoción usada como sustituto de justificación.
5. **Pendiente resbaladiza:** cadena futura presentada como inevitable.
6. **Generalización apresurada:** muestra insuficiente convertida en regla general.
7. **Apelación a la autoridad:** prestigio usado como prueba.
8. **Ad populum:** popularidad usada como prueba.
9. **Tu quoque:** crítica desviada hacia la supuesta hipocresía del crítico.
10. **Red herring:** desvío hacia un asunto irrelevante.
11. **Causa falsa / post hoc:** orden temporal confundido con causalidad.
12. **Afirmación del consecuente:** inversión inválida de una condición.
13. **Inversión de la carga de la prueba:** obligación de justificar trasladada al interlocutor.
14. **Razonamiento circular:** la conclusión se usa como su propio apoyo.
15. **Cherry picking:** ocultamiento selectivo de evidencia contraria.
16. **Apelación a la ignorancia:** ausencia de refutación tratada como evidencia.
17. **Falsa equivalencia:** diferencias relevantes borradas en una comparación.
18. **Costo hundido:** recursos irrecuperables usados para decidir el futuro.
19. **Composición:** propiedades de las partes atribuidas al conjunto.
20. **Equívoco:** cambio de significado de una palabra dentro del argumento.

El selector ahora muestra “Cómo distinguirla” dentro de cada explicación, especialmente para los pares que suelen confundirse.

## Premisas reescritas para reducir repetición

Se retiraron o sustituyeron formulaciones repetidas sobre:

- IA aplicada al estudio.
- Contenido corto como fuente de información.
- Forma de comunicar frente a tener razón.
- Provocación frente a explicación en redes.
- Castigo frente a rehabilitación.
- Mayorías y justicia.
- Seguridad frente a libertad.
- Límites genéricos a la expresión.
- Fines que justifican medios.
- Verdad frente a estabilidad social.
- Obra separada de la moral de su autor.
- Beneficio o daño social general de la religión.

Las sustituciones introducen disculpas públicas, correcciones periodísticas, exámenes cronometrados, bloqueos en redes, confesiones sin asistencia legal, suerte moral, voto obligatorio, privacidad de figuras públicas, denuncia institucional, conciencia física, responsabilidad de plataformas, arte con IA y el problema del mal.

## Doce premisas nuevas

### Uruguay y América Latina

1. **Prospección petrolera offshore:** Uruguay debería frenarla hasta despejar sus riesgos ambientales.
2. **Capacidad tecnológica:** Uruguay debería desarrollar IA propia antes que depender de soluciones extranjeras.
3. **Seguridad pública:** se debería priorizar prevención social antes que nuevas cárceles de máxima seguridad.
4. **Seguridad social:** sería más justo subir impuestos que aumentar la edad de retiro.
5. **Formación docente:** debería convertirse en una universidad pública autónoma.
6. **Agua:** durante la escasez deberían limitarse usos productivos antes que el consumo residencial.
7. **Becas universitarias:** deberían priorizar necesidad económica aunque el rendimiento no sea sobresaliente.
8. **Deepfakes electorales:** el contenido político creado con IA debería prohibirse durante campañas.
9. **Minerales críticos:** América Latina debería ralentizar su extracción hasta poder procesarlos localmente.

### Filosofía, Dios, conciencia e IA

10. **Conciencia artificial:** una IA que afirma sentir debería tratarse como posiblemente consciente.
11. **Identidad personal:** una copia perfecta de tu mente seguiría siendo vos.
12. **Existencia de Dios:** el orden del universo hace más razonable creer que existe Dios.

Además, la premisa previa sobre eutanasia fue actualizada al caso real uruguayo: debate si las garantías de la reglamentación de 2026 protegen suficientemente una decisión libre.

## Fuentes editoriales principales

- Ministerio de Salud Pública: reglamentación y protocolo de eutanasia.
- Observatorio Ambiental Nacional e INDDHH: prospección sísmica offshore.
- Agesic: Laboratorio de IA para el Bien.
- Ministerio del Interior: Plan Nacional de Seguridad Pública.
- Presidencia: Diálogo Social, becas universitarias y prioridades públicas.
- Ministerio de Educación y Cultura: Universidad de la Educación.
- Ministerio de Ambiente: gestión sostenible del agua subterránea.
- El País América: IA regional, deepfakes electorales y minerales críticos.
- Stanford Encyclopedia of Philosophy: conciencia, diseño y teología natural.
- UNESCO: ética de la inteligencia artificial.

Las fuentes aportan el hecho o contexto que origina el debate. No se presentan como respaldo de una de las dos posturas.

## Avance funcional de etapa 3

- Cada tema de actualidad puede incluir nota editorial y múltiples fuentes.
- Las fuentes aparecen durante la preparación tanto en modo individual como en modo mesa.
- Los enlaces se abren aparte para no interrumpir la sala.
- La interfaz aclara expresamente que la fuente no decide qué postura gana.
- La estructura es opcional, por lo que las premisas clásicas siguen funcionando sin cambios.
- Se agregó `/topics`, un explorador público con búsqueda, filtro por categoría, intensidad, posturas y fuentes.
