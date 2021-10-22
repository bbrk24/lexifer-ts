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

import { SoundSystem, textify, invalidItemAndWeight } from './wordgen';

class PhonologyDefinition {
    private macros: [RegExp, string][] = [];
    private letters: string[] = [];
    private phClasses: string[] = [];
    private categories: string[] = [];

    // This is a bit of a hack since the browser doesn't read files directly.
    private defFileLineNum = 0;
    private defFileArr: string[];

    soundsys = new SoundSystem();

    constructor(
        defFile: string,
        private stderr: (inp: Error | string) => void
    ) {
        if (defFile.trim() === '') {
            throw new Error('Please include a definition.');
        }

        this.defFileArr = defFile.split('\n');
        this.parse();
        this.sanityCheck();
    }

    private parse() {
        for (;
            this.defFileLineNum < this.defFileArr.length;
            ++this.defFileLineNum
        ) {
            let line = this.defFileArr[this.defFileLineNum]!;

            line = line.replace(/#.*/u, '').trim();
            if (line === '') {
                continue;
            }

            if (line.startsWith('with:')) {
                this.parseOption(line.substring(5).trim());
            } else if (line.startsWith('random-rate:')) {
                const randpercent = +line.substring(12);
                if (randpercent >= 0 && randpercent <= 100) {
                    this.soundsys.randpercent = randpercent;
                } else {
                    throw new Error('Invalid random-rate.');
                }
            } else if (line.startsWith('filter:')) {
                this.parseFilter(line.substring(7).trim());
            } else if (line.startsWith('reject:')) {
                this.parseReject(line.substring(7).trim());
            } else if (line.startsWith('words:')) {
                this.parseWords(line.substring(6).trim());
            } else if (line.startsWith('letters:')) {
                this.parseLetters(line.substring(8).trim());
            } else if (line.startsWith('categories:')) {
                this.parseCategories(line.substring(11).trim());
            } else if (line[0] === '%') {
                this.parseClusterfield();
            } else if (line.includes('=')) {
                this.parseClass(line);
            } else {
                throw new Error(`parsing error at '${line}'.`);
            }
        }
        if ((this.soundsys.useAssim || this.soundsys.useCoronalMetathesis)
            && !this.soundsys.sorter
        ) {
            this.stderr("Without 'letters:' cannot apply assimilations or "
                + 'coronal metathesis.');
        }
    }

    private sanityCheck() {
        if (this.letters.length) {
            const letters = new Set(this.letters);
            const phonemes = new Set(this.phClasses);
            if (phonemes.size > letters.size) {
                const diff = [...phonemes].filter(el => {
                    if (letters.has(el)) {
                        return false;
                    } else if (letters.has(el.split(':')[0]!)) {
                        return false;
                    }

                    return true;
                });
                this.stderr(`A phoneme class contains '${diff.join(' ')}' `
                    + "missing from 'letters'.  Strange word shapes are likely"
                    + ' to result.');
            }
        }
    }

    private parseOption(line: string) {
        for (const option of line.split(/\s+/gu)) {
            switch (option) {
            case 'std-ipa-features':
                this.soundsys.useIpa();

                break;
            case 'std-digraph-features':
                this.soundsys.useDigraphs();

                break;
            case 'std-assimilations':
                this.soundsys.useAssim = true;

                break;
            case 'coronal-metathesis':
                this.soundsys.useCoronalMetathesis = true;

                break;
            default:
                throw new Error(`unknown option '${option}'.`);
            }
        }
    }

    private parseFilter(line: string) {
        for (let filt of line.split(';')) {
            filt = filt.trim();
            if (filt === '') {
                continue;
            }

            const filtParts = filt.split('>');
            if (filtParts.length !== 2) {
                throw new Error(`malformed filter '${filt}': filters must look`
                    + " like 'old > new'.");
            }

            const pre = filtParts[0]!.trim();
            const post = filtParts[1]!.trim();
            this.soundsys.addFilter(pre, post);
        }
    }

    private parseReject(line: string) {
        for (const filt of line.split(/\s+/gu)) {
            this.soundsys.addFilter(filt, 'REJECT');
        }
    }

    private parseWords(line: string) {
        if (this.categories.length > 0 && this.categories[0] !== 'words:') {
            throw new Error("both 'words:' and 'categories:' found. Please "
                + 'only use one.');
        } else if (this.categories.length === 0) {
            this.soundsys.addCategory('words:', 1);
        }

        this.categories = ['words:'];

        this.addRules(line);
    }

    private addRules(line: string, cat?: string) {
        const rules = line.split(/\s+/gu);
        const weighted = line.includes(':');

        // Only warn about this once. Besides, it can be detected right away.
        if (line.includes('??')) {
            this.stderr("'??' is treated as '?'.");
        }

        // Only warn about this once. It can also be detected right away, but
        // it's harder to find.
        if (line[0] === '?' || line.match(/\s\?[^?!]/u)) {
            // That doesn't need /g since I'm using it as a boolean test.
            this.stderr("'?' at the beginning of a rule does nothing.");
        }

        for (let i = 0; i < rules.length; ++i) {
            let rule: string;
            let weight: number;

            if (weighted) {
                if (invalidItemAndWeight(rules[i]!)) {
                    throw new Error(`'${rules[i]}' is not a valid pattern and `
                        + 'weight.');
                }

                let weightStr: string;
                [rule, weightStr] = <[string, string]>rules[i]!.split(':');
                weight = +weightStr;
            } else {
                rule = rules[i]!;
                weight = 10.0 / (i + 1) ** 0.9;
            }

            // Inform the user of empty words. Error if it will only produce
            // empty words, but if it only sometimes produces empty words, only
            // warn them.
            if (!rule.match(/[^?!]/u)) {
                throw new Error(`'${rules[i]}'`
                    + `${cat ? ` (in category ${cat})` : ''} will only `
                    + 'produce empty words.');
            } else if (rule.match(/^\?*[^?!]!?\?+!?$/u)) {
                // Here, we don't know what random-rate or category weight is,
                // so this may not even be an issue.
                this.stderr(`'${rules[i]}'`
                    + `${cat ? ` (in category ${cat})` : ''} may produce `
                    + 'empty words.');
            }

            rule = this.expandMacros(rule);

            this.soundsys.addRule(rule, weight, cat);
        }
    }

    private expandMacros(word: string) {
        for (const [macro, value] of this.macros) {
            word = word.replace(macro, value);
        }

        return word;
    }

    private parseLetters(line: string) {
        this.letters = line.split(/\s+/gu);
        this.soundsys.addSortOrder(line);
    }

    private parseClusterfield() {
        const c2list = this.defFileArr[this.defFileLineNum]!
            .split(/\s+/gu);
        c2list.shift();
        const rowLength = c2list.length;

        while (!['', '\n', undefined].includes(
            this.defFileArr[this.defFileLineNum]
        )) {
            let line = this.defFileArr[++this.defFileLineNum] ?? '';
            line = line.replace(/#.*/u, '').trim();
            if (line === '') {
                continue;
            }

            const row = line.split(/\s+/gu);
            const c1 = row.splice(0, 1);

            if (row.length === rowLength) {
                for (let i = 0; i < rowLength; ++i) {
                    if (row[i] === '+') {
                        continue;
                    } else if (row[i] === '-') {
                        this.soundsys.addFilter(c1 + c2list[i]!, 'REJECT');
                    } else {
                        this.soundsys.addFilter(c1 + c2list[i]!, row[i]!);
                    }
                }
            } else if (row.length > rowLength) {
                throw new Error(`cluster field row too long: '${line}'.`);
            } else {
                throw new Error(`cluster field row too short: '${line}'.`);
            }
        }
    }

    private parseClass(line: string) {
        let [sclass, values] = <[string, string]>line.split('=');
        sclass = sclass.trim();
        values = values.trim();
        if (sclass[0] === '$') {
            this.macros.push([
                new RegExp(`\\${sclass}`, 'gu'),
                values
            ]);
        } else if (sclass.length === 1) {
            this.phClasses = this.phClasses.concat(values.split(/\s+/gu));
            this.soundsys.addPhUnit(sclass, values);
        } else if (this.categories.includes(sclass)) {
            this.addRules(values, sclass);
        } else {
            throw new Error(`unknown category '${sclass}'. Please put category`
                + " definitions after the 'categories:' statement.");
        }
    }

    private parseCategories(line: string) {
        if (this.categories.includes('words:')) {
            throw new Error("both 'words:' and 'categories:' found. Please "
                + 'only use one.');
        }

        const splitLine = line.split(/\s+/gu);
        const weighted = line.includes(':');

        for (const cat of splitLine) {
            if (weighted) {
                if (invalidItemAndWeight(cat)) {
                    throw new Error(`'${cat}' is not a valid category and `
                        + 'weight.');
                }

                const [name, weight] = <[string, string]>cat.split(':');
                const weightNum = +weight;

                this.categories.push(name);
                this.soundsys.addCategory(name, weightNum);
            } else {
                this.categories.push(cat);
                this.soundsys.addCategory(cat, 1);
            }
        }
    }

    generate(
        numWords = 1,
        verbose = false,
        unsorted = verbose,
        onePerLine = false
    ) {
        let words = '';
        let wordList: string[] = [];

        for (const cat of this.categories) {
            wordList = this.soundsys.generate(numWords, verbose, unsorted, cat);
            if (wordList.length < numWords) {
                this.stderr(`Could only generate ${wordList.length} word`
                    + `${wordList.length === 1 ? '' : 's'} `
                    + (cat === 'words:' ? '' : `of category '${cat}' `)
                    + `(${numWords} requested).`);
            }

            if (cat !== 'words:') {
                words += `\n\n${cat}:\n`;
            }

            words += wordList.join(onePerLine || verbose ? '\n' : ' ');
        }

        return words.trim();
    }

    paragraph(sentences?: number) {
        return textify(this.soundsys, sentences);
    }
}

export default PhonologyDefinition;
