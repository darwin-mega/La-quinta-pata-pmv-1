export type FallacyLevel = "base" | "intermedia" | "avanzada";

export type Fallacy = {
    id: string;
    level: FallacyLevel;
    name: string;
    technicalName: string;
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
        definition: "Atacar a la persona que habla en lugar de responder a su argumento o razonamiento.",
        example: "“¿Cómo vas a saber de economía vos, si ni siquiera terminaste la facultad?”"
    },
    {
        id: "f2",
        level: "base",
        name: "Peleando con fantasmas",
        technicalName: "Hombre de paja",
        definition: "Ridiculizar o deformar lo que dijo el otro para que sea más fácil de atacar.",
        example: "“A: Creo que deberíamos cuidar el agua. B: Ah, o sea que querés que volvamos a la edad de piedra.”"
    },
    {
        id: "f3",
        level: "base",
        name: "Blanco o negro",
        technicalName: "Falso dilema",
        definition: "Presentar solo dos opciones extremas como si no existiera un punto medio o más alternativas.",
        example: "“O bajamos los impuestos a cero o el país se funde mañana mismo.”"
    },
    {
        id: "f6",
        level: "base",
        name: "El golpe bajo",
        technicalName: "Apelación a la emoción",
        definition: "Intentar ganar una discusión usando sentimientos (miedo, lástima, culpa) en lugar de lógica.",
        example: "“Si no aprobás esta ley, imaginate el llanto de todos los niños que se van a quedar sin nada.”"
    },
    {
        id: "f7",
        level: "base",
        name: "Te fuiste al pasto",
        technicalName: "Pendiente resbaladiza",
        definition: "Sostener que un pequeño paso hoy nos llevará inevitablemente a un desastre total en el futuro.",
        example: "“Si dejamos que hoy lleguen tarde 5 minutos, mañana nadie va a venir a trabajar.”"
    },
    {
        id: "f4",
        level: "base",
        name: "Eso no prueba nada",
        technicalName: "Generalización apresurada",
        definition: "Sacar una conclusión general basada en uno o dos casos aislados que no son representativos.",
        example: "“Mi primo se curó tomando té de ruda, así que ese té cura cualquier enfermedad.”"
    },
    
    // --- INTERMEDIAS ---
    {
        id: "f5",
        level: "intermedia",
        name: "Porque lo digo yo",
        technicalName: "Apelación a la autoridad",
        definition: "Dar algo por cierto solo porque lo dijo alguien famoso o influyente, aunque no sea experto en el tema.",
        example: "“Es verdad porque lo dijo este Influencer que tiene millones de seguidores.”"
    },
    {
        id: "f13",
        level: "intermedia",
        name: "Todos lo hacen",
        technicalName: "Ad populum",
        definition: "Sostener que algo es correcto o verdadero solo porque la mayoría de la gente lo cree o lo hace.",
        example: "“Si todo el mundo tira basura en la calle, no puede estar tan mal.”"
    },
    {
        id: "f9",
        level: "intermedia",
        name: "Vos también",
        technicalName: "Tu quoque",
        definition: "Evadir una crítica acusando al otro de hacer lo mismo, en lugar de defenderse con argumentos.",
        example: "“¿Me decís que no mienta? Pero si vos mentiste la semana pasada con lo del examen.”"
    },
    {
        id: "f12",
        level: "intermedia",
        name: "Cambiame el tema",
        technicalName: "Red herring",
        definition: "Introducir un tema nuevo e irrelevante para distraer de la discusión principal que se está perdiendo.",
        example: "“Sí, la inflación es alta, pero ¿vieron lo lindo que está el pasto en la plaza?”"
    },

    // --- AVANZADAS ---
    {
        id: "f8",
        level: "avanzada",
        name: "Una vez pasó, siempre pasa",
        technicalName: "Causa falsa / Post hoc",
        definition: "Asumir que porque algo pasó después de otra cosa, entonces esa primera cosa fue la causa.",
        example: "“Me puse estas medias y ganamos el partido, así que son mis medias de la suerte.”"
    },
    {
        id: "f14",
        level: "avanzada",
        name: "Nada que ver",
        technicalName: "Non sequitur",
        definition: "Llegar a una conclusión que no tiene ninguna relación lógica con las premisas anteriores.",
        example: "“Si hoy es martes, entonces deberíamos comprar un elefante.”"
    },
    {
        id: "f15",
        level: "intermedia",
        name: "Probá que no",
        technicalName: "Inversión de la carga de la prueba",
        definition: "Exigir que los demás refuten una afirmación que quien la hace todavía no respaldó con evidencia.",
        example: "Los fantasmas existen. Si no me creés, demostrá que no existe ninguno."
    },
    {
        id: "f16",
        level: "base",
        name: "La calesita",
        technicalName: "Razonamiento circular",
        definition: "Usar la propia conclusión como prueba, repitiendo la misma idea con otras palabras sin aportar una razón independiente.",
        example: "Este medio siempre dice la verdad porque es confiable, y sabemos que es confiable porque siempre dice la verdad."
    },
    {
        id: "f17",
        level: "intermedia",
        name: "Elegir solo lo que conviene",
        technicalName: "Selección sesgada / Cherry picking",
        definition: "Mostrar únicamente los datos favorables e ignorar evidencia relevante que podría debilitar la conclusión.",
        example: "Este método funciona: te muestro los tres casos exitosos, pero no los cuarenta en que falló."
    },
    {
        id: "f18",
        level: "intermedia",
        name: "Nadie lo descartó",
        technicalName: "Apelación a la ignorancia",
        definition: "Dar algo por verdadero solo porque no se demostró falso, o por falso solo porque no se demostró verdadero.",
        example: "Nadie pudo probar que no nos visitaron extraterrestres; entonces seguro ocurrió."
    },
    {
        id: "f19",
        level: "avanzada",
        name: "Poner todo al mismo nivel",
        technicalName: "Falsa equivalencia",
        definition: "Tratar dos situaciones como si fueran comparables cuando sus diferencias relevantes cambian la evaluación.",
        example: "Llegar cinco minutos tarde y faltar una semana sin aviso son lo mismo: en ambos casos incumpliste."
    },
    {
        id: "f20",
        level: "intermedia",
        name: "Ya invertimos demasiado",
        technicalName: "Falacia del costo hundido",
        definition: "Defender que hay que continuar una decisión mala solo por el tiempo, dinero o esfuerzo ya gastados, aunque no puedan recuperarse.",
        example: "La película es insoportable, pero ya vimos dos horas; tenemos que terminarla."
    },
    {
        id: "f21",
        level: "avanzada",
        name: "De la parte al todo",
        technicalName: "Falacia de composición",
        definition: "Suponer que lo cierto para cada parte también tiene que ser cierto para el conjunto completo.",
        example: "Cada jugador del equipo es una estrella, así que necesariamente serán el mejor equipo."
    },
    {
        id: "f22",
        level: "avanzada",
        name: "Cambiar el sentido",
        technicalName: "Equívoco",
        definition: "Usar una misma palabra con significados distintos dentro del argumento para que la conclusión parezca válida.",
        example: "Solo el ser humano es racional. Ninguna mujer es un hombre. Por lo tanto, ninguna mujer es racional."
    }
];

export const quickFallacyIds = ["f1", "f2", "f3", "f4", "f6", "f16"] as const;

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
