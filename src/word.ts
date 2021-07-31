import last from './last';
import { applyAssimilations, applyCoronalMetathesis } from './SmartClusters';
import { ArbSorter } from './wordgen';

class Word {
    static verbose = false;
    static sorter: ArbSorter | null = null;

    private forms: string[];
    private filters: string[];

    get lastForm() {
        return last(this.forms);
    }

    constructor(form: string, rule: string) {
        this.forms = [form];
        this.filters = [rule];
    }

    private applyFilter(pat: string, repl: string) {
        let regex = new RegExp(pat, 'gu');

        let newWord = last(this.forms)!;
        newWord = newWord.replace(regex, repl);
        if (newWord.includes('REJECT')) {
            newWord = 'REJECT';
        }

        if (newWord !== last(this.forms)) {
            this.forms.push(newWord);
            this.filters.push(`${pat} > ${repl || '!'}`);
        }
    }

    applyFilters(filters: [string, string][]) {
        for (let filt of filters) {
            this.applyFilter(...filt);
            if (last(this.forms) === 'REJECT') {
                return;
            }
        }
    }

    applyAssimilations() {
        if (Word.sorter) {
            let newWord = applyAssimilations(
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
        if (Word.sorter) {
            let newWord = applyCoronalMetathesis(
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
            for (let i = this.forms.length - 1; i >= 0; --i) {
                ans += `${this.forms[i]} -- ${this.filters[i]}\n`;
            }
            return ans;
        } else {
            return last(this.forms)!;
        }
    }
}

class WordSet {
    readonly arr: Word[];

    get size() {
        return this.arr.length;
    }

    constructor(words: Word[] = []) {
        this.arr = [];
        words.forEach(el => this.addWord(el));
    }

    addWord(word: Word) {
        if (this.arr.every(el => el.toString() != word.toString())) {
            this.arr.push(word);
        }
    }
}

export { Word, WordSet };
