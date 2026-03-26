export type TopicIntensity = "liviano" | "medio" | "filoso";

export type Topic = {
    id: string;
    intensity: TopicIntensity;
    category: string;
    statement: string;
    context: string;
    angleA: string;
    angleB: string;
    prompts: string[];
};

export const topics: Topic[] = [
    // --- LIVIANOS ---
    {
        id: "l1", intensity: "liviano", category: "Tecnología",
        statement: "Las redes sociales hacen más mal que bien.",
        context: "Vivimos conectados, pero los problemas de ansiedad y aislamiento aumentan.",
        angleA: "Las redes aíslan y generan ansiedad.", angleB: "Las redes conectan y dan voz a todos.",
        prompts: ["¿Cuántas veces abres Instagram por inercia?", "¿Conociste a alguien importante gracias a internet?"]
    },
    {
        id: "l2", intensity: "liviano", category: "Hábitos",
        statement: "El celular nos distrae demasiado.",
        context: "El promedio de uso diario del celular sigue subiendo cada año.",
        angleA: "Perdimos la capacidad de aburrirnos y pensar.", angleB: "Es nuestra principal herramienta de trabajo y ocio.",
        prompts: ["¿Puedes estar una hora sin mirar la pantalla?", "¿No es el celular la nueva biblioteca?"]
    },
    {
        id: "l3", intensity: "liviano", category: "Cultura",
        statement: "Leer es mejor que mirar resúmenes.",
        context: "Formatos rápidos como TikTok o hilos de Twitter reemplazan la lectura de libros.",
        angleA: "El resumen pierde la profundidad de la obra.", angleB: "Lo importante es llevarse la idea, el formato no importa.",
        prompts: ["¿Cuándo fue la última vez que terminaste un libro completo?", "¿Acaso no aprendés más viendo un gran documental?"]
    },
    {
        id: "l4", intensity: "liviano", category: "Sociedad",
        statement: "La gente opina sin saber.",
        context: "Todos se sienten con el derecho a opinar sobre temas que desconocen.",
        angleA: "Las opiniones sin fundamento restan valor.", angleB: "Todas las voces enriquecen el debate público.",
        prompts: ["¿Por qué opinamos de fútbol o política sin ser expertos?", "¿Acaso solo los académicos tienen derecho a hablar?"]
    },
    {
        id: "l5", intensity: "liviano", category: "Comunicación",
        statement: "Tener razón no sirve si no sabés explicarla.",
        context: "Muchas discusiones se pierden por mala comunicación.",
        angleA: "La forma es tan importante como el fondo.", angleB: "La verdad se defiende sola aunque esté mal explicada.",
        prompts: ["¿Te ha pasado de perder un debate teniendo razón?", "¿Una mentira bien contada vale más que una verdad aburrida?"]
    },
    {
        id: "l6", intensity: "liviano", category: "Hábitos",
        statement: "Discutir por internet casi nunca sirve.",
        context: "Las redes están llenas de peleas que no cambian la opinión de nadie.",
        angleA: "Es una pérdida de tiempo sin diálogo real.", angleB: "Es la única forma pública de marcar posiciones.",
        prompts: ["¿Alguna vez cambiaste de idea por un comentario de Facebook?", "¿No es útil leer cómo argumentan los demás?"]
    },
    {
        id: "l7", intensity: "liviano", category: "Costumbres",
        statement: "Está mal mirar el celular en la comida.",
        context: "Sentarse a comer con el celular al lado es cada vez más frecuente.",
        angleA: "Es una falta de respeto al que está presente.", angleB: "Es una costumbre normal que ya debemos aceptar.",
        prompts: ["¿Qué sentís cuando el otro mira el teléfono mientras hablás?", "¿Acaso nadie lee el diario en el desayuno?"]
    },
    {
        id: "l8", intensity: "liviano", category: "Tecnología",
        statement: "La inteligencia artificial nos vuelve más vagos.",
        context: "ChatGPT y otras herramientas hacen el trabajo pesado por nosotros.",
        angleA: "Perdemos la habilidad de investigar y redactar.", angleB: "Nos libera para hacer tareas más creativas.",
        prompts: ["¿Recuerdas cómo hacer una ecuación a mano?", "¿Usar calculadora nos hizo más tontos?"]
    },
    {
        id: "l9", intensity: "liviano", category: "Comunicación",
        statement: "Hoy la gente escucha menos de lo que habla.",
        context: "Parece que todos quieren transmitir su mensaje, pero nadie escucha al otro.",
        angleA: "Solo pensamos en qué responder, no en entender.", angleB: "En realidad ahora tenemos más medios para ser escuchados.",
        prompts: ["¿Escuchás para entender o para responder?", "¿El problema no será que los demás son aburridos?"]
    },
    {
        id: "l10", intensity: "liviano", category: "Salud Mental",
        statement: "Los videos cortos arruinan la atención.",
        context: "El formato TikTok está entrenando a cerebros para no soportar videos largos.",
        angleA: "Destruye la capacidad de enfocarse.", angleB: "Es solo la evolución natural del entretenimiento.",
        prompts: ["¿Cuánto te cuesta ver una película de 3 horas?", "¿Y si la gente valora más su tiempo ahora?"]
    },
    {
        id: "l11", intensity: "liviano", category: "Educación",
        statement: "La escuela debería enseñar a debatir.",
        context: "Se fomenta la memorización, pero poco el intercambio de ideas opuestas.",
        angleA: "El debate enseña pensamiento crítico vital.", angleB: "Hay conocimientos más urgentes y técnicos por enseñar.",
        prompts: ["¿Qué te enseñó la escuela sobre argumentar?", "¿Debatir en clase no generaría solo más conflictos inútiles?"]
    },
    {
        id: "l12", intensity: "liviano", category: "Sociedad",
        statement: "La gente confunde fama con verdad.",
        context: "Los influencers muchas veces tienen más autoridad que los expertos.",
        angleA: "Los seguidores no equivalen a tener razón.", angleB: "Si mucha gente escucha a alguien, algo de valor debe tener.",
        prompts: ["¿Le comprarías un suplemento a tu actor favorito?", "¿La influencia no es un tipo de validación social?"]
    },
    {
        id: "l13", intensity: "liviano", category: "Filosofía",
        statement: "Es mejor dudar que opinar rápido.",
        context: "Estar seguro de todo y rápido parece ser la norma en internet.",
        angleA: "La duda evita errores y fanatismo.", angleB: "La sobre-reflexión paraliza las decisiones.",
        prompts: ["¿Cuándo fue la última vez que dijiste 'No sé'?", "¿Se puede avanzar en la vida dudando de todo?"]
    },
    {
        id: "l14", intensity: "liviano", category: "Tecnología",
        statement: "Los algoritmos influyen demasiado.",
        context: "Las plataformas deciden qué vemos y, en parte, qué pensamos.",
        angleA: "Nos encierran en burbujas de confirmación.", angleB: "Simplemente nos muestran lo que realmente nos gusta.",
        prompts: ["¿Sentís que tu feed de Instagram refleja tus gustos genuinos?", "¿Preferís buscar todo a mano antes que te lo recomienden?"]
    },
    {
        id: "l15", intensity: "liviano", category: "Cultura",
        statement: "Estar siempre conectado nos vuelve menos presentes.",
        context: "Responder mensajes al instante parece una obligación moderna.",
        angleA: "Nunca estamos donde estamos físicamente.", angleB: "Es una forma moderna de ubicuidad y disponibilidad.",
        prompts: ["¿Te da ansiedad salir sin batería?", "¿Acaso estar físicamente presente asegura estar prestando atención?"]
    },
    {
        id: "l16", intensity: "liviano", category: "Tecnología",
        statement: "La tecnología nos hace más dependientes.",
        context: "Depender de GPS, recordatorios y apps para lo cotidiano.",
        angleA: "Perdemos habilidades básicas de supervivencia mental.", angleB: "Delegamos tareas automáticas para vivir mejor.",
        prompts: ["¿Sabés llegar a una dirección nueva sin GPS?", "¿Lavarías la ropa a mano por no 'depender' del lavarropas?"]
    },
    {
        id: "l17", intensity: "liviano", category: "Sociedad",
        statement: "Los debates públicos son demasiado simples.",
        context: "Periodismo y tv resumen problemas complejos en eslóganes.",
        angleA: "Subestiman la real complejidad de las cosas.", angleB: "Es la única manera de que todos entiendan de qué se habla.",
        prompts: ["¿Le prestás atención a discursos políticos largos?", "¿Se puede explicar economía en un tuit?"]
    },
    {
        id: "l18", intensity: "liviano", category: "Educación",
        statement: "Pensar bien vale más que memorizar.",
        context: "Todo está en Google, pero la escuela insiste en retener datos.",
        angleA: "El criterio para usar la información es lo que cuenta.", angleB: "Sin memoria base no hay materia prima para pensar.",
        prompts: ["¿Recordás las capitales de Europa?", "¿Se puede tener buen criterio sin saber datos puros?"]
    },
    {
        id: "l19", intensity: "liviano", category: "Sociedad",
        statement: "Saber detectar falacias sirve de verdad.",
        context: "Conocer las trampas retóricas nos hace mejores críticos.",
        angleA: "Evita que nos manipulen tan fácil.", angleB: "Nadie discute en la vida real nombrando falacias en latín.",
        prompts: ["¿Notás cuando un vendedor te está engañando?", "¿De qué sirve marcar una falacia si no cae bien decirlo?"]
    },
    {
        id: "l20", intensity: "liviano", category: "Comportamiento",
        statement: "Muchas discusiones se ganan gritando, no razonando.",
        context: "En las discusiones de sobremesa, el más seguro suele llevarse la razón.",
        angleA: "El carisma y el volumen dominan la lógica.", angleB: "La razón pura, a la larga, siempre triunfa.",
        prompts: ["¿Quién suele ganar las peleas en los asados?", "¿Por qué convence un líder político, por sus gritos o sus ideas?"]
    },

    // --- MEDIOS ---
    {
        id: "m1", intensity: "medio", category: "Sociedad",
        statement: "Está bien cancelar a alguien por lo que dijo.",
        context: "La cultura de la cancelación penaliza económicamente a figuras públicas.",
        angleA: "Es una consecuencia justa por discursos dañinos.", angleB: "Es linchamiento público sin juicio previo.",
        prompts: ["¿Dejarías de ver a tu actor favorito si descubrís que es racista?", "¿Las palabras son suficientes para arruinar una carrera?"]
    },
    {
        id: "m2", intensity: "medio", category: "Política",
        statement: "La libertad de expresión debe tener límites.",
        context: "Algunos discursos incitan al odio o esparcen desinformación peligrosa.",
        angleA: "Si no hay límites, los discursos de odio de destruyen a la sociedad.", angleB: "Cualquier límite es censura disfrazada.",
        prompts: ["¿Alguien debería poder gritar 'fuego' en un cine lleno?", "¿Quién decide qué está bien decir y qué no?"]
    },
    {
        id: "m3", intensity: "medio", category: "Educación",
        statement: "La escuela debería enseñar lógica formal.",
        context: "Aprendemos a derivar, pero no aprendemos la estructura de un argumento válido.",
        angleA: "Es la base del pensamiento crítico y la toma de decisiones.", angleB: "Es un tema abstracto y elitista, no sirve para el día a día.",
        prompts: ["¿Cómo resolvés contradicciones en noticias falsas?", "¿Preferís que los chicos aprendan código o lógica?"]
    },
    {
        id: "m4", intensity: "medio", category: "Sociedad",
        statement: "Los expertos tienen demasiado poder.",
        context: "Delegamos cada vez más decisiones vitales en especialistas y comités organizadores.",
        angleA: "Deciden sobre la vida de personas que no los eligieron.", angleB: "Son quienes realmente saben cómo resolver los problemas grandes.",
        prompts: ["¿Los médicos deben decidir las leyes de salud pública?", "¿A quién preferís pilotando el avión, a un experto o a alguien popular?"]
    },
    {
        id: "m5", intensity: "medio", category: "Economía",
        statement: "La meritocracia es un cuento.",
        context: "La idea de que con esfuerzo todo se logra es promovida por el éxito.",
        angleA: "Ignora completamente los privilegios y el punto de partida.", angleB: "Es el único motor de recompensa justo por el esfuerzo personal.",
        prompts: ["¿El que es pobre es porque quiere?", "¿Negar el mérito no invita a la mediocridad?"]
    },
    {
        id: "m6", intensity: "medio", category: "Psicología",
        statement: "La gente cree más lo que quiere que lo que es verdad.",
        context: "Ante nueva evidencia, las personas reafirman sus creencias originales.",
        angleA: "Las creencias son identitarias, los datos no importan.", angleB: "El ser humano puede evolucionar cuando se enfrenta a los hechos.",
        prompts: ["¿Alguna vez te costó cambiar de opinión ante datos claros?", "¿Por qué seguimos creyendo en horóscopos?"]
    },
    {
        id: "m7", intensity: "medio", category: "Ética",
        statement: "Está bien mentir para evitar daño.",
        context: "Mentiras piadosas para proteger a seres queridos o evitar conflictos mayores.",
        angleA: "La intención importa más que el hecho de no decir la verdad entera.", angleB: "La mentira rompe la confianza de forma irreversible.",
        prompts: ["¿Le dirías a un enfermo terminal lo grave que está?", "¿Preferís una verdad dolorosa o una mentira útil?"]
    },
    {
        id: "m8", intensity: "medio", category: "Sociedad",
        statement: "Las emociones pesan más que los hechos.",
        context: "Las campañas de desinformación usan los miedos y el orgullo.",
        angleA: "La razón es esclava de las pasiones en todas las decisiones reales.", angleB: "Son los hechos técnicos los que al final resuelven las pandemias o guerras.",
        prompts: ["¿Qué te convence más para donar: estadística o la foto de una persona?", "¿Puede existir una política puramente racional?"]
    },
    {
        id: "m9", intensity: "medio", category: "Justicia",
        statement: "El castigo no siempre hace justicia.",
        context: "Se envían personas a prisión, pero el crimen no baja ni las víctimas sanan.",
        angleA: "El castigo busca infligir dolor, no solucionar el problema de fondo.", angleB: "Es la única forma disuasoria realista que entiende el mundo del crimen.",
        prompts: ["¿Meter a un joven a prisión lo ayuda a dejar de robar?", "¿Cualquiera que robe debe sufrir una carga por lo que hizo?"]
    },
    {
        id: "m10", intensity: "medio", category: "Tecnología",
        statement: "La inteligencia artificial debería moderar contenidos.",
        context: "Plataformas filtran agresiones o desnudos usando redes neuronales.",
        angleA: "Es la única forma escalable de limpiar espacios repletos de odio.", angleB: "Darle a un programa el monopolio editorial es el fin de la expresión autónoma.",
        prompts: ["¿Una IA sabe diferenciar sarcasmo de un insulto de verdad?", "¿Preferís humanos sesgados decidiendo qué postear?"]
    },
    {
        id: "m11", intensity: "medio", category: "Sociedad",
        statement: "La verdad importa menos que el relato.",
        context: "Las elecciones las gana quien arma la narrativa más coherente.",
        angleA: "El marco conceptual vence a los datos estadísticos repetidos.", angleB: "Al final del día, los relatos caen si no tienen verdades firmes que los empujen.",
        prompts: ["¿Por qué todos recuerdan las promesas y no la gestión de sus políticos?", "¿Hasta cuándo puede sobrevivir un relato falso en el poder?"]
    },
    {
        id: "m12", intensity: "medio", category: "Tecnología",
        statement: "El algoritmo decide demasiado por nosotros.",
        context: "Desde a quién votar hasta con quién tener una cita y qué canción escuchar.",
        angleA: "Tercerizamos nuestras decisiones vitales por completa vagancia mental.", angleB: "Solo hacen el trabajo sucio optimizando la abrumadora cantidad de opciones disponibles.",
        prompts: ["¿Cómo encontraste la última canción que te gustó?", "¿Realmente sabrías qué película ver sin recomendaciones?"]
    },
    {
        id: "m13", intensity: "medio", category: "Filosofía Laboral",
        statement: "El trabajo no debería definir quién sos.",
        context: "Culturalmente se asocia el valor de una persona con su empleo y su salario.",
        angleA: "Somos mucho más que lo que hacemos para ganar dinero.", angleB: "Pasamos un tercio de la vida trabajando; lógicamente define gran parte de nuestra identidad.",
        prompts: ["¿Por qué lo primero que te preguntan en una fiesta es 'a qué te dedicás'?", "¿Un pintor dejaría de pintar si tuviera dinero infinito?"]
    },
    {
        id: "m14", intensity: "medio", category: "Comportamiento Humano",
        statement: "La obediencia hace más daño que bien.",
        context: "Acato ciego sin dudar, por simple respeto ciego a la jerarquía.",
        angleA: "Los mayores desastres históricos fueron causados por personas que solo seguían órdenes.", angleB: "Sin obediencia a roles y sistemas entramos en una salvaje anarquía y anulación del orden vital.",
        prompts: ["¿Cruzarías un semáforo en rojo si nadie te viera?", "¿Las escuelas fomentan orden o matan el cuestionamiento?"]
    },
    {
        id: "m15", intensity: "medio", category: "Filosofía General",
        statement: "La neutralidad casi no existe.",
        context: "Las personas se autodenominan objetivas, neutrales e imparciales al opinar.",
        angleA: "Toda decisión y toda inacción arrastran siempre un sesgo gigantesco predeterminado.", angleB: "Es posible observar los hechos absteniéndose de tomar partido si hay disciplina mental.",
        prompts: ["¿Cuando dos partes de una guerra discuten, existe un moderador justo?", "¿No tomar postura ante una agresión no es apoyar disimuladamente a algún lado?"]
    },

    // --- FILOSOS ---
    {
        id: "f1", intensity: "filoso", category: "Religión",
        statement: "La religión hace más mal que bien.",
        context: "Por siglos se han justificado guerras y acciones de paz en su nombre.",
        angleA: "Ha frenado el progreso y generado odio infinito.", angleB: "Es la base de la moral y el mayor refugio de la humanidad.",
        prompts: ["¿Cuántas guerras existieron buscando imponer a un dios?", "¿Acaso no es la religión la que contiene a los más vulnerables hoy?"]
    },
    {
        id: "f2", intensity: "filoso", category: "Sociedad",
        statement: "La política divide más de lo que ayuda.",
        context: "Sociedades en todo el mundo parecen más rotas que nunca por ideologías.",
        angleA: "Solo sirve para enfrentar gente y conservar el poder.", angleB: "Es la única herramienta sin balas para organizar un país.",
        prompts: ["¿Podés tener una cena familiar tranquila hablando de política?", "¿Qué alternativa existe para no matarnos entre todos?"]
    },
    {
        id: "f3", intensity: "filoso", category: "Derechos",
        statement: "La censura a veces está justificada.",
        context: "Opiniones peligrosas o falsas se esparcen en segundos por internet.",
        angleA: "Hay ideas tan peligrosas que no deben circular.", angleB: "Darle el botón de apagar la voz al Estado es suicida.",
        prompts: ["¿Dejarías circular libremente un tutorial para armar bombas?", "¿Quién será el juez supremo que decida qué es 'peligroso'?"]
    },
    {
        id: "f4", intensity: "filoso", category: "Economía",
        statement: "La desigualdad nunca va a desaparecer.",
        context: "Todos los modelos económicos intentan solucionar esto y siempre quedan los ricos.",
        angleA: "Es una condición natural de los talentos desparejos.", angleB: "Es un diseño a propósito de los que tienen el capital.",
        prompts: ["¿Si nos dieran 100 dólares a todos, no terminaría uno teniendo todo al final del año?", "¿Realmente la pobreza existe porque falta dinero o porque sobra avaricia?"]
    },
    {
        id: "f5", intensity: "filoso", category: "Salud Pública",
        statement: "El aborto debería ser legal en todos los casos.",
        context: "Un conflicto puro entre el derecho individual y la protección de la vida en desarrollo.",
        angleA: "Nadie puede obligar a otro humano a ser una incubadora.", angleB: "La persona por nacer tiene el mismo derecho fundamental de existir.",
        prompts: ["¿A quién le pertenece el cuerpo, al Estado o a la persona?", "¿Cuándo exacta y biológicamente una célula pasa a tener derechos humanos?"]
    },
    {
        id: "f6", intensity: "filoso", category: "Justicia",
        statement: "La pena de muerte debería existir.",
        context: "Violadores o asesinos en serie viven mantenidos por impuestos toda su vida.",
        angleA: "Hay monstruos que pierden su derecho a respirar.", angleB: "Ningún sistema judicial es perfecto; asesinar inocentes por error es fatal.",
        prompts: ["¿Qué harías si un psicópata daña a tu familia?", "¿Le darías al Estado corrupto el poder legal de matarte?"]
    },
    {
        id: "f7", intensity: "filoso", category: "Geopolítica",
        statement: "El terrorismo nunca se justifica.",
        context: "Ataques contra civiles a cambio de atención política y poder desesperado.",
        angleA: "Atacar civiles desarmados es la cobardía máxima.", angleB: "Para los oprimidos aplastados, es el único grito que los grandes escuchan.",
        prompts: ["¿Toda violencia es terrorismo o solo la de los pobres?", "¿Acaso los próceres de la independencia no atacaron también sin piedad?"]
    },
    {
        id: "f8", intensity: "filoso", category: "Ética",
        statement: "Torturar a un terrorista para salvar vidas puede estar bien.",
        context: "El clásico dilema de la bomba de tiempo escondida en una ciudad.",
        angleA: "Salvar millones justifica sacrificar la integridad física del culpable.", angleB: "Si el sistema avala torturar, perdimos la dignidad como civilización.",
        prompts: ["¿Prefieres mil inocentes muertos o un asesino lastimado?", "¿Un Estado civilizado que tortura se vuelve exactamente a lo que combate?"]
    },
    {
        id: "f9", intensity: "filoso", category: "Poder",
        statement: "El poder siempre termina corrompiendo.",
        context: "Se dice que el líder perfecto intachable tarde o temprano hace trampa.",
        angleA: "Nadie aguanta la tentación infinita de controlarlo todo.", angleB: "El poder no te corrompe; solo saca a la luz quién eras en realidad.",
        prompts: ["¿Serías cien por ciento justo si fueras el dueño de tu país?", "¿El poder te hace perverso o a los perversos les fascina el poder?"]
    },
    {
        id: "f10", intensity: "filoso", category: "Verdad",
        statement: "La verdad importa menos que la ideología.",
        context: "Gente ignorando videos y hechos reales solo para proteger su grupo.",
        angleA: "Elegimos el clan frente al dato porque el clan nos abriga.", angleB: "Al final, si negás que viene un tren igual te aplasta.",
        prompts: ["¿Alguna vez defendiste algo indefendible solo para no darle la razón al rival?", "¿Puede un país sobrevivir viviendo en narrativas irreales constantes?"]
    },
    {
        id: "f11", intensity: "filoso", category: "Moral",
        statement: "La moral depende de la época.",
        context: "Crímenes gravísimos de hoy eran aplaudidos como rutinarios hace ochenta años.",
        angleA: "El bien y el mal son apenas modas y acuerdos temporales que rotan.", angleB: "Hay crueldades que siempre fueron malas, solo que éramos demasiado incivilizados para verlo.",
        prompts: ["¿Nuestros abuelos eran crueles o solo aplicaban reglas distintas?", "¿Existe algo que sea universal e indiscutiblemente malo en cualquier época?"]
    },
    {
        id: "f12", intensity: "filoso", category: "Gobernanza",
        statement: "La democracia no siempre produce lo mejor.",
        context: "Resultados electorales desastrosos elegidos legalmente por inmensas mayorías.",
        angleA: "Decidir el futuro por voto ciego cuando la mitad no entiende de política es un peligro.", angleB: "Cualquier error en conjunto sigue siendo preferible al mejor acierto de un totalitario.",
        prompts: ["¿Dejarías el mando de tu avión a votación de los pasajeros?", "¿Si no es por voto general, qué examen de IQ le tomamos a la población?"]
    },
    {
        id: "f13", intensity: "filoso", category: "Libre Albedrío",
        statement: "El libre albedrío es una ilusión.",
        context: "Tu historia, genética y química deciden por ti segundos antes de que lo notes.",
        angleA: "Somos solo máquinas orgánicas respondiendo ciegamente a estímulos cósmicos.", angleB: "Sin libertad fundamental no hay forma ni derecho de castigar responsabilizando a nadie.",
        prompts: ["¿Elegiste orgánicamente nacer ahí y ser exactamente quien sos hoy?", "¿Si no sos libre, para qué corno usamos las cárceles y la justicia penal?"]
    },
    {
        id: "f14", intensity: "filoso", category: "Genética",
        statement: "Somos más biología que decisión.",
        context: "Genes directos que te programan y predisponen irrefutablemente a ser agresivo o pacífico.",
        angleA: "Tus químicos deciden rápido; tu mente solo es el copiloto justificando.", angleB: "Sobre la química animal natural, tu voluntad debe levantar los frenos necesarios.",
        prompts: ["¿Qué culpa final tendría un asesino si un coágulo anuló empatía de nacimiento?", "¿Un psicópata frío y nato es un criminal culpable o un paciente desafortunado?"]
    },
    {
        id: "f15", intensity: "filoso", category: "Determinismo",
        statement: "Nadie elige realmente quién termina siendo.",
        context: "Variables extremas incontrolables como familia, barrio y abusos que te golpearon de niño.",
        angleA: "La cuna aleatoria ciega en la que caíste es el pasillo inexorable de tu tope de vida.", angleB: "Cientos de miles de huérfanos destrozados rompen con éxito esa excusa barata del destino.",
        prompts: ["¿Tu moral y éxito se lo debes a tu esfuerzo o a la salud mental de tus padres?", "¿La persona pobre es víctima de su entorno triste o gestor de su vida?"]
    },
    {
        id: "f16", intensity: "filoso", category: "Derecho Criminológico",
        statement: "El castigo sirve más para vengarse que para reparar.",
        context: "Prisiones repletas infrahumanas que devuelven personas mucho más arruinadas que al entrar.",
        angleA: "Recluirlos castigando el cuerpo expone nuestra sed cruda social de venganza visceral inútil.", angleB: "Es la única cuenta de compensación ejemplar dolorosa y visible para la paz rota de la víctima.",
        prompts: ["¿Realmente rehabilitarías de forma amorosa al hombre que destruyó a tu familia a palos?", "¿O sentirías más paz íntima y justicia con él sufriendo atado su merecido innegable en una celda oscura?"]
    },
    {
        id: "f17", intensity: "filoso", category: "Política Integral",
        statement: "La religión debería quedar fuera de la política.",
        context: "Países enteros promulgando leyes apoyados puramente en escrituras místicas antiguas intocables.",
        angleA: "Cruzar un dogma sagrado ciego institucional frena de golpe la imparcialidad del derecho civil de todos.", angleB: "Imposible cortar al hombre; toda política sana mundial basó su justicia civil original copiando religiones.",
        prompts: ["¿Perdonarías cívicamente que tu presidente rechace una pandemia y confíe en sus ángeles ministeriales?", "¿Te incomoda saber que los derechos intocables de tu país civilizado son apenas copia calcada cristiana?"]
    },
    {
        id: "f18", intensity: "filoso", category: "Igualdad",
        statement: "La igualdad real exige quitar privilegios por la fuerza.",
        context: "Leyes y discursos limpios no tocan jamás la brutal y hereditaria concentración milenaria de tierra.",
        angleA: "La aristocracia y fortuna gigante nadie la suelta hasta que el poder coactivo se la expropia.", angleB: "Violentar a la gente quitándoles riqueza por la fuerza comunista concluyó innegablemente en puro holocausto de hambre.",
        prompts: ["¿Si de la nada mañana fueses el dueño del setenta por ciento exacto mundial, darías el cincuenta a los marginados?", "¿Es justo quitar por asalto fiscal a la persona emprendedora lo que supo juntar con crudo ingenio de años?"]
    },
    {
        id: "f19", intensity: "filoso", category: "Ética y Manipulación",
        statement: "A veces manipular a la gente está justificado.",
        context: "Psicología o diseño persuasivo para controlar sutilmente elecciones erróneas fatales de las mayorías.",
        angleA: "Evita colosales problemas masivos guiando a millones de irracionales y cegados necios torpes y estúpidos.", angleB: "Manosear decisiones libres y cívicas rompe la pura línea sagrada asombrosa que nos separa intelectualmente de dictaduras ciegas.",
        prompts: ["¿Apoyarías medicar en silencio el agua de una ciudad peligrosa si curas biológicamente al cien por ciento toda violación?", "¿Está bien que un político bueno utilice engaño puro técnico y crudo si sabe y confía que va a dar asilo justo a miles?"]
    },
    {
        id: "f20", intensity: "filoso", category: "Límites Asépticos",
        statement: "Hay ideas que no deberían poder decirse en público.",
        context: "Agrupaciones con filosofías extremas raciales apología masiva fascista usando estadios y canales de televisión impunes.",
        angleA: "Silenciar veneno directo de nacimiento previene infecciones colectivas fascistas fatales mortales cívico.", angleB: "El sol es el único que desinfecta y la estupidez racista muere expoliándose públicamente expuesta libre bajo los reflectores fríos.",
        prompts: ["¿Prohibirías totalmente un partido innegable neo-nazi local mandando obligatoriamente a sus ciegos miembros asombrosos a oscuridad secreta?", "¿Acaso no fue silenciar cobardemente siempre la técnica original misma de todo asqueroso y nefasto asombroso tirano histórico?"]
    }
];

export const getTopics = (): Topic[] => {
    return topics;
};
