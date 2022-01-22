/*
 * Copyright (c) 2021-2022 William Baker
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import wrap from './wrap';
import PhonologyDefinition from './PhDefParser';
import { ClusterEngine, Segment, Place, Manner } from './SmartClusters';
import ArbSorter from './ArbSorter';

interface LexiferOptions {
    number: number;
    unsorted?: boolean;
}

/**
 * The return type of `WordGenerator#generate()`.
 */
class GeneratedWords implements Iterable<[string, string]> {
    /**
     * @internal Create a new `GeneratedWords` object given a Record.
     * @param categories An associative array of category names to arrays of
     * words. Constructed using `Object.create(null)`, so there is guaranteed
     * to be no key pollution.
     * @param warnings Any warnings produced during word generation.
     */
    constructor(
        readonly categories: { readonly [key: string]: readonly string[] },
        readonly warnings: readonly string[]
    ) {
    }

    /**
     * All words that have been generated, regardless of category.
     */
    get allWords() {
        const retval: string[] = [];

        for (const words of Object.values(this.categories)) {
            retval.push(...words);
        }

        return retval;
    }

    *[Symbol.iterator](): IterableIterator<[string, string]> {
        for (const [cat, words] of Object.entries(this.categories)) {
            for (const word of words) {
                yield [word, cat];
            }
        }
    }
}

/**
 * The primary word generator for the API. Not used by the CLI or web app.
 */
class WordGenerator {
    private readonly phonDef: PhonologyDefinition;
    private readonly initWarnings: string[] = [];
    private runWarnings!: string[];

    constructor(file: string) {
        let initDone = false;

        this.phonDef = new PhonologyDefinition(file, e => {
            if (initDone) {
                this.runWarnings.push(e);
            } else {
                this.initWarnings.push(e);
            }
        });

        initDone = true;
    }

    generate(options: Readonly<LexiferOptions>) {
        if (
            options.number > Number.MAX_SAFE_INTEGER
            || options.number <= 0
            || Number.isNaN(options.number)
        ) {
            throw new Error(`Cannot generate ${options.number} words.`);
        }

        this.runWarnings = [];

        let number = options.number;
        if (number !== Math.round(number)) {
            this.runWarnings.push(`Requested number of words (${number}) is `
                + `not an integer. Rounding to ${Math.round(number)}.`);
            number = Math.round(number);
        }

        return new GeneratedWords(
            this.phonDef.generate(number, false, options.unsorted),
            [...this.initWarnings, ...this.runWarnings]
        );
    }
}

// Original "main" -- returns a string
const main = (() => {
    let hash = 0;
    let phonDef: PhonologyDefinition | null = null;

    const hashString = (str: string) => {
        let hash = 0;
        if (str.length === 0) {
            return hash;
        }

        for (let i = 0; i < str.length; ++i) {
            hash = Math.trunc((hash << 5) - hash + str.codePointAt(i)!);
        }

        return hash;
    };

    const lexifer = (
        file: string,
        num?: number,
        verbose = false,
        unsorted?: boolean,
        onePerLine = false,
        stderr: (inp: Error | string) => void = console.error
    ) => {
        let ans = '';

        try {
            // There's no need to re-parse if nothing changed.
            const newHash = hashString(file);
            if (hash !== newHash || !phonDef) {
                phonDef = new PhonologyDefinition(file, stderr);
                hash = newHash;
            }

            if (num) {
                if (num < 0 || num === Infinity) {
                    stderr(`Cannot generate ${num} words.`);
                    ans = phonDef.paragraph();
                } else {
                    if (num !== Math.round(num)) {
                        stderr(`Requested number of words (${num}) is not an `
                            + `integer. Rounding to ${Math.round(num)}.`);
                        num = Math.round(num);
                    }
                    if (verbose) {
                        if (unsorted === false) {
                            stderr("** 'Unsorted' option always enabled in "
                                + 'verbose mode.');
                            unsorted = true;
                        }
                        if (onePerLine) {
                            stderr("** 'One per line' option ignored in "
                                + 'verbose mode.');
                        }
                    }

                    const words = phonDef.generate(num, verbose, unsorted);

                    for (const cat in words) {
                        if (cat !== 'words:') {
                            ans += `\n\n${cat}:\n`;
                        }

                        ans += words[cat]!.join(
                            onePerLine || verbose
                                ? '\n'
                                : ' '
                        );
                    }

                    ans = wrap(ans);
                }
            } else {
                if (verbose) {
                    stderr("** 'Verbose' option ignored in paragraph mode.");
                }
                if (unsorted) {
                    stderr("** 'Unsorted' option ignored in paragraph mode.");
                }
                if (onePerLine) {
                    stderr("** 'One per line' option ignored in paragraph "
                        + 'mode.');
                }

                ans = phonDef.paragraph();
            }
        } catch (e) {
            stderr(<Error>e);
        }

        return ans;
    };

    lexifer.WordGenerator = WordGenerator;
    lexifer.GeneratedWords = GeneratedWords;

    lexifer.ClusterEngine = ClusterEngine;
    lexifer.Segment = Segment;
    lexifer.Place = Place;
    lexifer.Manner = Manner;

    lexifer.__ArbSorter = ArbSorter;

    return lexifer;
})();

// Actual code run when you click "generate"
const genWords = () => {
    document.getElementById('errors')!.innerHTML = '';

    document.getElementById('result')!.innerHTML = main(
        (<HTMLTextAreaElement>document.getElementById('def')).value,
        parseInt((<HTMLInputElement>document.getElementById('number')).value),
        (<HTMLInputElement>document.getElementById('verbose')).checked,
        (<HTMLInputElement>document.getElementById('unsorted')).checked,
        (<HTMLInputElement>document.getElementById('one-per-line')).checked,
        message => {
            document.getElementById('errors')!.innerHTML += `${message}<br />`;
        }
    ).replace(/\n/gu, '<br />');
};

export default main;
