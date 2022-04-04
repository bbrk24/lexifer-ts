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

import last from './last';

const letterMatches = (fragment: string, letter: string) =>
    letter === '!' || letter === '?'
    || ![...fragment].some(el => el !== '!' && el !== '?' && el !== letter);

const regexEscape = (str: string) =>
    str.replace(/([[\]{}()*+?|^$:.\\])/gu, '\\$1');

class Rule {
    private readonly parts: Fragment[];
    private readonly str: string;

    constructor(rule: string) {
        // Guard against improper '!' that the loop won't catch.
        if (rule.includes('!!')) {
            throw new Error("misplaced '!' option: in non-duplicate "
                + `environment: '${rule}'.`);
        }

        this.parts = [];
        this.str = rule;

        // Segment the rule
        const fragmentedWord: string[] = [];
        let currentPart = '';

        // this parses `?C` better than `C?`, so transform it
        for (const letter of [...rule.replace(/(.)\?/gu, '?$1')].reverse()) {
            if (letterMatches(currentPart, letter)) {
                // potential match, but need to check for things like CCC! and
                // CC!C -- CC!C! is fine

                const breakRegex = new RegExp(
                    `(${regexEscape(letter)}\\??){3,}!`,
                    'u'
                );

                if (
                    letter === '!'
                        ? /!\??$/u.test(currentPart)
                        : !breakRegex.test(letter + currentPart)
                ) {
                    currentPart = letter + currentPart;

                    continue;
                }
            }

            fragmentedWord.push(currentPart);
            currentPart = letter;
        }

        fragmentedWord.push(currentPart);

        // Parse each segment
        for (const segment of fragmentedWord.filter(Boolean).reverse()) {
            const allowRepeats = !segment.endsWith('!');

            if (!allowRepeats && segment.length <= 2) {
                throw new Error("misplaced '!' option: in non-duplicate "
                    + `environment: '${rule}'.`);
            }

            const segmentAsArray: readonly string[] = [...segment];

            const questionCount = segmentAsArray.filter(
                el => el === '?'
            ).length;
            const bangCount = allowRepeats
                ? 0
                : segmentAsArray.filter(el => el === '!').length;
            const letterCount = segment.length - bangCount - questionCount;

            this.parts.push(new Fragment(
                segmentAsArray.find(el => el !== '!' && el !== '?')!,
                letterCount - questionCount,
                letterCount,
                allowRepeats
            ));
        }
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
        private readonly allowRepeats: boolean
    ) {
    }

    private getPhoneme(word?: string[]) {
        if (!word?.length) {
            return Fragment.getRandomPhoneme(this.value);
        }

        let val: string;

        do {
            val = Fragment.getRandomPhoneme(this.value);
        } while (!this.allowRepeats && val === last(word));

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
        const retVal: string[] = [];

        for (i = 0; i < this.minReps; ++i) {
            retVal.push(this.getPhoneme(retVal));
        }

        for (; i < this.maxReps; ++i) {
            if (Fragment.addOptional()) {
                retVal.push(this.getPhoneme(retVal));
            }
        }

        return retVal.join('');
    }
}

export { Rule, Fragment };
