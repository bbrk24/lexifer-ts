declare class PhonologyDefinition {
    private macros;
    private letters;
    private phClasses;
    private stderr;
    private defFileLineNum;
    private defFileArr;
    soundsys: SoundSystem;
    constructor(soundsys: SoundSystem, defFile: string, stderr: (inp: string | Error) => void);
    private parse;
    private sanityCheck;
    private parseOption;
    private parseFilter;
    private addFilter;
    private parseReject;
    private parseWords;
    private expandMacros;
    private parseLetters;
    private parseClusterfield;
    private parseClass;
    generate(n?: number, verbose?: boolean, unsorted?: boolean): string[];
    paragraph(sentences?: number): string;
}
declare const data: [string, string, string, string, string][];
declare let phdb: [string, string, string, string][];
declare const initialize: (notation?: string) => void;
declare const nasalAssimilate: (ph1: string, ph2: string) => string;
declare const voiceAssimilate: (ph1: string, ph2: string) => string;
declare const coronalMetathesis: (ph1: string, ph2: string) => [string, string];
declare const applyAssimilations: (word: string[]) => string[];
declare const applyCoronalMetathesis: (word: string[]) => string[];
declare class WeightedSelector {
    private keys;
    private weights;
    private sum;
    private n;
    constructor(dic: {
        [key: string]: number;
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
declare const jitter: (v: number, percent?: number) => number;
declare const naturalWeights: (phonemes: string) => string;
declare const ruleToDict: (rule: string) => {
    [key: string]: number;
};
declare class SoundSystem {
    private phonemeset;
    private ruleset;
    private filters;
    randpercent: number;
    useAssim: boolean;
    useCoronalMetathesis: boolean;
    sorter: ArbSorter | null;
    private runRule;
    private applyFilters;
    addPhUnit(name: string, selection: string): void;
    addRule(rule: string, weight: number): void;
    addFilter(pat: string, repl: string): void;
    addSortOrder(order: string): void;
    useIpa(): void;
    useDigraphs(): void;
    withStdAssimilations(): void;
    withCoronalMetathesis(): void;
    generate(n: number, verbose: boolean, unsorted: boolean): string[];
}
declare const textify: (phsys: SoundSystem, sentences?: number) => string;
