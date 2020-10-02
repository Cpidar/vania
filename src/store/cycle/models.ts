import { OMap } from 'oset';
import BTree from 'sorted-btree';
import { CycleDaySchema } from '../../db/schemas';

export interface CycleState {
    date: string;
    defaultPeriodSetting: {start: string, periodLength: number, cycleLength: number};
    cycleDays: BTree<string, CycleDaySchema>;
    predictedMenses: { [key: string]: string };
    cycleInfo: any;
    maxBreakInBleeding: number;
    maxCycleLength: number;
    maxBleedingLength: number;
    minCyclesForPrediction: number;
    menses: Map<string, string>;
    currentCycle: Array<Partial<CycleDaySchema>>;
    currentCycleDay: Partial<CycleDaySchema>;
}

export interface CycleInfo {
cycle: CycleDaySchema[];
previousCycle?: CycleDaySchema[];
earlierCycles?: CycleDaySchema[][];
secondarySymptom: string;
}

export interface OvuPhaseModel {
    cycleDays: any[];
    start: { date: string | null, time?: string };
    end?: { date: string | null, time?: string };
}

export interface PhaseModel {
    [key: string]: OvuPhaseModel;
    preOvulatory?: OvuPhaseModel;
    periOvulatory?: OvuPhaseModel;
    postOvulatory?: OvuPhaseModel;
    preOvulatoryStd?: OvuPhaseModel;
    periOvulatoryStd?: OvuPhaseModel;
    postOvulatoryStd?: OvuPhaseModel;
}

export interface TemperatureDaysModel {
    originalCycleDay: CycleDaySchema;
    temp: number;
}

export interface SymptomShiftModel {
    detected: boolean;
    rule?: number;
    firstHighMeasurementDay?: CycleDaySchema;
    evaluationCompleteDay?: CycleDaySchema;
    mucusPeak?: CycleDaySchema;
    cervixPeakBeforeShift?: CycleDaySchema;
}

export interface StatusModel {
    status?: string;
    phases: PhaseModel;
    temperatureShift?: SymptomShiftModel;
    mucusShift?: SymptomShiftModel;
    cervixShift?: SymptomShiftModel;
}

export interface FertalityStatus {
    status: string;
    phase: number | null;
    statusText?: string;
}
