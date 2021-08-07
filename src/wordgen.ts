import { initialize } from './SmartClusters';
import WeightedSelector from './distribution';
import wrap from './textwrap';
import last from './last';
import Word from './word';

const invalidItemAndWeight = (item: string) => {
    let parts = item.split(':');
    if (parts.length !== 2) {
        return false;
    }
    let weight = +parts[1]!;
    return isNaN(weight) || weight <= 0 || weight === Infinity;
}

class ArbSorter {
    private splitter: RegExp;
    private ords: { [key: string]: number };
    private vals: string[];
    
    constructor(order: string) {
        let graphs = order.split(/\s+/gu);
        let splitOrder = [...graphs].sort((a, b) => b.length - a.length);
        this.splitter = new RegExp(`(${splitOrder.join('|')}|.)`, 'gu');
        
        this.ords = {};
        this.vals = [];
        for (let i in graphs) {
            this.ords[graphs[i]!] = +i;
            this.vals.push(graphs[i]!);
        }
    }
    
    wordAsValues(word: string) {
        let w = this.split(word);
        let arrayedWord = w.map(char => this.ords[char]);
        if (arrayedWord.includes(undefined)) {
            throw new Error(`word with unknown letter: '${word}'.\n`
                + 'A filter or assimilation might have caused this.');
        }
        return <number[]>arrayedWord;
    }
    
    valuesAsWord(values: number[]) {
        return values.map(v => this.vals[v]!)
            .join('');
    }
    
    split(word: string) {
        return word.split(this.splitter)
            .filter((_, i) => i % 2);
    }
    
    sort(l: string[]) {
        let l2 = l.map(el => this.wordAsValues(el));
        l2.sort((a, b) => a[0]! - b[0]!);
        return l2.map(el => this.valuesAsWord(el));
    }
}

interface Rule {
    _weight: number,
    [key: string]: number
}

class SoundSystem {
    private phonemeset: { [key: string]: WeightedSelector } = {};
    private filters: [string, string][] = [];
    
    randpercent = 10;
    useAssim = false;
    useCoronalMetathesis = false;
    ruleset: { [key: string]: Rule } = {};
    sorter: ArbSorter | null = null;
    
    private runRule(rule: string) {
        let n = rule.length;
        let s: string[] = [];
        for (let i = 0; i < n; ++i) {
            if ('?!'.includes(rule[i]!)) {
                continue;
            }
            
            if (i < n - 1 && rule[i + 1] === '?') {
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
                    throw new Error("misplaced '!' option: in non-duplicate"
                        + ` environment: '${rule}'.`);
                }
                if (rule[i]! in this.phonemeset) {
                    let nph: string;
                    do {
                        nph = this.phonemeset[rule[i]!]!.select();
                    } while (nph === last(s));
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
    
    private applyFilters(word: Word) {
        if (this.useAssim) {
            word.applyAssimilations();
        }
        if (this.useCoronalMetathesis) {
            word.applyCoronalMetathesis();
        }
        
        word.applyFilters(this.filters);
        
        return word;
    }
    
    addPhUnit(name: string, selection: string) {
        const naturalWeights = (phonemes: string) => {
            const jitter = (v: number, percent = 10) => {
                let move = v + percent / 100;
                return v + move * (Math.random() - 0.5);
            };
            
            let p = phonemes.split(/\s+/gu);
            let weighted: { [key: string]: number } = {};
            let n = p.length;
            for (let i = 0; i < n; ++i) {
                weighted[p[i]!] = jitter(
                    (Math.log(n + 1) - Math.log(i + 1)) / n
                );
            }
            let temp = '';
            for (let k in weighted) {
                temp += `${k}:${weighted[k]} `;
            }
            temp.trim();
            return temp;
        };
        
        const ruleToDict = (rule: string) => {
            let items = rule.trim().split(/\s+/gu);
            let d: { [key: string]: number } = {};
            for (let item of items) {
                if (invalidItemAndWeight(item)) {
                    throw new Error(`'${item}' is not a valid phoneme and `
                        + 'weight.');
                }
                let [value, weight] = <[string, string]>item.split(':');
                d[value] = +weight;
            }
            return d;
        };
        
        if (!selection.includes(':')) {
            selection = naturalWeights(selection);
        }
        this.phonemeset[name] = new WeightedSelector(ruleToDict(selection));
    }
    
    addRule(rule: string, weight: number, cat = 'words:') {
        if (this.ruleset[cat]) {
            this.ruleset[cat]![rule] = weight;
        } else {
            throw new Error(`uninitialized category '${cat}' referenced.`)
        }
    }
    
    addCategory(name: string, weight: number) {
        this.ruleset[name] = { _weight: weight };
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
        initialize();
    }
    
    useDigraphs() {
        initialize('digraph');
    }
    
    withStdAssimilations() {
        this.useAssim = true;
    }
    
    withCoronalMetathesis() {
        this.useCoronalMetathesis = true;
    }
    
    generate(
        n: number,
        verbose: boolean,
        unsorted: boolean,
        category: string,
        force = false
    ) {
        let words = new Set<string>();
        Word.verbose = verbose;
        Word.sorter = this.sorter;
        let ruleSelector: WeightedSelector;
        
        if (this.ruleset[category]) {
            let dict = { ...this.ruleset[category], _weight: undefined };
            if (Object.keys(dict).length === 1) {
                dict = { [category]: 0, ...dict };
            }
            ruleSelector = new WeightedSelector(dict);
        } else {
            throw new Error(`unknown category '${category}'.`);
        }
        
        /* If they request more words than are possible, we don't want to lock
           up. Instead, try up to twice as many times (plus one just in case),
           and then cut off after that. However, this doesn't guarantee that
           it's impossible to generate more. Setting `force` to true requires
           it to generate that many words, or freeze if it can't. It's
           currently only used in paragraph mode, which chooses one word at a
           time. I think it's safe to assume it's always possible to generate
           at least one valid word. */
        for (let i = 0; force || i < n * 2 + 1; ++i) {
            let rule = ruleSelector.select();
            let form = this.runRule(rule);
            let word = new Word(form, rule);
            this.applyFilters(word);
            if (word.toString() !== 'REJECT') {
                words.add(word.toString());
                if (words.size === n) {
                    break;
                }
            }
        }
        
        let wordList = Array.from(words);
        if (!(unsorted || verbose)) {
            if (this.sorter) {
                wordList = this.sorter.sort(wordList);
            } else {
                wordList.sort()
            }
        }
        return wordList;
    }
    
    randomCategory() {
        let weightedCats: { [key: string]: number } = {};
        for (let cat in this.ruleset) {
            weightedCats[cat] = this.ruleset[cat]!._weight;
        }
        let catSelector = new WeightedSelector(weightedCats);
        return catSelector.select();
    }
};

const textify = (phsys: SoundSystem, sentences = 25) => {
    let text = '';
    for (let i = 0; i < sentences; ++i) {
        let sent = Math.floor(Math.random() * 9) + 3;
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
        )[0]!
            .toString()
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
    text = wrap(text.trim());
    return text;
};

export { SoundSystem, textify, ArbSorter, invalidItemAndWeight };
