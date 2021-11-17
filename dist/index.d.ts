/*! Lexifer TS v1.2.0-alpha.18

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
declare enum Place {
    Bilabial = 0,
    Labiodental = 1,
    Alveolar = 2,
    Postalveolar = 3,
    Retroflex = 4,
    Palatal = 5,
    Velar = 6,
    Uvular = 7
}
declare enum Manner {
    Plosive = 0,
    Fricative = 1,
    Nasal = 2,
    Sibilant = 3,
    LateralFricative = 4,
    LateralAffricate = 5,
    Affricate = 6,
    Approx = 7,
    LateralApproximant = 8,
    Trill = 9
}
declare class Segment {
    readonly representation: string;
    readonly voiced: boolean;
    readonly place: Place;
    readonly manner: Manner;
    constructor(representation: string, voiced: boolean, place: Place, manner: Manner);
    get isStop(): boolean;
    get isPeripheral(): boolean;
    get isApprox(): boolean;
    toString(): string;
}
interface SegmentFeatures {
    voiced?: boolean;
    place?: Place;
    manner?: Manner;
}
declare class ClusterEngine {
    private readonly segments;
    constructor(isIpa: boolean);
    getSegment(features: Readonly<SegmentFeatures>): Segment | undefined;
    applyAssimilations(word: readonly string[]): string[];
    applyCoronalMetathesis(word: readonly string[]): string[];
    applyRejections(word: readonly string[]): readonly string[];
}
interface LexiferOptions {
    number: number;
    unsorted?: boolean;
}
declare class GeneratedWords implements Iterable<[string, string]> {
    readonly categories: {
        readonly [key: string]: readonly string[];
    };
    readonly warnings: readonly string[];
    constructor(categories: {
        readonly [key: string]: readonly string[];
    }, warnings: readonly string[]);
    get allWords(): string[];
    [Symbol.iterator](): IterableIterator<[string, string]>;
}
declare class WordGenerator {
    private readonly phonDef;
    private readonly initWarnings;
    private runWarnings;
    constructor(file: string);
    generate(options: Readonly<LexiferOptions>): GeneratedWords;
}
declare const main: {
    (file: string, num?: number | undefined, verbose?: boolean, unsorted?: boolean | undefined, onePerLine?: boolean, stderr?: (inp: Error | string) => void): string;
    WordGenerator: typeof WordGenerator;
    GeneratedWords: typeof GeneratedWords;
    ClusterEngine: typeof ClusterEngine;
    Segment: typeof Segment;
    Place: typeof Place;
    Manner: typeof Manner;
};
export = main;
