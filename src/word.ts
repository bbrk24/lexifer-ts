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
import { regexEscape } from './rule';

class Word {
    private readonly forms: string[];
    private readonly filters: string[];

    constructor(form: string, rule: string) {
        this.forms = [form];
        this.filters = [rule];
    }

    private applyFilter(
        pat: string,
        repl: string,
        classes?: { [key: string]: string[] }
    ) {
        let patToApply = pat;
        if (classes) {
            for (const className in classes) {
                patToApply = patToApply.replace(
                    new RegExp(className, 'gu'),
                    '(?:' + classes[className]!
                        .map(regexEscape)
                        .join('|') + ')'
                );
            }
        }

        let newWord = last(this.forms)!;
        newWord = newWord.replace(new RegExp(patToApply, 'gu'), repl);
        if (newWord.includes('REJECT')) {
            newWord = 'REJECT';
        }

        if (newWord !== last(this.forms)) {
            this.forms.push(newWord);
            this.filters.push(`${pat} > ${repl || '!'}`);
        }
    }

    applyFilters(
        filters: ReadonlyArray<readonly [string, string]>,
        classes?: { [key: string]: string[] }
    ) {
        for (const filt of filters) {
            this.applyFilter(...filt, classes);
            if (last(this.forms) === 'REJECT') {
                return;
            }
        }
    }

    applyAssimilations(sorter?: ArbSorter, clusterEngine?: ClusterEngine) {
        if (sorter && clusterEngine) {
            const newWord = clusterEngine.applyAssimilations(
                sorter.split(
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

    applyCoronalMetathesis(sorter?: ArbSorter, clusterEngine?: ClusterEngine) {
        if (sorter && clusterEngine) {
            const newWord = clusterEngine.applyCoronalMetathesis(
                sorter.split(
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

    toString(verbose: boolean) {
        if (verbose) {
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
