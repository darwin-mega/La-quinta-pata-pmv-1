import { topics as systemTopics } from "@/data/topics";
import {
    CustomTopicInput,
    DEFAULT_ROOM_TOPIC_CONFIG,
    DebateTopic,
    MAX_CUSTOM_TOPICS,
    MAX_CUSTOM_TOPIC_LENGTH,
    MIN_CUSTOM_TOPICS,
    RoomTopicConfig,
    SavedTopic,
    TOPIC_CATEGORY_OPTIONS,
    TOPIC_INTENSITY_OPTIONS,
    TOPIC_MODE_OPTIONS,
    TopicIntensity,
    TopicMode,
    TopicValidationResult,
} from "@/lib/topic-types";

const TOPIC_CATEGORY_IDS = new Set<string>(TOPIC_CATEGORY_OPTIONS.map(category => category.id));
const TOPIC_INTENSITY_IDS = new Set<string>(TOPIC_INTENSITY_OPTIONS.map(intensity => intensity.id));
const TOPIC_MODE_IDS = new Set<string>(TOPIC_MODE_OPTIONS.map(mode => mode.id));
const GAME_INTENSITY_MAP = {
    liviano: ["baja"],
    medio: ["media"],
    filoso: ["alta", "muy_alta"],
} as const;

type GameIntensityPreference = keyof typeof GAME_INTENSITY_MAP;

const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const shuffle = <T,>(items: T[]) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
};

const interleaveTopicPools = (systemPool: DebateTopic[], customPool: DebateTopic[]) => {
    if (systemPool.length === 0) return [...customPool];
    if (customPool.length === 0) return [...systemPool];

    const mixedPool: DebateTopic[] = [];
    const systemQueue = [...systemPool];
    const customQueue = [...customPool];
    let nextSource: "system" | "custom" = Math.random() < 0.5 ? "system" : "custom";

    while (systemQueue.length > 0 || customQueue.length > 0) {
        if (nextSource === "system") {
            mixedPool.push(systemQueue.shift() || customQueue.shift()!);
            nextSource = "custom";
            continue;
        }

        mixedPool.push(customQueue.shift() || systemQueue.shift()!);
        nextSource = "system";
    }

    return mixedPool;
};

const buildCustomDebateTopic = (topic: CustomTopicInput): DebateTopic => {
    const category = topic.category || "libre";
    const intensity = topic.intensity || "media";
    const text = normalizeText(topic.text);

    return {
        id: topic.id,
        text,
        statement: text,
        category,
        categoryLabel: getTopicCategoryLabel(category),
        intensity,
        source: "custom",
        context: "Tema propuesto por la sala. El foco sigue siendo cómo se argumenta y cómo se responde a la postura opuesta.",
        angleA: "Defiende la tesis principal del tema con ejemplos, criterios y consecuencias a favor.",
        angleB: "Cuestiona la tesis principal, marca límites y defiende la postura contraria con argumentos sólidos.",
        prompts: [
            "¿Qué ejemplo concreto vuelve más fuerte tu postura?",
            "¿Qué costo tendría aplicar esta idea en la práctica?",
            "¿Qué objeción seria debe responder la postura contraria?"
        ],
        enabled: true,
    };
};

const createGeneratedTopicId = (prefix: string, text: string) => {
    const slug = normalizeText(text)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);

    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return `${prefix}-${slug || "tema"}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${slug || "tema"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const getTopicCategoryLabel = (categoryId: string) => {
    const match = TOPIC_CATEGORY_OPTIONS.find(category => category.id === categoryId);
    if (match) return match.label;
    if (categoryId === "libre") return "Libre";
    return categoryId
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
};

export const getTopicIntensityLabel = (intensityId: TopicIntensity) => {
    return TOPIC_INTENSITY_OPTIONS.find(intensity => intensity.id === intensityId)?.label || intensityId;
};

export const getTopicModeLabel = (modeId: TopicMode) => {
    return TOPIC_MODE_OPTIONS.find(mode => mode.id === modeId)?.label || modeId;
};

export const getSystemTopicCounts = () => {
    const categoryCounts = Object.fromEntries(TOPIC_CATEGORY_OPTIONS.map(category => [category.id, 0]));
    const intensityCounts = Object.fromEntries(TOPIC_INTENSITY_OPTIONS.map(intensity => [intensity.id, 0]));

    systemTopics.forEach(topic => {
        if (topic.enabled === false) return;
        categoryCounts[topic.category] = (categoryCounts[topic.category] || 0) + 1;
        intensityCounts[topic.intensity] = (intensityCounts[topic.intensity] || 0) + 1;
    });

    return { categoryCounts, intensityCounts };
};

export const normalizeTopicConfigInput = (input: unknown): RoomTopicConfig => {
    const rawConfig = (input && typeof input === "object" ? input : {}) as Partial<RoomTopicConfig>;
    const rawMode = typeof rawConfig.mode === "string" ? rawConfig.mode : DEFAULT_ROOM_TOPIC_CONFIG.mode;

    const normalizedCustomTopics = Array.isArray(rawConfig.customTopics)
        ? rawConfig.customTopics
            .map((topic, index) => normalizeCustomTopicInput(topic, index))
            .filter((topic): topic is CustomTopicInput => !!topic)
        : [];

    const normalizedCategories = Array.isArray(rawConfig.selectedCategories)
        ? unique(
            rawConfig.selectedCategories
                .filter((category): category is string => typeof category === "string")
                .filter(category => TOPIC_CATEGORY_IDS.has(category))
        )
        : [];

    const normalizedIntensities = Array.isArray(rawConfig.selectedIntensities)
        ? unique(
            rawConfig.selectedIntensities
                .filter((intensity): intensity is TopicIntensity => typeof intensity === "string")
                .filter(intensity => TOPIC_INTENSITY_IDS.has(intensity))
        )
        : [];

    return {
        mode: TOPIC_MODE_IDS.has(rawMode) ? rawMode as TopicMode : DEFAULT_ROOM_TOPIC_CONFIG.mode,
        selectedCategories: normalizedCategories,
        selectedIntensities: normalizedIntensities,
        customTopics: normalizedCustomTopics,
        mixStrategy: "balanced",
    };
};

export const normalizeTopicText = (value: string) => normalizeText(value);

export const getTopicIntensitiesForGameIntensity = (intensity: GameIntensityPreference): TopicIntensity[] => {
    return [...GAME_INTENSITY_MAP[intensity]];
};

export const getTopicIntensityForGameIntensity = (intensity: GameIntensityPreference): TopicIntensity => {
    return getTopicIntensitiesForGameIntensity(intensity)[0];
};

export const buildTopicConfigFromGameIntensity = (intensity: GameIntensityPreference): RoomTopicConfig => ({
    ...DEFAULT_ROOM_TOPIC_CONFIG,
    mode: "system",
    selectedIntensities: getTopicIntensitiesForGameIntensity(intensity),
});

export const filterSystemTopics = (config: RoomTopicConfig) => {
    const categoryFilter = config.selectedCategories.length > 0
        ? new Set(config.selectedCategories)
        : null;
    const intensityFilter = config.selectedIntensities.length > 0
        ? new Set(config.selectedIntensities)
        : null;

    return systemTopics.filter(topic => {
        if (topic.enabled === false) return false;
        if (categoryFilter && !categoryFilter.has(topic.category)) return false;
        if (intensityFilter && !intensityFilter.has(topic.intensity)) return false;
        return true;
    });
};

export const getCustomTopicCount = (config: RoomTopicConfig) => {
    return normalizeCustomTopics(config.customTopics).length;
};

export const buildTopicPool = (config: RoomTopicConfig): DebateTopic[] => {
    const normalizedConfig = normalizeTopicConfigInput(config);
    const filteredSystemTopics = shuffle(filterSystemTopics(normalizedConfig));
    const customTopics = normalizeCustomTopics(normalizedConfig.customTopics).map(buildCustomDebateTopic);

    if (normalizedConfig.mode === "system") {
        return filteredSystemTopics;
    }

    if (normalizedConfig.mode === "custom") {
        return customTopics;
    }

    return interleaveTopicPools(filteredSystemTopics, customTopics);
};

export const getNextTopicFromPool = (config: RoomTopicConfig, usedTopicIds: string[]) => {
    const pool = buildTopicPool(config);
    let availableTopics = pool.filter(topic => !usedTopicIds.includes(topic.id));
    let recycled = false;

    // Cuando el pool se agota durante la misma sesión, reciclamos para no bloquear la partida.
    if (availableTopics.length === 0) {
        availableTopics = pool;
        recycled = true;
    }

    return {
        topic: availableTopics[0] || null,
        recycled,
        totalPoolSize: pool.length,
    };
};

export const getRandomTopicByGameIntensity = (intensity: GameIntensityPreference, usedTopicIds: string[]) => {
    const pool = shuffle(filterSystemTopics(buildTopicConfigFromGameIntensity(intensity)));
    let availableTopics = pool.filter(topic => !usedTopicIds.includes(topic.id));
    let recycled = false;

    if (availableTopics.length === 0) {
        availableTopics = pool;
        recycled = true;
    }

    return {
        topic: availableTopics[0] || null,
        recycled,
        totalPoolSize: pool.length,
    };
};

export const createUserDebateTopic = (text: string, options: Partial<CustomTopicInput> = {}) => {
    const normalizedText = normalizeText(text);

    return buildCustomDebateTopic({
        id: options.id || createGeneratedTopicId("user-topic", normalizedText),
        text: normalizedText,
        category: options.category,
        intensity: options.intensity,
    });
};

export const createSavedTopic = (
    text: string,
    options: Partial<Omit<SavedTopic, "text" | "source">> & { source?: SavedTopic["source"] } = {}
): SavedTopic => {
    const normalizedText = normalizeText(text);

    return {
        id: options.id || createGeneratedTopicId("saved-topic", normalizedText),
        text: normalizedText,
        createdAt: options.createdAt || Date.now(),
        lastUsedAt: options.lastUsedAt,
        source: options.source || "user",
        category: options.category,
        intensity: options.intensity,
    };
};

export const createDebateTopicFromSavedTopic = (topic: SavedTopic) => {
    return createUserDebateTopic(topic.text, {
        id: topic.id,
        category: topic.category,
        intensity: topic.intensity,
    });
};

export const validateTopicConfig = (input: unknown): TopicValidationResult => {
    const config = normalizeTopicConfigInput(input);
    const filteredSystemTopics = filterSystemTopics(config);
    const customTopics = normalizeCustomTopics(config.customTopics);
    const errors: string[] = [];
    pushCustomTopicValidationErrors(errors, customTopics);

    if (hasDuplicateCustomTopics(config.customTopics)) {
        errors.push("Los temas personalizados no pueden repetirse exactamente.");
    }

    if (config.mode === "system" && filteredSystemTopics.length === 0) {
        errors.push("No hay temas del sistema que coincidan con las categorías e intensidades elegidas.");
    }

    if (config.mode === "custom" && customTopics.length < MIN_CUSTOM_TOPICS) {
        errors.push(`Cargá al menos ${MIN_CUSTOM_TOPICS} temas personalizados para iniciar en este modo.`);
    }

    if (config.mode === "mixed") {
        if (filteredSystemTopics.length === 0) {
            errors.push("En modo mixto tiene que quedar al menos un tema del sistema con los filtros elegidos.");
        }

        if (customTopics.length === 0) {
            errors.push("En modo mixto cargá al menos un tema personalizado para que la mezcla sea real.");
        }
        const totalCount = filteredSystemTopics.length + customTopics.length;
        if (totalCount < MIN_CUSTOM_TOPICS) {
            errors.push(`Necesitás al menos ${MIN_CUSTOM_TOPICS} temas combinados entre el sistema y los personalizados.`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        systemCount: filteredSystemTopics.length,
        customCount: customTopics.length,
        totalCount: filteredSystemTopics.length + customTopics.length,
    };
};

export const deriveLegacyGameIntensity = (config: RoomTopicConfig): "liviano" | "medio" | "filoso" => {
    const normalizedConfig = normalizeTopicConfigInput(config);
    const pool = buildTopicPool(normalizedConfig);

    if (pool.length === 0) {
        return "medio";
    }

    const intensities = new Set(pool.map(topic => topic.intensity));
    if (intensities.has("muy_alta") || intensities.has("alta")) return "filoso";
    if (intensities.has("media")) return "medio";
    return "liviano";
};

export const summarizeTopicConfig = (config: RoomTopicConfig) => {
    const normalizedConfig = normalizeTopicConfigInput(config);
    const validation = validateTopicConfig(normalizedConfig);
    const customTopics = normalizeCustomTopics(normalizedConfig.customTopics);
    const customCategories = unique(
        customTopics
            .map(topic => topic.category)
            .filter((category): category is string => !!category)
    );
    const customIntensities = unique(
        customTopics
            .map(topic => topic.intensity)
            .filter((intensity): intensity is TopicIntensity => !!intensity)
    );

    let categoriesLabel = normalizedConfig.selectedCategories.length > 0
        ? normalizedConfig.selectedCategories.map(getTopicCategoryLabel).join(", ")
        : "Todas las categorías disponibles";
    let intensitiesLabel = normalizedConfig.selectedIntensities.length > 0
        ? normalizedConfig.selectedIntensities.map(getTopicIntensityLabel).join(", ")
        : "Intensidades mezcladas";

    if (normalizedConfig.mode === "custom") {
        categoriesLabel = customCategories.length > 0
            ? customCategories.map(getTopicCategoryLabel).join(", ")
            : "Categorías libres o definidas por la sala";
        intensitiesLabel = customIntensities.length > 0
            ? customIntensities.map(getTopicIntensityLabel).join(", ")
            : "Intensidad libre o definida por la sala";
    }

    if (normalizedConfig.mode === "mixed") {
        categoriesLabel = normalizedConfig.selectedCategories.length > 0
            ? `${normalizedConfig.selectedCategories.map(getTopicCategoryLabel).join(", ")} + temas propios`
            : customCategories.length > 0
                ? `Sistema mezclado + ${customCategories.map(getTopicCategoryLabel).join(", ")}`
                : "Sistema mezclado + temas propios";
        intensitiesLabel = normalizedConfig.selectedIntensities.length > 0
            ? `${normalizedConfig.selectedIntensities.map(getTopicIntensityLabel).join(", ")} + personalizadas`
            : customIntensities.length > 0
                ? `Mezcladas + ${customIntensities.map(getTopicIntensityLabel).join(", ")}`
                : "Intensidades mezcladas";
    }

    return {
        modeLabel: getTopicModeLabel(normalizedConfig.mode),
        categoriesLabel,
        intensitiesLabel,
        ...validation,
    };
};

const pushCustomTopicValidationErrors = (errors: string[], customTopics: CustomTopicInput[]) => {
    if (customTopics.some(topic => topic.text.length > MAX_CUSTOM_TOPIC_LENGTH)) {
        errors.push(`Cada tema personalizado puede tener hasta ${MAX_CUSTOM_TOPIC_LENGTH} caracteres.`);
    }

    if (customTopics.length > MAX_CUSTOM_TOPICS) {
        errors.push(`Podés cargar hasta ${MAX_CUSTOM_TOPICS} temas personalizados por sala.`);
    }
};

const normalizeCustomTopicInput = (input: unknown, index: number): CustomTopicInput | null => {
    if (!input || typeof input !== "object") return null;

    const rawTopic = input as Partial<CustomTopicInput>;
    const text = typeof rawTopic.text === "string" ? normalizeText(rawTopic.text) : "";
    if (!text) return null;

    const category = typeof rawTopic.category === "string" && TOPIC_CATEGORY_IDS.has(rawTopic.category)
        ? rawTopic.category
        : undefined;
    const intensity = typeof rawTopic.intensity === "string" && TOPIC_INTENSITY_IDS.has(rawTopic.intensity)
        ? rawTopic.intensity
        : undefined;

    return {
        id: typeof rawTopic.id === "string" && rawTopic.id.trim()
            ? rawTopic.id
            : `custom-${index + 1}-${text.toLowerCase().replace(/\s+/g, "-")}`,
        text,
        category,
        intensity,
    };
};

const normalizeCustomTopics = (customTopics: CustomTopicInput[]) => {
    return customTopics
        .map((topic, index) => normalizeCustomTopicInput(topic, index))
        .filter((topic): topic is CustomTopicInput => !!topic);
};

const hasDuplicateCustomTopics = (customTopics: CustomTopicInput[]) => {
    const normalizedTexts = normalizeCustomTopics(customTopics).map(topic => topic.text.toLowerCase());
    return new Set(normalizedTexts).size !== normalizedTexts.length;
};
