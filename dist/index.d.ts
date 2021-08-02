declare class PhonologyDefinition {
    private macros;
    private letters;
    private phClasses;
    private categories;
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
    private addRules;
    private expandMacros;
    private parseLetters;
    private parseClusterfield;
    private parseClass;
    private parseCategories;
    generate(n?: number, verbose?: boolean, unsorted?: boolean, onePerLine?: boolean): string;
    paragraph(sentences?: number): string;
}
declare const data: [string, string, string, string, string][];
declare let phdb: [string, string, string, string][];
declare const initialize: (notation?: string) => void;
declare const coronalMetathesis: (ph1: string, ph2: string) => [string, string];
declare const applyAssimilations: (word: string[]) => string[];
declare const applyCoronalMetathesis: (word: string[]) => string[];
declare class WeightedSelector {
    private keys;
    private weights;
    private sum;
    private n;
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
    withStdAssimilations(): void;
    withCoronalMetathesis(): void;
    generate(n: number, verbose: boolean, unsorted: boolean, category: string): string[];
    randomCategory(): string;
}
declare const textify: (phsys: SoundSystem, sentences?: number) => string;
