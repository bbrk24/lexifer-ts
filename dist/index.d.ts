/*!
Lexifer TS v1.1.3

Copyright (c) 2021 William Baker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
declare class WeightedSelector {
    private keys;
    private weights;
    private sum;
    constructor(dic: {
        [key: string]: number | undefined;
    });
    select(): string;
}
declare const main: (file: string, num?: number | undefined, verbose?: boolean, unsorted?: boolean | undefined, onePerLine?: boolean, stderr?: (inp: Error | string) => void) => string;
declare const genWords: () => void;
declare const last: {
    (arr: null): null;
    <T = never>(arr: ArrayLike<T> | undefined): T | undefined;
    <T>(arr: ArrayLike<T> | null | undefined): T | null | undefined;
};
declare class PhonologyDefinition {
    private stderr;
    private macros;
    private letters;
    private phClasses;
    private categories;
    private defFileLineNum;
    private defFileArr;
    soundsys: SoundSystem;
    constructor(defFile: string, stderr: (inp: Error | string) => void);
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
    generate(numWords?: number, verbose?: boolean, unsorted?: boolean, onePerLine?: boolean): string;
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
declare const wrap: (str: string) => string;
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
    sort(list: string[]): string[];
}
declare const _weight: unique symbol;
interface Rule {
    [_weight]: number;
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
    generate(numWords: number, verbose: boolean, unsorted: boolean, category: string, force?: boolean): string[];
    randomCategory(): string;
}
declare const textify: (phsys: SoundSystem, sentences?: number) => string;
export = main;
