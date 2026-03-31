export const TOPIC_CATEGORY_OPTIONS = [
    { id: "ciencia", label: "Ciencia" },
    { id: "filosofia", label: "Filosofía" },
    { id: "sociedad", label: "Sociedad" },
    { id: "politica", label: "Política" },
    { id: "cultura_pop", label: "Cultura Pop" },
    { id: "tecnologia", label: "Tecnología" },
    { id: "historia", label: "Historia" },
    { id: "etica", label: "Ética" },
    { id: "relaciones", label: "Relaciones" },
    { id: "trabajo", label: "Trabajo" },
    { id: "educacion", label: "Educación" },
    { id: "actualidad", label: "Actualidad" },
] as const;

export const TOPIC_INTENSITY_OPTIONS = [
    { id: "baja", label: "Baja" },
    { id: "media", label: "Media" },
    { id: "alta", label: "Alta" },
    { id: "muy_alta", label: "Muy Alta" },
] as const;

export const TOPIC_MODE_OPTIONS = [
    { id: "system", label: "Sistema", description: "Usa solamente temas curados por el juego." },
    { id: "custom", label: "Personalizado", description: "Debatís únicamente temas cargados por la sala." },
    { id: "mixed", label: "Mixto", description: "Combina el catálogo del juego con tus propios temas." },
] as const;

export type TopicCategoryId = typeof TOPIC_CATEGORY_OPTIONS[number]["id"];
export type TopicIntensity = typeof TOPIC_INTENSITY_OPTIONS[number]["id"];
export type TopicMode = typeof TOPIC_MODE_OPTIONS[number]["id"];
export type TopicSource = "system" | "custom";
export type TopicMixStrategy = "balanced";

export type DebateTopic = {
    id: string;
    text: string;
    statement: string;
    category: string;
    categoryLabel: string;
    intensity: TopicIntensity;
    source: TopicSource;
    context: string;
    angleA: string;
    angleB: string;
    prompts: string[];
    enabled?: boolean;
};

export type CustomTopicInput = {
    id: string;
    text: string;
    category?: string;
    intensity?: TopicIntensity;
};

export type RoomTopicConfig = {
    mode: TopicMode;
    selectedCategories: string[];
    selectedIntensities: TopicIntensity[];
    customTopics: CustomTopicInput[];
    mixStrategy?: TopicMixStrategy;
};

export type TopicValidationResult = {
    isValid: boolean;
    errors: string[];
    systemCount: number;
    customCount: number;
    totalCount: number;
};

export const MIN_CUSTOM_TOPICS = 5;

export const DEFAULT_ROOM_TOPIC_CONFIG: RoomTopicConfig = {
    mode: "system",
    selectedCategories: [],
    selectedIntensities: [],
    customTopics: [],
    mixStrategy: "balanced",
};
