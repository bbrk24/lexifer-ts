/*
 * Copyright (c) 2021 William Baker
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

import last from './last';

class Rule {
    private readonly parts: Fragment[];
    private readonly str: string;

    constructor(rule: string) {
        // Guard against improper '!' that the loop won't catch.
        if (rule[0] === '!' || rule.includes('!!')) {
            throw new Error("misplaced '!' option: in non-duplicate "
                + `environment: '${rule}'.`);
        }

        this.parts = [];
        this.str = rule;

        let minReps = 1,
            maxReps = 1;
        let letter = rule[0]!;
        let allowRepeats: boolean | undefined;

        for (let i = 1; i < rule.length; ++i) {
            if (rule[i] === '?') {
                --minReps;

                continue;
            } else if (rule[i] === '!') {
                if (maxReps <= 1) {
                    throw new Error("misplaced '!' option: in non-duplicate "
                        + `environment: '${rule}'.`);
                } else if (allowRepeats === undefined) {
                    allowRepeats = false;
                }

                continue;
            }

            if (
                rule[i] === letter
                /*
                 * Note: thoroughly test this. I'm not convinced I got this
                 * part right the first time around.
                 */
                && allowRepeats === false == (rule[i + 1] === '!')
            ) {
                ++minReps;
                ++maxReps;
            } else {
                // Add a new fragment
                this.parts.push(
                    new Fragment(letter, minReps, maxReps, allowRepeats)
                );
                letter = rule[i]!;
                maxReps = 1;
                minReps = 1;
                allowRepeats = undefined;
            }
        }

        // Add the very last one
        this.parts.push(new Fragment(letter, minReps, maxReps));
    }

    generate() {
        return this.parts.map(el => el.generate()).join('');
    }

    toString() {
        return this.str;
    }
}

class Fragment {
    static addOptional: () => boolean; // Filled in in PhDefParser

    static getRandomPhoneme: (group: string) => string; // Filled in in wordgen

    constructor(
        private readonly value: string,
        private readonly minReps: number,
        private readonly maxReps: number,
        private readonly allowRepeats?: boolean
    ) {
    }

    private getPhoneme(word?: string) {
        if (!word?.length) {
            return Fragment.getRandomPhoneme(this.value);
        }

        let val: string;

        do {
            val = Fragment.getRandomPhoneme(this.value);
        } while (this.allowRepeats === false && val === last(word));

        return val;
    }

    generate() {
        if (this.maxReps === 1) {
            if (this.minReps === 0 && !Fragment.addOptional()) {
                return '';
            }

            return this.getPhoneme();
        }

        let i: number;
        let retVal = '';

        for (i = 0; i < this.minReps; ++i) {
            retVal += this.getPhoneme(retVal);
        }

        for (; i < this.maxReps; ++i) {
            if (Fragment.addOptional()) {
                retVal += this.getPhoneme(retVal);
            }
        }

        return retVal;
    }
}

export { Rule, Fragment };
