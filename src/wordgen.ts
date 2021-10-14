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

import WeightedSelector from './distribution';
import wrap from './textwrap';
import Word from './word';
import ClusterEngine from './SmartClusters';
import Rule from './rule';

const invalidItemAndWeight = (item: string) => {
    const parts = item.split(':');
    if (parts.length !== 2) {
        return true;
    }

    const weight = +parts[1]!;

    return isNaN(weight) || weight < 0 || weight === Infinity;
};

class ArbSorter {
    private splitter: RegExp;
    private ords: { [key: string]: number };
    private vals: string[];

    constructor(order: string) {
        const graphs = order.split(/\s+/gu);
        const splitOrder = [...graphs].sort((a, b) => b.length - a.length);
        this.splitter = new RegExp(`(${splitOrder.join('|')}|.)`, 'gu');

        this.ords = {};
        this.vals = [];

        for (const i in graphs) {
            this.ords[graphs[i]!] = +i;
            this.vals.push(graphs[i]!);
        }
    }

    wordAsValues(word: string) {
        const splitWord = this.split(word);
        const arrayedWord = splitWord.map(char => this.ords[char]);
        if (arrayedWord.includes(undefined)) {
            throw new Error(`word with unknown letter: '${word}'.\n`
                + 'A filter or assimilation might have caused this.');
        }

        return <number[]>arrayedWord;
    }

    valuesAsWord(values: number[]) {
        return values.map(el => this.vals[el])
            .join('');
    }

    split(word: string) {
        return word.split(this.splitter)
            .filter((_, i) => i % 2);
    }

    sort(list: string[]) {
        const l2 = list.filter(el => el !== '')
            .map(el => this.wordAsValues(el));

        l2.sort((a, b) => a[0]! - b[0]!);

        return l2.map(el => this.valuesAsWord(el));
    }
}

class Category extends Map<Rule, number> {
    constructor(public weight: number) {
        super();
    }
}

class SoundSystem {
    private phonemeset: { [key: string]: WeightedSelector<string> } = {};
    private filters: [string, string][] = [];

    randpercent = 10;
    useAssim = false;
    useCoronalMetathesis = false;
    useRejections = false;
    ruleset: { [key: string]: Category } = {};
    sorter: ArbSorter | null = null;

    constructor() {
        Rule.Fragment.getRandomPhoneme = phoneme => {
            if (phoneme in this.phonemeset) {
                return this.phonemeset[phoneme]!.select();
            }

            return phoneme;
        };
    }

    private applyFilters(word: Word) {
        if (this.useAssim) {
            word.applyAssimilations();
        }
        if (this.useCoronalMetathesis) {
            word.applyCoronalMetathesis();
        }
        if (this.useRejections) {
            word.applyRejections();
        }

        word.applyFilters(this.filters);

        return word;
    }

    addPhUnit(name: string, selection: string) {
        const naturalWeights = (phonemes: string) => {
            const jitter = (val: number, percent = 10) => {
                const move = val * percent / 100;

                return val + move * (Math.random() - 0.5);
            };

            const phons = phonemes.split(/\s+/gu);
            const weighted: { [key: string]: number } = {};
            const numPhons = phons.length;

            for (let i = 0; i < numPhons; ++i) {
                weighted[phons[i]!] = jitter(
                    (Math.log(numPhons + 1) - Math.log(i + 1)) / numPhons
                );
            }

            let temp = '';

            for (const key in weighted) {
                temp += `${key}:${weighted[key]} `;
            }

            temp.trim();

            return temp;
        };

        const ruleToDict = (rule: string) => {
            const items = rule.trim().split(/\s+/gu);
            const dict = new Map<string, number>();

            for (const item of items) {
                if (invalidItemAndWeight(item)) {
                    throw new Error(`'${item}' is not a valid phoneme and `
                        + 'weight.');
                }

                const [value, weight] = <[string, string]>item.split(':');
                dict.set(value, +weight);
            }

            return dict;
        };

        if (!selection.includes(':')) {
            selection = naturalWeights(selection);
        }

        this.phonemeset[name] = new WeightedSelector(ruleToDict(selection));
    }

    addRule(rule: string, weight: number, cat = 'words:') {
        if (this.ruleset[cat]) {
            this.ruleset[cat]!.set(new Rule(rule), weight);
        } else {
            throw new Error(`uninitialized category '${cat}' referenced.`);
        }
    }

    addCategory(name: string, weight: number) {
        this.ruleset[name] = new Category(weight);
    }

    addFilter(pat: string, repl: string) {
        if (repl === '!') {
            this.filters.push([pat, '']);
        } else {
            this.filters.push([pat, repl]);
        }
    }

    addSortOrder(order: string) {
        this.sorter = new ArbSorter(order);
    }

    useIpa() {
        Word.clusterEngine = new ClusterEngine(true);
    }

    useDigraphs() {
        Word.clusterEngine = new ClusterEngine(false);
    }

    generate(
        numWords: number,
        verbose: boolean,
        unsorted: boolean,
        category: string,
        force = false
    ) {
        const words = new Set<string>();
        Word.verbose = verbose;
        Word.sorter = this.sorter;

        if (!this.ruleset[category]) {
            throw new Error(`unknown category '${category}'.`);
        }

        const dict = new Map<Rule | string, number | undefined>(
            this.ruleset[category]!
        );
        if (dict.size === 0) {
            dict.set(category, 0);
        }

        const ruleSelector = new WeightedSelector(dict);

        /*
         * If they request more words than are possible, we don't want to lock
         * up. Instead, try up to three times as many (note: is this enough?),
         * and then cut off after that. However, this doesn't guarantee that
         * it's impossible to generate more. Setting `force` to true requires
         * it to generate that many words, or freeze if it can't. It's
         * currently only used in paragraph mode, which chooses one word at a
         * time. I think it's safe to assume it's always possible to generate
         * at least one valid word. 
         */
        for (let i = 0; force || i < 3 * numWords; ++i) {
            const rule = ruleSelector.select();
            const form = (<Rule>rule).generate();
            const word = new Word(form, rule.toString());
            this.applyFilters(word);
            if (word.toString() !== 'REJECT') {
                words.add(word.toString());
                if (words.size === numWords) {
                    break;
                }
            }
        }

        let wordList = Array.from(words);
        if (!(unsorted || verbose)) {
            if (this.sorter) {
                wordList = this.sorter.sort(wordList);
            } else {
                wordList.sort();
            }
        }

        return wordList;
    }

    randomCategory() {
        const weightedCats = new Map<string, number>();

        for (const cat in this.ruleset) {
            weightedCats.set(cat, this.ruleset[cat]!.weight);
        }

        const catSelector = new WeightedSelector(weightedCats);

        return catSelector.select();
    }
}

const textify = (phsys: SoundSystem, sentences = 25) => {
    let text = '';

    for (let i = 0; i < sentences; ++i) {
        const sent = Math.floor(Math.random() * 9) + 3;
        let comma = -1;
        if (sent >= 7) {
            comma = Math.floor(Math.random() * (sent - 1));
        }

        text += phsys.generate(
            1,
            false,
            true,
            phsys.randomCategory(),
            true
        )[0]!.toString()
            .replace(/./u, el => el.toUpperCase());

        for (let j = 0; j < sent; ++j) {
            text += ` ${phsys.generate(
                1,
                false,
                true,
                phsys.randomCategory(),
                true
            )[0]}`;
            if (j === comma) {
                text += ',';
            }
        }

        if (Math.random() <= 0.85) {
            text += '. ';
        } else {
            text += '? ';
        }
    }

    return wrap(text.trim());
};

export { SoundSystem, textify, ArbSorter, invalidItemAndWeight };
