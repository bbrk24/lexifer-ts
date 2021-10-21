"use strict";
/*!
Lexifer TS v1.1.2-beta.4+2

Copyright (c) 2021 William Baker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
class WeightedSelector {
    constructor(dic) {
        this.keys = [];
        this.weights = [];
        for (const key in dic) {
            const weight = dic[key];
            if (typeof weight == 'number') {
                this.keys.push(key);
                this.weights.push(weight);
            }
        }
        this.sum = this.weights.reduce((a, b) => a + b, 0);
    }
    select() {
        const pick = Math.random() * this.sum;
        let temp = 0;
        for (let i = 0; i < this.keys.length; ++i) {
            temp += this.weights[i];
            if (pick < temp) {
                return this.keys[i];
            }
        }
        throw new Error('failed to choose options from '
            + `'${this.keys.join("', '")}'.`);
    }
}
const main = (file, num, verbose = false, unsorted, onePerLine = false, stderr = console.error) => {
    let ans = '';
    try {
        const phonDef = new PhonologyDefinition(file, stderr);
        if (num) {
            if (num < 0 || num === Infinity) {
                stderr(`Cannot generate ${num} words.`);
                ans = phonDef.paragraph();
            }
            else {
                if (num !== Math.round(num)) {
                    stderr(`Requested number of words (${num}) is not an `
                        + `integer. Rounding to ${Math.round(num)}.`);
                    num = Math.round(num);
                }
                if (verbose) {
                    if (unsorted === false) {
                        stderr("** 'Unsorted' option always enabled in verbose "
                            + 'mode.');
                        unsorted = true;
                    }
                    if (onePerLine) {
                        stderr("** 'One per line' option ignored in verbose "
                            + 'mode.');
                    }
                }
                ans = wrap(phonDef.generate(num, verbose, unsorted, onePerLine));
            }
        }
        else {
            if (verbose) {
                stderr("** 'Verbose' option ignored in paragraph mode.");
            }
            if (unsorted) {
                stderr("** 'Unsorted' option ignored in paragraph mode.");
            }
            if (onePerLine) {
                stderr("** 'One per line' option ignored in paragraph mode.");
            }
            ans = phonDef.paragraph();
        }
    }
    catch (e) {
        stderr(e);
    }
    return ans;
};
const genWords = () => {
    document.getElementById('errors').innerHTML = '';
    document.getElementById('result').innerHTML = main(document.getElementById('def').value, parseInt(document.getElementById('number').value), document.getElementById('verbose').checked, document.getElementById('unsorted').checked, document.getElementById('one-per-line').checked, message => {
        document.getElementById('errors').innerHTML += message + '<br />';
    }).replace(/\n/gu, '<br />');
};
const last = (arr) => arr && arr[arr.length - 1];
class PhonologyDefinition {
    constructor(defFile, stderr) {
        this.stderr = stderr;
        this.macros = [];
        this.letters = [];
        this.phClasses = [];
        this.categories = [];
        this.defFileLineNum = 0;
        this.soundsys = new SoundSystem();
        if (defFile.trim() === '') {
            throw new Error('Please include a definition.');
        }
        this.defFileArr = defFile.split('\n');
        this.parse();
        this.sanityCheck();
    }
    parse() {
        for (; this.defFileLineNum < this.defFileArr.length; ++this.defFileLineNum) {
            let line = this.defFileArr[this.defFileLineNum];
            line = line.replace(/#.*/u, '').trim();
            if (line === '') {
                continue;
            }
            if (line.startsWith('with:')) {
                this.parseOption(line.substring(5).trim());
            }
            else if (line.startsWith('random-rate:')) {
                const randpercent = +line.substring(12);
                if (randpercent >= 0 && randpercent <= 100) {
                    this.soundsys.randpercent = randpercent;
                }
                else {
                    throw new Error('Invalid random-rate.');
                }
            }
            else if (line.startsWith('filter:')) {
                this.parseFilter(line.substring(7).trim());
            }
            else if (line.startsWith('reject:')) {
                this.parseReject(line.substring(7).trim());
            }
            else if (line.startsWith('words:')) {
                this.parseWords(line.substring(6).trim());
            }
            else if (line.startsWith('letters:')) {
                this.parseLetters(line.substring(8).trim());
            }
            else if (line.startsWith('categories:')) {
                this.parseCategories(line.substring(11).trim());
            }
            else if (line[0] === '%') {
                this.parseClusterfield();
            }
            else if (line.includes('=')) {
                this.parseClass(line);
            }
            else {
                throw new Error(`parsing error at '${line}'.`);
            }
        }
        if ((this.soundsys.useAssim || this.soundsys.useCoronalMetathesis)
            && !this.soundsys.sorter) {
            this.stderr("Without 'letters:' cannot apply assimilations or "
                + 'coronal metathesis.');
        }
    }
    sanityCheck() {
        if (this.letters.length) {
            const letters = new Set(this.letters);
            const phonemes = new Set(this.phClasses);
            if (phonemes.size > letters.size) {
                const diff = [...phonemes].filter(el => {
                    if (letters.has(el)) {
                        return false;
                    }
                    else if (letters.has(el.split(':')[0])) {
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
    parseOption(line) {
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
    parseFilter(line) {
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
            const pre = filtParts[0].trim();
            const post = filtParts[1].trim();
            this.soundsys.addFilter(pre, post);
        }
    }
    parseReject(line) {
        for (const filt of line.split(/\s+/gu)) {
            this.soundsys.addFilter(filt, 'REJECT');
        }
    }
    parseWords(line) {
        if (this.categories.length > 0 && this.categories[0] !== 'words:') {
            throw new Error("both 'words:' and 'categories:' found. Please "
                + 'only use one.');
        }
        else if (this.categories.length === 0) {
            this.soundsys.addCategory('words:', 1);
        }
        this.categories = ['words:'];
        this.addRules(line);
    }
    addRules(line, cat) {
        const rules = line.split(/\s+/gu);
        const weighted = line.includes(':');
        if (line.includes('??')) {
            this.stderr("'??' is treated as '?'.");
        }
        if (line[0] === '?' || line.match(/\s\?[^?!]/u)) {
            this.stderr("'?' at the beginning of a rule does nothing.");
        }
        for (let i = 0; i < rules.length; ++i) {
            let rule;
            let weight;
            if (weighted) {
                if (invalidItemAndWeight(rules[i])) {
                    throw new Error(`'${rules[i]}' is not a valid pattern and `
                        + 'weight.');
                }
                let weightStr;
                [rule, weightStr] = rules[i].split(':');
                weight = +weightStr;
            }
            else {
                rule = rules[i];
                weight = 10.0 / Math.pow((i + 1), 0.9);
            }
            if (!rule.match(/[^?!]/u)) {
                throw new Error(`'${rules[i]}'`
                    + `${cat ? ` (in category ${cat})` : ''} will only `
                    + 'produce empty words.');
            }
            else if (rule.match(/^\?*[^?!]!?\?+!?$/u)) {
                this.stderr(`'${rules[i]}'`
                    + `${cat ? ` (in category ${cat})` : ''} may produce `
                    + 'empty words.');
            }
            rule = this.expandMacros(rule);
            this.soundsys.addRule(rule, weight, cat);
        }
    }
    expandMacros(word) {
        for (const [macro, value] of this.macros) {
            word = word.replace(macro, value);
        }
        return word;
    }
    parseLetters(line) {
        this.letters = line.split(/\s+/gu);
        this.soundsys.addSortOrder(line);
    }
    parseClusterfield() {
        var _a;
        const c2list = this.defFileArr[this.defFileLineNum]
            .split(/\s+/gu);
        c2list.shift();
        const rowLength = c2list.length;
        while (!['', '\n', undefined].includes(this.defFileArr[this.defFileLineNum])) {
            let line = (_a = this.defFileArr[++this.defFileLineNum]) !== null && _a !== void 0 ? _a : '';
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
                    }
                    else if (row[i] === '-') {
                        this.soundsys.addFilter(c1 + c2list[i], 'REJECT');
                    }
                    else {
                        this.soundsys.addFilter(c1 + c2list[i], row[i]);
                    }
                }
            }
            else if (row.length > rowLength) {
                throw new Error(`cluster field row too long: '${line}'.`);
            }
            else {
                throw new Error(`cluster field row too short: '${line}'.`);
            }
        }
    }
    parseClass(line) {
        let [sclass, values] = line.split('=');
        sclass = sclass.trim();
        values = values.trim();
        if (sclass[0] === '$') {
            this.macros.push([
                new RegExp(`\\${sclass}`, 'gu'),
                values
            ]);
        }
        else if (sclass.length === 1) {
            this.phClasses = this.phClasses.concat(values.split(/\s+/gu));
            this.soundsys.addPhUnit(sclass, values);
        }
        else if (this.categories.includes(sclass)) {
            this.addRules(values, sclass);
        }
        else {
            throw new Error(`unknown category '${sclass}'. Please put category`
                + " definitions after the 'categories:' statement.");
        }
    }
    parseCategories(line) {
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
                const [name, weight] = cat.split(':');
                const weightNum = +weight;
                this.categories.push(name);
                this.soundsys.addCategory(name, weightNum);
            }
            else {
                this.categories.push(cat);
                this.soundsys.addCategory(cat, 1);
            }
        }
    }
    generate(numWords = 1, verbose = false, unsorted = verbose, onePerLine = false) {
        let words = '';
        let wordList = [];
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
    paragraph(sentences) {
        return textify(this.soundsys, sentences);
    }
}
const data = [
    ['p', 'p', 0, 0, 0],
    ['b', 'b', 1, 0, 0],
    ['ɸ', 'ph', 0, 0, 1],
    ['β', 'bh', 1, 0, 1],
    ['f', 'f', 0, 1, 1],
    ['v', 'v', 1, 1, 1],
    ['m', 'm', 1, 0, 2],
    ['m', 'm', 1, 1, 2],
    ['t', 't', 0, 2, 0],
    ['d', 'd', 1, 2, 0],
    ['s', 's', 0, 2, 3],
    ['z', 'z', 1, 2, 3],
    ['θ', 'th', 0, 2, 1],
    ['ð', 'dh', 1, 2, 1],
    ['ɬ', 'lh', 0, 2, 4],
    ['ɮ', 'ldh', 1, 2, 4],
    ['tɬ', 'tl', 0, 2, 5],
    ['dɮ', 'dl', 1, 2, 5],
    ['ts', 'ts', 0, 2, 6],
    ['dz', 'dz', 1, 2, 6],
    ['ʃ', 'sh', 0, 3, 3],
    ['ʒ', 'zh', 1, 3, 3],
    ['tʃ', 'ch', 0, 3, 6],
    ['dʒ', 'j', 1, 3, 6],
    ['n', 'n', 1, 2, 2],
    ['ʈ', 'rt', 0, 4, 0],
    ['ɖ', 'rd', 1, 4, 0],
    ['ʂ', 'sr', 0, 4, 3],
    ['ʐ', 'zr', 1, 4, 3],
    ['ʈʂ', 'rts', 0, 4, 6],
    ['ɖʐ', 'rdz', 1, 4, 6],
    ['ɳ', 'rn', 1, 4, 2],
    ['c', 'ky', 0, 5, 0],
    ['ɟ', 'gy', 1, 5, 0],
    ['ɕ', 'sy', 0, 5, 3],
    ['ʑ', 'zy', 1, 5, 3],
    ['ç', 'hy', 0, 5, 1],
    ['ʝ', 'yy', 1, 5, 1],
    ['tɕ', 'cy', 0, 5, 6],
    ['dʑ', 'jy', 1, 5, 6],
    ['ɲ', 'ny', 1, 5, 2],
    ['k', 'k', 0, 6, 0],
    ['g', 'g', 1, 6, 0],
    ['x', 'kh', 0, 6, 1],
    ['ɣ', 'gh', 1, 6, 1],
    ['ŋ', 'ng', 1, 6, 2],
    ['q', 'q', 0, 7, 0],
    ['ɢ', 'gq', 1, 7, 0],
    ['χ', 'qh', 0, 7, 1],
    ['ʁ', 'gqh', 1, 7, 1],
    ['ɴ', 'nq', 1, 7, 2]
];
let phdb;
const initialize = (isIpa = true) => {
    phdb = [];
    if (isIpa) {
        for (const row of data) {
            phdb.push([row[0], row[2], row[3], row[4]]);
        }
    }
    else {
        for (const row of data) {
            phdb.push([row[1], row[2], row[3], row[4]]);
        }
    }
};
const applyAssimilations = (word) => {
    const nasalAssimilate = (ph1, ph2) => {
        const data1 = phdb.find(el => el[0] === ph1);
        if (data1 && data1[3] === 2) {
            const data2 = phdb.find(el => el[0] === ph2);
            if (data2) {
                const result = phdb.find(el => el[2] === data2[2] && el[3] === 2);
                if (result) {
                    return result[0];
                }
            }
        }
        return ph1;
    };
    const voiceAssimilate = (ph1, ph2) => {
        const data2 = phdb.find(el => el[0] === ph2);
        if (data2 && data2[3] !== 2) {
            const data1 = phdb.find(el => el[0] === ph1);
            if (data1) {
                const result = phdb.find(el => el[1] === data2[1]
                    && el[2] === data1[2]
                    && el[3] === data1[3]);
                if (result) {
                    return result[0];
                }
            }
        }
        return ph1;
    };
    const newArr = [...word];
    for (let i = 0; i < word.length - 1; ++i) {
        newArr[i] = voiceAssimilate(word[i], word[i + 1]);
        newArr[i] = nasalAssimilate(newArr[i], word[i + 1]);
    }
    return newArr;
};
const applyCoronalMetathesis = (word) => {
    const coronalMetathesis = (ph1, ph2) => {
        const data1 = phdb.filter(el => el[0] === ph1)[0];
        if (data1 && data1[2] === 2) {
            const data2 = phdb.filter(el => el[0] === ph2)[0];
            if (data2
                && [6, 0].includes(data2[2])
                && [0, 2].includes(data2[3])
                && data2[3] === data1[3]) {
                return [ph2, ph1];
            }
        }
        return [ph1, ph2];
    };
    const newArr = [...word];
    for (let i = 0; i < word.length - 1; ++i) {
        [newArr[i], newArr[i + 1]] = coronalMetathesis(word[i], word[i + 1]);
    }
    return newArr;
};
const wrap = (str) => str.replace(/(?![^\n]{1,70}$)([^\n]{1,70})\s/gu, '$1\n');
class Word {
    constructor(form, rule) {
        this.forms = [form];
        this.filters = [rule];
    }
    applyFilter(pat, repl) {
        let newWord = last(this.forms);
        newWord = newWord.replace(new RegExp(pat, 'gu'), repl);
        if (newWord.includes('REJECT')) {
            newWord = 'REJECT';
        }
        if (newWord !== last(this.forms)) {
            this.forms.push(newWord);
            this.filters.push(`${pat} > ${repl || '!'}`);
        }
    }
    applyFilters(filters) {
        for (const filt of filters) {
            this.applyFilter(...filt);
            if (last(this.forms) === 'REJECT') {
                return;
            }
        }
    }
    applyAssimilations() {
        if (Word.sorter) {
            const newWord = applyAssimilations(Word.sorter.split(last(this.forms)))
                .join('');
            if (newWord !== last(this.forms)) {
                this.forms.push(newWord);
                this.filters.push('std-assimilations');
            }
        }
    }
    applyCoronalMetathesis() {
        if (Word.sorter) {
            const newWord = applyCoronalMetathesis(Word.sorter.split(last(this.forms)))
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
        return last(this.forms);
    }
}
Word.verbose = false;
Word.sorter = null;
const invalidItemAndWeight = (item) => {
    const parts = item.split(':');
    if (parts.length !== 2) {
        return true;
    }
    const weight = +parts[1];
    return isNaN(weight) || weight < 0 || weight === Infinity;
};
class ArbSorter {
    constructor(order) {
        const graphs = order.split(/\s+/gu);
        const splitOrder = [...graphs].sort((a, b) => b.length - a.length);
        this.splitter = new RegExp(`(${splitOrder.join('|')}|.)`, 'gu');
        this.ords = {};
        this.vals = [];
        for (const i in graphs) {
            this.ords[graphs[i]] = +i;
            this.vals.push(graphs[i]);
        }
    }
    wordAsValues(word) {
        const splitWord = this.split(word);
        const arrayedWord = splitWord.map(char => this.ords[char]);
        if (arrayedWord.includes(undefined)) {
            throw new Error(`word with unknown letter: '${word}'.\n`
                + 'A filter or assimilation might have caused this.');
        }
        return arrayedWord;
    }
    valuesAsWord(values) {
        return values.map(el => this.vals[el])
            .join('');
    }
    split(word) {
        return word.split(this.splitter)
            .filter((_, i) => i % 2);
    }
    sort(list) {
        const l2 = list.filter(el => el !== '')
            .map(el => this.wordAsValues(el));
        l2.sort((a, b) => a[0] - b[0]);
        return l2.map(el => this.valuesAsWord(el));
    }
}
const _weight = Symbol();
class SoundSystem {
    constructor() {
        this.phonemeset = {};
        this.filters = [];
        this.randpercent = 10;
        this.useAssim = false;
        this.useCoronalMetathesis = false;
        this.ruleset = {};
        this.sorter = null;
    }
    runRule(rule) {
        const ruleLen = rule.length;
        const segments = [];
        if (rule[0] === '!' || rule[1] === '!' || rule.includes('!!')) {
            throw new Error("misplaced '!' option: in non-duplicate "
                + `environment: '${rule}'.`);
        }
        for (let i = 0; i < ruleLen; ++i) {
            if ('?!'.includes(rule[i])) {
                continue;
            }
            if (i < ruleLen - 1 && rule[i + 1] === '?') {
                if (Math.random() * 100 < this.randpercent) {
                    if (rule[i] in this.phonemeset) {
                        segments.push(this.phonemeset[rule[i]].select());
                    }
                    else {
                        segments.push(rule[i]);
                    }
                }
            }
            else if (i < ruleLen - 1
                && i > 0
                && rule[i + 1] === '!') {
                let prevc;
                if (rule[i - 1] === '?' && i > 2) {
                    prevc = rule[i - 2];
                }
                else {
                    prevc = rule[i - 1];
                }
                if (rule[i] !== prevc) {
                    throw new Error("misplaced '!' option: in non-duplicate"
                        + ` environment: '${rule}'.`);
                }
                if (rule[i] in this.phonemeset) {
                    let nph;
                    do {
                        nph = this.phonemeset[rule[i]].select();
                    } while (nph === last(segments));
                    segments.push(nph);
                }
            }
            else if (rule[i] in this.phonemeset) {
                segments.push(this.phonemeset[rule[i]].select());
            }
            else {
                segments.push(rule[i]);
            }
        }
        return segments.join('');
    }
    applyFilters(word) {
        if (this.useAssim) {
            word.applyAssimilations();
        }
        if (this.useCoronalMetathesis) {
            word.applyCoronalMetathesis();
        }
        word.applyFilters(this.filters);
        return word;
    }
    addPhUnit(name, selection) {
        const naturalWeights = (phonemes) => {
            const jitter = (val, percent = 10) => {
                const move = val * percent / 100;
                return val + move * (Math.random() - 0.5);
            };
            const phons = phonemes.split(/\s+/gu);
            const weighted = {};
            const numPhons = phons.length;
            for (let i = 0; i < numPhons; ++i) {
                weighted[phons[i]] = jitter((Math.log(numPhons + 1) - Math.log(i + 1)) / numPhons);
            }
            let temp = '';
            for (const key in weighted) {
                temp += `${key}:${weighted[key]} `;
            }
            temp.trim();
            return temp;
        };
        const ruleToDict = (rule) => {
            const items = rule.trim().split(/\s+/gu);
            const dict = {};
            for (const item of items) {
                if (invalidItemAndWeight(item)) {
                    throw new Error(`'${item}' is not a valid phoneme and `
                        + 'weight.');
                }
                const [value, weight] = item.split(':');
                dict[value] = +weight;
            }
            return dict;
        };
        if (!selection.includes(':')) {
            selection = naturalWeights(selection);
        }
        this.phonemeset[name] = new WeightedSelector(ruleToDict(selection));
    }
    addRule(rule, weight, cat = 'words:') {
        if (this.ruleset[cat]) {
            this.ruleset[cat][rule] = weight;
        }
        else {
            throw new Error(`uninitialized category '${cat}' referenced.`);
        }
    }
    addCategory(name, weight) {
        this.ruleset[name] = { [_weight]: weight };
    }
    addFilter(pat, repl) {
        if (repl === '!') {
            this.filters.push([pat, '']);
        }
        else {
            this.filters.push([pat, repl]);
        }
    }
    addSortOrder(order) {
        this.sorter = new ArbSorter(order);
    }
    useIpa() {
        initialize();
    }
    useDigraphs() {
        initialize(false);
    }
    generate(numWords, verbose, unsorted, category, force = false) {
        const words = new Set();
        Word.verbose = verbose;
        Word.sorter = this.sorter;
        if (!this.ruleset[category]) {
            throw new Error(`unknown category '${category}'.`);
        }
        let dict = Object.assign(Object.assign({}, this.ruleset[category]), { [_weight]: undefined });
        if (Object.keys(dict).length === 1) {
            dict = Object.assign({ [category]: 0 }, dict);
        }
        const ruleSelector = new WeightedSelector(dict);
        for (let i = 0; force || i < 3 * numWords; ++i) {
            const rule = ruleSelector.select();
            const form = this.runRule(rule);
            const word = new Word(form, rule);
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
            }
            else {
                wordList.sort();
            }
        }
        return wordList;
    }
    randomCategory() {
        const weightedCats = {};
        for (const cat in this.ruleset) {
            weightedCats[cat] = this.ruleset[cat][_weight];
        }
        const catSelector = new WeightedSelector(weightedCats);
        return catSelector.select();
    }
}
const textify = (phsys, sentences = 25) => {
    let text = '';
    for (let i = 0; i < sentences; ++i) {
        const sent = Math.floor(Math.random() * 9) + 3;
        let comma = -1;
        if (sent >= 7) {
            comma = Math.floor(Math.random() * (sent - 1));
        }
        text += phsys.generate(1, false, true, phsys.randomCategory(), true)[0].toString()
            .replace(/./u, el => el.toUpperCase());
        for (let j = 0; j < sent; ++j) {
            text += ` ${phsys.generate(1, false, true, phsys.randomCategory(), true)[0]}`;
            if (j === comma) {
                text += ',';
            }
        }
        if (Math.random() <= 0.85) {
            text += '. ';
        }
        else {
            text += '? ';
        }
    }
    return wrap(text.trim());
};
module.exports = main;
