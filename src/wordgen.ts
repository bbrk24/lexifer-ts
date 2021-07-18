import last from 'lodash/last';
import WeightedSelector from './distribution';
import wrap from './textwrap';
import * as sc from './SmartClusters';

class RuleError extends Error { }

class ArbSorter {
    private splitter: RegExp;
    private ords: { [key: string]: number };
    private vals: string[];

    constructor(order: string) {
        let graphs = order.split(/\s+/g);
        let splitOrder = graphs.sort((a, b) => b.length - a.length);
        this.splitter = new RegExp(`(${splitOrder.join('|')}|.)`, 'g');
        
        this.ords = {};
        this.vals = [];
        for (let i in graphs) {
            this.ords[graphs[i]!] = parseInt(i);
            this.vals.push(graphs[i]!);
        }
    }

    wordAsValues(word: string) {
        let w = this.split(word);
        let arrayedWord = w.map(char => this.ords[char]);
        if (arrayedWord.includes(undefined)) {
            throw new Error(`Word with unknown letter: '${word}'.\n`
                + 'A filter or assimilation might have caused this.');
        }
        return <number[]>arrayedWord;
    }

    valuesAsWord(values: number[]) {
        return values.map(v => this.vals[v])
            .join('');
    }

    split(word: string) {
        return word.split(this.splitter)
            .filter((_, i) => i % 2);
    }

    sort(l: string[]) {
        let l2 = l.map(el => this.wordAsValues(el));
        l2.sort();
        return l2.map(el => this.valuesAsWord(el));
    }
}

const jitter = (v: number, percent = 10) => {
    let move = v + percent / 100;
    return v + move * (Math.random() - 0.5);
}

const naturalWeights = (phonemes: string) => {
    let p = phonemes.split(/\s+/g);
    let weighted: { [key: string]: number } = {};
    let n = p.length;
    for (let i = 0; i < n; ++i) {
        weighted[p[i]!] = jitter((Math.log(n + 1) - Math.log(i + 1)) / n);
    }
    let temp = '';
    for (let k in weighted) {
        temp += `${k}:${weighted[k]} `;
    }
    temp.trim();
    return temp;
};

const ruleToDict = (rule: string) => {
    let items = rule.split(/\s+/g);
    let d: { [key: string]: number } = {};
    for (let item of items) {
        if (!item.includes(':')) {
            throw new RuleError(`${item} is not a valid phoneme and weight`);
        }
        let [value, weight] = item.split(':');
        d[value!] = parseFloat(weight!);
    }
    return d;
};

export class SoundSystem {
    private phonemeset: { [key: string]: WeightedSelector } = {};
    private ruleset: { [key: string]: number } = {};
    private filters: [RegExp, string][] = [];

    randpercent = 10;
    useAssim = false;
    useCoronalMetathesis = false;
    sorter: ArbSorter | null = null;

    addPhUnit(name: string, selection: string) {
        if (!selection.includes(':')) {
            selection = naturalWeights(selection);
        }
        this.phonemeset[name] = new WeightedSelector(ruleToDict(selection));
    }

    addRule(rule: string, weight: number) {
        this.ruleset[rule] = weight;
    }

    runRule(rule: string) {
        let n = rule.length;
        let s: string[] = [];
        for (let i = 0; i < n; ++i) {
            if ('?!'.includes(rule[i]!)) {
                continue;
            }

            if (
                i < n - 1
                && rule[i + 1] === '?'
            ) {
                if (Math.random() * 100 < this.randpercent) {
                    if (rule[i]! in this.phonemeset) {
                        s.push(this.phonemeset[rule[i]!]!.select());
                    } else {
                        s.push(rule[i]!);
                    }
                }
            } else if (
                i < n - 1
                && i > 0
                && rule[i + 1] === '!'
            ) {
                let prevc: string;
                if (rule[i - 1] === '?' && i > 2) {
                    prevc = rule[i - 2]!;
                } else {
                    prevc = rule[i - 1]!;
                }

                if (rule[i] !== prevc) {
                    throw new RuleError('Misplaced \'!\' option: in '
                        + `non-duplicate environment: ${rule}`);
                }
                if (rule[i]! in this.phonemeset) {
                    let nph = this.phonemeset[rule[i]!]!.select();
                    while (nph === last(s)) {
                        nph = this.phonemeset[rule[i]!]!.select();
                    }
                    s.push(nph);
                }
            } else if (rule[i]! in this.phonemeset) {
                s.push(this.phonemeset[rule[i]!]!.select());
            } else {
                s.push(rule[i]!);
            }
        }
        return s.join('');
    }

    addFilter(pat: RegExp, repl: string) {
        if (repl === '!') {
            this.filters.push([pat, '']);
        } else {
            this.filters.push([pat, repl]);
        }
    }

    applyFilters(word: string) {
        if (this.sorter) {
            let w = this.sorter.split(word);
            if (this.useAssim) {
                w = sc.applyAssimilations(w);
            }
            if (this.useCoronalMetathesis) {
                w = sc.applyCoronalMetathesis(w);
            }
            word = w.join('');
        }

        for (let [pat, repl] of this.filters) {
            word = word.replaceAll(pat, repl);
            if (word.includes('REJECT')) {
                return 'REJECT';
            }
        }
        return word;
    }

    addSortOrder(order: string) {
        this.sorter = new ArbSorter(order);
    }

    useIpa() {
        sc.initialize();
    }

    useDigraphs() {
        sc.initialize('digraph');
    }

    withStdAssimilations() {
        this.useAssim = true;
    }

    withCoronalMetathesis() {
        this.useCoronalMetathesis = true;
    }

    generate(n = 10, unsorted = false) {
        let words = new Set<string>();
        let ruleSelector = new WeightedSelector(this.ruleset);
        while (words.size < n) {
            let rule = ruleSelector.select();
            let word = this.applyFilters(this.runRule(rule));
            if (word != 'REJECT') {
                words.add(rule);
            }
        }
        let wordList = Array.from(words);
        if (!unsorted) {
            if (this.sorter) {
                wordList = this.sorter.sort(wordList);
            } else {
                wordList.sort()
            }
        }
        return wordList;
    }
};

export const textify = (phsys: SoundSystem, sentences = 11) => {
    let text = '';
    for (let i = 0; i < sentences; ++i) {
        let sent = Math.floor(Math.random() * 9) + 3;
        let comma = -1;
        if (sent >= 7) {
            comma = Math.floor(Math.random() * (sent - 1));
        }

        // JS has no function to capitalize just the first letter, hence the regex
        text += phsys.generate(1, true)[0]!
            .replace(/\b\w/g, l => l.toUpperCase());
        
        for (let j = 0; j < sent; ++j) {
            text += ` ${phsys.generate(1, true)[0]}`;
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
    text = wrap(text);
    return text;
};