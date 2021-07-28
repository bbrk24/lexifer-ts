declare module "distribution" {
    class WeightedSelector {
        private keys;
        private weights;
        private sum;
        private n;
        constructor(dic: {
            [key: string]: number;
        });
        select(): string;
    }
    export default WeightedSelector;
}
declare module "textwrap" {
    const wrap: (s: string) => string;
    export default wrap;
}
declare module "SmartClusters" {
    export const initialize: (notation?: string) => void;
    export const applyAssimilations: (word: string[]) => string[];
    export const applyCoronalMetathesis: (word: string[]) => string[];
}
declare module "wordgen" {
    class ArbSorter {
        private splitter;
        private ords;
        private vals;
        constructor(order: string);
        wordAsValues(word: string): number[];
        valuesAsWord(values: number[]): string;
        split(word: string): string[];
        sort(l: string[]): string[];
    }
    export class SoundSystem {
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
        generate(n: number, unsorted: boolean): string[];
    }
    export const textify: (phsys: SoundSystem, sentences?: number) => string;
}
declare module "PhDefParser" {
    import { SoundSystem } from "wordgen";
    class PhonologyDefinition {
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
        generate(n?: number, unsorted?: boolean): string[];
        paragraph(sentences?: number): string;
    }
    export default PhonologyDefinition;
}
declare module "index" {
    export const main: (file: string, num?: number | undefined, unsorted?: boolean | undefined, onePerLine?: boolean | undefined, stderr?: (inp: string | Error) => void) => string;
}
