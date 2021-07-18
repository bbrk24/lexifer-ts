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
export declare class SoundSystem {
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
    addFilter(pat: RegExp, repl: string): void;
    addSortOrder(order: string): void;
    useIpa(): void;
    useDigraphs(): void;
    withStdAssimilations(): void;
    withCoronalMetathesis(): void;
    generate(n?: number, unsorted?: boolean): string[];
}
export declare const textify: (phsys: SoundSystem, sentences?: number) => string;
export {};
