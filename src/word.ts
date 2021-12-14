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
import { ClusterEngine } from './SmartClusters';
import ArbSorter from './ArbSorter';

class Word {
    static verbose = false;
    static sorter: ArbSorter | null = null;
    static clusterEngine: ClusterEngine | null = null;

    private readonly forms: string[];
    private readonly filters: string[];

    constructor(form: string, rule: string) {
        this.forms = [form];
        this.filters = [rule];
    }

    private applyFilter(pat: string, repl: string) {
        let newWord = last(this.forms)!;
        newWord = newWord.replace(new RegExp(pat, 'gu'), repl);
        if (newWord.includes('REJECT')) {
            newWord = 'REJECT';
        }

        if (newWord !== last(this.forms)) {
            this.forms.push(newWord);
            this.filters.push(`${pat} > ${repl || '!'}`);
        }
    }

    applyFilters(filters: ReadonlyArray<readonly [string, string]>) {
        for (const filt of filters) {
            this.applyFilter(...filt);
            if (last(this.forms) === 'REJECT') {
                return;
            }
        }
    }

    applyAssimilations() {
        if (Word.sorter && Word.clusterEngine) {
            const newWord = Word.clusterEngine.applyAssimilations(
                Word.sorter.split(
                    last(this.forms)!
                )
            )
                .join('');

            if (newWord !== last(this.forms)) {
                this.forms.push(newWord);
                this.filters.push('std-assimilations');
            }
        }
    }

    applyCoronalMetathesis() {
        if (Word.sorter && Word.clusterEngine) {
            const newWord = Word.clusterEngine.applyCoronalMetathesis(
                Word.sorter.split(
                    last(this.forms)!
                )
            )
                .join('');

            if (newWord !== last(this.forms)) {
                this.forms.push(newWord);
                this.filters.push('coronal-metathesis');
            }
        }
    }

    toString() {
        if (Word.verbose) {
            let ans = '';

            for (const i in this.forms) {
                ans += `${this.filters[i]} – ${this.forms[i]}\n`;
            }

            return ans;
        }

        return last(this.forms)!;
    }
}

export default Word;
