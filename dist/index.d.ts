declare class PhonologyDefinition {
    private stderr;
    private macros;
    private letters;
    private phClasses;
    private categories;
    private defFileLineNum;
    private defFileArr;
    soundsys: SoundSystem;
    constructor(defFile: string, stderr: (inp: string | Error) => void);
    private parse;
    private sanityCheck;
    private parseOption;
    private parseFilter;
    private parseReject;
    private parseWords;
    private addRules;
    private expandMacros;
    private parseLetters;
    private parseClusterfield;
    private parseClass;
    private parseCategories;
    generate(n?: number, verbose?: boolean, unsorted?: boolean, onePerLine?: boolean): string;
    paragraph(sentences?: number): string;
}
declare const enum Voicing {
    Voiceless = 0,
    Voiced = 1
}
declare const enum Place {
    Bilabial = 0,
    Labiodental = 1,
    Alveolar = 2,
    Postalveolar = 3,
    Retroflex = 4,
    Palatal = 5,
    Velar = 6,
    Uvular = 7
}
declare const enum Manner {
    Stop = 0,
    Fricative = 1,
    Nasal = 2,
    Sibilant = 3,
    LatFric = 4,
    LatAffric = 5,
    Affricate = 6
}
declare const data: [string, string, Voicing, Place, Manner][];
declare let phdb: [string, Voicing, Place, Manner][];
declare const initialize: (isIpa?: boolean) => void;
declare const applyAssimilations: (word: string[]) => string[];
declare const applyCoronalMetathesis: (word: string[]) => string[];
declare class WeightedSelector {
    private keys;
    private weights;
    private sum;
    constructor(dic: {
        [key: string]: number | undefined;
    });
    select(): string;
}
declare const main: (file: string, num?: number | undefined, verbose?: boolean, unsorted?: boolean | undefined, onePerLine?: boolean | undefined, stderr?: (inp: string | Error) => void) => string;
declare function last<T>(array: T[]): T | undefined;
declare const wrap: (s: string) => string;
declare class Word {
    static verbose: boolean;
    static sorter: ArbSorter | null;
    private forms;
    private filters;
    constructor(form: string, rule: string);
    private applyFilter;
    applyFilters(filters: [string, string][]): void;
    applyAssimilations(): void;
    applyCoronalMetathesis(): void;
    toString(): string;
}
declare const invalidItemAndWeight: (item: string) => boolean;
declare class ArbSorter {
    private splitter;
    private ords;
    private vals;
    constructor(order: string);
    wordAsValues(word: string): number[];
    valuesAsWord(values: number[]): string;
    split(word: string): string[];
    sort(l: string[]): string[];
}
interface Rule {
    _weight: number;
    [key: string]: number;
}
declare class SoundSystem {
    private phonemeset;
    private filters;
    randpercent: number;
    useAssim: boolean;
    useCoronalMetathesis: boolean;
    ruleset: {
        [key: string]: Rule;
    };
    sorter: ArbSorter | null;
    private runRule;
    private applyFilters;
    addPhUnit(name: string, selection: string): void;
    addRule(rule: string, weight: number, cat?: string): void;
    addCategory(name: string, weight: number): void;
    addFilter(pat: string, repl: string): void;
    addSortOrder(order: string): void;
    useIpa(): void;
    useDigraphs(): void;
    generate(n: number, verbose: boolean, unsorted: boolean, category: string, force?: boolean): string[];
    randomCategory(): string;
}
declare const textify: (phsys: SoundSystem, sentences?: number) => string;
