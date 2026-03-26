export type Fallacy = {
    id: string;
    name: string;
    technicalName: string;
    definition: string;
    example: string;
};

export const fallacies: Fallacy[] = [
    {
        id: "f1",
        name: "Ataque personal",
        technicalName: "Ad hominem",
        definition: "Atacar a la persona en vez de responder el argumento",
        example: "“No le hagas caso, si ese tipo es un idiota”"
    },
    {
        id: "f2",
        name: "Distorsionar lo que dijo el otro",
        technicalName: "Hombre de paja",
        definition: "Deformar el argumento del otro para hacerlo más fácil de atacar",
        example: "“Ah, o sea que vos querés prohibir internet”"
    },
    {
        id: "f3",
        name: "O una cosa o la otra",
        technicalName: "Falso dilema / Falsa dicotomía",
        definition: "Presentar solo dos opciones cuando en realidad hay más",
        example: "“O estás con nosotros o estás contra nosotros”"
    },
    {
        id: "f4",
        name: "Sacar una regla por pocos casos",
        technicalName: "Generalización apresurada",
        definition: "Concluir algo general a partir de pocos ejemplos",
        example: "“Conocí dos políticos corruptos, así que todos lo son”"
    },
    {
        id: "f5",
        name: "Porque lo dijo alguien importante",
        technicalName: "Apelación a la autoridad",
        definition: "Dar algo por cierto solo porque lo dijo alguien famoso o prestigioso",
        example: "“Debe ser verdad, lo dijo un doctor en la tele”"
    },
    {
        id: "f6",
        name: "Golpear con emoción en vez de razonar",
        technicalName: "Apelación a la emoción",
        definition: "Intentar convencer usando emoción en vez de razones",
        example: "“Si no apoyás esto, no te importa la gente”"
    },
    {
        id: "f7",
        name: "Esto termina en desastre",
        technicalName: "Pendiente resbaladiza",
        definition: "Decir que un paso pequeño lleva inevitablemente a un extremo",
        example: "“Si permitimos esto, después va a ser un caos total”"
    },
    {
        id: "f8",
        name: "Pasó después, así que fue por eso",
        technicalName: "Causa falsa / Post hoc",
        definition: "Asumir causalidad solo porque una cosa ocurrió antes que otra",
        example: "“Desde que usa ese celular duerme mal, así que el celular es la causa”"
    },
    {
        id: "f9",
        name: "Vos también",
        technicalName: "Tu quoque",
        definition: "Responder acusando al otro de lo mismo, en vez de responder el argumento",
        example: "“¿Y vos me hablás de mentir, si vos también mentiste?”"
    },
    {
        id: "f10",
        name: "Demostrame que no",
        technicalName: "Carga de la prueba",
        definition: "Exigir que el otro refute algo, en vez de justificarlo uno mismo",
        example: "“Demostrame que los fantasmas no existen”"
    },
    {
        id: "f11",
        name: "Es así porque es así",
        technicalName: "Petición de principio / Razonamiento circular",
        definition: "Usar como prueba lo mismo que se quiere demostrar",
        example: "“Esta norma es justa porque es la correcta”"
    },
    {
        id: "f12",
        name: "Cambiar de tema para escapar",
        technicalName: "Red herring / Cortina de humo",
        definition: "Desviar la discusión para no responder",
        example: "“Sí, pero el verdadero problema acá es otra cosa”"
    }
];

export const getFallacies = (): Fallacy[] => {
    return fallacies;
};
