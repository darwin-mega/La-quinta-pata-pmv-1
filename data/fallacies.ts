export type FallacyLevel = "base" | "intermedia" | "avanzada";

export type Fallacy = {
    id: string;
    level: FallacyLevel;
    name: string;
    technicalName: string;
    conceptKey: string;
    definition: string;
    example: string;
};

export const fallacies: Fallacy[] = [
    // --- BASE ---
    {
        id: "f1",
        level: "base",
        name: "Al jugador, no a la pelota",
        technicalName: "Ad hominem",
        conceptKey: "personal_attack",
        definition: "Atacar a la persona que habla en lugar de responder a su argumento o razonamiento.",
        example: "“¿Cómo vas a saber de economía vos, si ni siquiera terminaste la facultad?”"
    },
    {
        id: "f2",
        level: "base",
        name: "Peleando con fantasmas",
        technicalName: "Hombre de paja",
        conceptKey: "misrepresentation",
        definition: "Ridiculizar o deformar lo que dijo el otro para que sea más fácil de atacar.",
        example: "“A: Creo que deberíamos cuidar el agua. B: Ah, o sea que querés que volvamos a la edad de piedra.”"
    },
    {
        id: "f3",
        level: "base",
        name: "Blanco o negro",
        technicalName: "Falso dilema",
        conceptKey: "false_choices",
        definition: "Presentar solo dos opciones extremas como si no existiera un punto medio o más alternativas.",
        example: "“O bajamos los impuestos a cero o el país se funde mañana mismo.”"
    },
    {
        id: "f6",
        level: "base",
        name: "El golpe bajo",
        technicalName: "Apelación a la emoción",
        conceptKey: "emotional_substitution",
        definition: "Intentar ganar una discusión usando sentimientos (miedo, lástima, culpa) en lugar de lógica.",
        example: "“Si no aprobás esta ley, imaginate el llanto de todos los niños que se van a quedar sin nada.”"
    },
    {
        id: "f7",
        level: "base",
        name: "Te fuiste al pasto",
        technicalName: "Pendiente resbaladiza",
        conceptKey: "unsupported_chain",
        definition: "Sostener que un pequeño paso hoy nos llevará inevitablemente a un desastre total en el futuro.",
        example: "“Si dejamos que hoy lleguen tarde 5 minutos, mañana nadie va a venir a trabajar.”"
    },
    {
        id: "f4",
        level: "base",
        name: "Eso no prueba nada",
        technicalName: "Generalización apresurada",
        conceptKey: "small_sample",
        definition: "Sacar una conclusión general basada en uno o dos casos aislados que no son representativos.",
        example: "“Mi primo se curó tomando té de ruda, así que ese té cura cualquier enfermedad.”"
    },
    
    // --- INTERMEDIAS ---
    {
        id: "f5",
        level: "intermedia",
        name: "Porque lo digo yo",
        technicalName: "Apelación a la autoridad",
        conceptKey: "status_authority",
        definition: "Dar algo por cierto solo porque lo dijo alguien famoso o influyente, aunque no sea experto en el tema.",
        example: "“Es verdad porque lo dijo este Influencer que tiene millones de seguidores.”"
    },
    {
        id: "f13",
        level: "intermedia",
        name: "Todos lo hacen",
        technicalName: "Ad populum",
        conceptKey: "popularity",
        definition: "Sostener que algo es correcto o verdadero solo porque la mayoría de la gente lo cree o lo hace.",
        example: "“Si todo el mundo tira basura en la calle, no puede estar tan mal.”"
    },
    {
        id: "f9",
        level: "intermedia",
        name: "Vos también",
        technicalName: "Tu quoque",
        conceptKey: "hypocrisy_deflection",
        definition: "Evadir una crítica acusando al otro de hacer lo mismo, en lugar de defenderse con argumentos.",
        example: "“¿Me decís que no mienta? Pero si vos mentiste la semana pasada con lo del examen.”"
    },
    {
        id: "f12",
        level: "intermedia",
        name: "Cambiame el tema",
        technicalName: "Red herring",
        conceptKey: "distraction",
        definition: "Introducir un tema nuevo e irrelevante para distraer de la discusión principal que se está perdiendo.",
        example: "“Sí, la inflación es alta, pero ¿vieron lo lindo que está el pasto en la plaza?”"
    },

    // --- AVANZADAS ---
    {
        id: "f8",
        level: "avanzada",
        name: "Una vez pasó, siempre pasa",
        technicalName: "Causa falsa / Post hoc",
        conceptKey: "temporal_causation",
        definition: "Asumir que porque algo pasó después de otra cosa, entonces esa primera cosa fue la causa.",
        example: "“Me puse estas medias y ganamos el partido, así que son mis medias de la suerte.”"
    },
    {
        id: "f14",
        level: "avanzada",
        name: "Dar vuelta la flecha",
        technicalName: "Afirmación del consecuente",
        conceptKey: "affirming_the_consequent",
        definition: "Suponer que, si una causa puede producir un resultado, encontrar ese resultado demuestra necesariamente aquella causa.",
        example: "Si llueve, la calle se moja. La calle está mojada, así que necesariamente llovió."
    },
    {
        id: "f15",
        level: "intermedia",
        name: "Probá que no",
        technicalName: "Inversión de la carga de la prueba",
        conceptKey: "burden_transfer",
        definition: "Exigir que los demás refuten una afirmación que quien la hace todavía no respaldó con evidencia.",
        example: "Los fantasmas existen. Si no me creés, demostrá que no existe ninguno."
    },
    {
        id: "f16",
        level: "base",
        name: "La calesita",
        technicalName: "Razonamiento circular",
        conceptKey: "circular_support",
        definition: "Usar la propia conclusión como prueba, repitiendo la misma idea con otras palabras sin aportar una razón independiente.",
        example: "Este medio siempre dice la verdad porque es confiable, y sabemos que es confiable porque siempre dice la verdad."
    },
    {
        id: "f17",
        level: "intermedia",
        name: "Elegir solo lo que conviene",
        technicalName: "Selección sesgada / Cherry picking",
        conceptKey: "selective_evidence",
        definition: "Mostrar únicamente los datos favorables e ignorar evidencia relevante que podría debilitar la conclusión.",
        example: "Este método funciona: te muestro los tres casos exitosos, pero no los cuarenta en que falló."
    },
    {
        id: "f18",
        level: "intermedia",
        name: "Nadie lo descartó",
        technicalName: "Apelación a la ignorancia",
        conceptKey: "absence_as_evidence",
        definition: "Dar algo por verdadero solo porque no se demostró falso, o por falso solo porque no se demostró verdadero.",
        example: "Nadie pudo probar que no nos visitaron extraterrestres; entonces seguro ocurrió."
    },
    {
        id: "f19",
        level: "avanzada",
        name: "Poner todo al mismo nivel",
        technicalName: "Falsa equivalencia",
        conceptKey: "invalid_equivalence",
        definition: "Tratar dos situaciones como si fueran comparables cuando sus diferencias relevantes cambian la evaluación.",
        example: "Llegar cinco minutos tarde y faltar una semana sin aviso son lo mismo: en ambos casos incumpliste."
    },
    {
        id: "f20",
        level: "intermedia",
        name: "Ya invertimos demasiado",
        technicalName: "Falacia del costo hundido",
        conceptKey: "sunk_cost",
        definition: "Defender que hay que continuar una decisión mala solo por el tiempo, dinero o esfuerzo ya gastados, aunque no puedan recuperarse.",
        example: "La película es insoportable, pero ya vimos dos horas; tenemos que terminarla."
    },
    {
        id: "f21",
        level: "avanzada",
        name: "De la parte al todo",
        technicalName: "Falacia de composición",
        conceptKey: "part_to_whole",
        definition: "Suponer que lo cierto para cada parte también tiene que ser cierto para el conjunto completo.",
        example: "Cada jugador del equipo es una estrella, así que necesariamente serán el mejor equipo."
    },
    {
        id: "f22",
        level: "avanzada",
        name: "Cambiar el sentido",
        technicalName: "Equívoco",
        conceptKey: "semantic_ambiguity",
        definition: "Usar una misma palabra con significados distintos dentro del argumento para que la conclusión parezca válida.",
        example: "Solo el ser humano es racional. Ninguna mujer es un hombre. Por lo tanto, ninguna mujer es racional."
    }
];

export const quickFallacyIds = ["f1", "f2", "f3", "f4", "f6", "f16"] as const;

export const fallacyDistinctions: Record<string, string> = {
    f1: "Se distingue de refutar una credencial relevante: aca se ataca a la persona en vez del argumento.",
    f2: "No cambia de tema: reemplaza la postura real por una version deformada y mas facil de atacar.",
    f3: "No concluye sin relacion; oculta alternativas para forzar una eleccion entre solo dos extremos.",
    f4: "Salta de pocos casos a una regla general; composicion, en cambio, salta de las partes al conjunto.",
    f5: "La fuente puede ser experta o famosa, pero su prestigio se usa como sustituto de razones y evidencia.",
    f6: "La emocion puede ser pertinente, pero se vuelve falacia cuando ocupa el lugar de la justificacion.",
    f7: "Predice una cadena inevitable sin justificar sus pasos; post hoc atribuye una causa por el orden temporal.",
    f8: "Confunde sucesion con causa: que B ocurra despues de A no demuestra que A produjo B.",
    f9: "No demuestra que la critica sea falsa; la esquiva señalando una incoherencia de quien critica.",
    f12: "Desvia la conversacion hacia algo irrelevante; el hombre de paja permanece en el tema pero deforma la postura.",
    f13: "Usa cantidad de seguidores como prueba; autoridad usa el prestigio de una persona o institucion.",
    f14: "Invierte una condicion: que A produzca B no significa que B solo pueda haber sido producido por A.",
    f15: "Traslada la obligacion de probar; apelacion a la ignorancia concluye que algo es cierto por falta de refutacion.",
    f16: "La razon ofrecida ya presupone la conclusion, de modo que el argumento no aporta apoyo independiente.",
    f17: "Oculta evidencia contraria de un conjunto disponible; generalizacion apresurada suele partir de una muestra insuficiente.",
    f18: "Convierte la ausencia de prueba en prueba; carga invertida se centra en quien debe justificar la afirmacion.",
    f19: "Compara casos como iguales ignorando diferencias decisivas; no es simplemente una conclusion desconectada.",
    f20: "Mira costos pasados irrecuperables en vez de beneficios y costos futuros de continuar.",
    f21: "Atribuye al todo propiedades de sus partes; no generaliza desde una muestra hacia todos los individuos.",
    f22: "La aparente logica depende de que una palabra cambie de significado durante el razonamiento.",
};

export const getFallacies = (level?: FallacyLevel | "all"): Fallacy[] => {
    if (!level || level === "all") return fallacies;
    return fallacies.filter(f => f.level === level);
};

export const getFallaciesByHierarchy = () => {
    return {
        base: fallacies.filter(f => f.level === "base"),
        intermedia: fallacies.filter(f => f.level === "intermedia"),
        avanzada: fallacies.filter(f => f.level === "avanzada"),
    };
};
