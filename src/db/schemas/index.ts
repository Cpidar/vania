interface Base {
    [key: string]: any
}

export interface TemperatureSchema extends Base {
    value: number;
    exclude?: boolean;
    time: string;
    note?: string
}

export interface WeightSchema extends Base {
    value: number;
    exclude?: boolean;
    time: string;
    note?: string
}

export interface BleedingSchema extends Base {
    value: number;
    exclude: boolean
}

export interface MucusSchema extends Base {
    feeling: number;
    texture: number;
    value: number;
    exclude?: boolean
}

export interface CervixSchema extends Base {
    opening: number;
    firmness: number;
    position: number;
    exclude?: boolean
}

export interface NoteSchema extends Base {
    value: string
}

export interface DesireSchema extends Base {
    value: number
}

export interface SexSchema extends Base {
    // nosex: boolean;
    // protect: boolean;
    // unprotect: boolean;
    // pill: boolean;
    // iud: boolean;
    // patch: boolean;
    // ring: boolean;
    // implant: boolean;
    // other: boolean;
    // note: string
    value: number
}

export interface PainSchema extends Base {
    acne: boolean;
    bodyAche: boolean;
    backaches: boolean;
    bloating: boolean;
    constipation: boolean;
    cramps: boolean;
    diarrhea: boolean;
    dizziness: boolean;
    headache: boolean;
    lowerBackPain: boolean;
    nausea: boolean;
    neckaches: boolean;
    ovulationPain: boolean;
    pms: boolean;
    shoulderAche: boolean;
    tender: boolean;
}

export interface MoodSchema extends Base {
    happy: boolean;
    sad: boolean;
    stressed: boolean;
    normal: boolean;
    swings: boolean;
    anxious: boolean;
    frisky: boolean;
    tired: boolean;
    angry: boolean;
    tense: boolean;
    panicky: boolean;
    lonely: boolean;
}

export interface CycleDaySchema extends Base {
    _id?: string;
    date: string;
    isCycleStart: boolean;
    isBleedingDay: boolean;
    temperature: TemperatureSchema;
    weight: WeightSchema;
    bleeding?: BleedingSchema;
    mucus: MucusSchema;
    cervix: CervixSchema;
    note: NoteSchema;
    desire: DesireSchema;
    sex: SexSchema;
    pain: PainSchema;
    mood: MoodSchema;
}
