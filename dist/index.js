"use strict";
/*!
Lexifer TS v1.1.2-alpha+2

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
        for (let key in dic) {
            let weight = dic[key];
            if (typeof weight == 'number') {
                this.keys.push(key);
                this.weights.push(weight);
            }
        }
        this.sum = this.weights.reduce((a, b) => a + b, 0);
    }
    select() {
        let pick = Math.random() * this.sum;
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
        let pd = new PhonologyDefinition(file, stderr);
        if (num) {
            if (num < 0) {
                stderr(`Cannot generate ${num} words.`);
                ans = pd.paragraph();
            }
            else {
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
                ans = wrap(pd.generate(num, verbose, unsorted, onePerLine));
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
            ans = pd.paragraph();
        }
    }
    catch (e) {
        stderr(e);
    }
    return ans;
};
const genWords = () => {
    document.getElementById('errors').innerHTML = '';
    document.getElementById('result').innerHTML = main(document.getElementById('def').value, parseInt(document.getElementById('number').value) || undefined, document.getElementById('verbose').checked, document.getElementById('unsorted').checked, document.getElementById('one-per-line').checked, message => {
        document.getElementById('errors').innerHTML += message + '<br />';
    }).replace(/\n/gu, '<br />');
};
const last = (arr) => {
    return arr && arr[arr.length - 1];
};
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
                let randpercent = +line.substring(12);
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
            let letters = new Set(this.letters);
            let phonemes = new Set(this.phClasses);
            if (phonemes.size > letters.size) {
                let diff = [...phonemes].filter(el => {
                    if (letters.has(el)) {
                        return false;
                    }
                    else if (letters.has(el.split(':')[0])) {
                        return false;
                    }
                    else {
                        return true;
                    }
                });
                this.stderr(`A phoneme class contains '${diff.join(' ')}' `
                    + "missing from 'letters'.  Strange word shapes are likely"
                    + ' to result.');
            }
        }
    }
    parseOption(line) {
        for (let option of line.split(/\s+/gu)) {
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
            let filtParts = filt.split('>');
            if (filtParts.length !== 2) {
                throw new Error(`malformed filter '${filt}': filters must look`
                    + " like 'old > new'.");
            }
            let pre = filtParts[0].trim();
            let post = filtParts[1].trim();
            this.soundsys.addFilter(pre, post);
        }
    }
    parseReject(line) {
        for (let filt of line.split(/\s+/gu)) {
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
        let rules = line.split(/\s+/gu);
        let weighted = line.includes(':');
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
                    + `${(cat ? ` (in category ${cat})` : '')} will only `
                    + 'produce empty words.');
            }
            else if (rule.match(/^\?*[^?!]!?\?+!?$/u)) {
                this.stderr(`'${rules[i]}'`
                    + `${(cat ? ` (in category ${cat})` : '')} may produce `
                    + 'empty words.');
            }
            rule = this.expandMacros(rule);
            this.soundsys.addRule(rule, weight, cat);
        }
    }
    expandMacros(word) {
        for (let [macro, value] of this.macros) {
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
        let c2list = this.defFileArr[this.defFileLineNum]
            .split(/\s+/gu);
        c2list.shift();
        let n = c2list.length;
        while (!['', '\n', undefined].includes(this.defFileArr[this.defFileLineNum])) {
            let line = (_a = this.defFileArr[++this.defFileLineNum]) !== null && _a !== void 0 ? _a : '';
            line = line.replace(/#.*/, '').trim();
            if (line === '') {
                continue;
            }
            let row = line.split(/\s+/gu);
            let c1 = row.splice(0, 1);
            if (row.length === n) {
                for (let i = 0; i < n; ++i) {
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
            else if (row.length > n) {
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
        let splitLine = line.split(/\s+/gu);
        let weighted = line.includes(':');
        for (let cat of splitLine) {
            if (weighted) {
                if (invalidItemAndWeight(cat)) {
                    throw new Error(`'${cat}' is not a valid category and `
                        + 'weight.');
                }
                let [name, weight] = cat.split(':');
                let weightNum = +weight;
                this.categories.push(name);
                this.soundsys.addCategory(name, weightNum);
            }
            else {
                this.categories.push(cat);
                this.soundsys.addCategory(cat, 1);
            }
        }
    }
    generate(n = 1, verbose = false, unsorted = verbose, onePerLine = false) {
        let words = '';
        let wordList = [];
        for (let cat of this.categories) {
            wordList = this.soundsys.generate(n, verbose, unsorted, cat);
            if (wordList.length < n) {
                this.stderr(`Could only generate ${wordList.length} word`
                    + `${wordList.length === 1 ? '' : 's'} `
                    + (cat === 'words:' ? '' : `of category '${cat}' `)
                    + `(${n} requested).`);
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
let phdb = [];
const initialize = (isIpa = true) => {
    if (isIpa) {
        for (let row of data) {
            phdb.push([row[0], row[2], row[3], row[4]]);
        }
    }
    else {
        for (let row of data) {
            phdb.push([row[1], row[2], row[3], row[4]]);
        }
    }
};
const applyAssimilations = (word) => {
    const nasalAssimilate = (ph1, ph2) => {
        let data1 = phdb.find(el => el[0] === ph1);
        if (data1 && data1[3] === 2) {
            let data2 = phdb.find(el => el[0] === ph2);
            if (data2) {
                let result = phdb.find(el => el[2] === data2[2] && el[3] === 2);
                if (result) {
                    return result[0];
                }
            }
        }
        return ph1;
    };
    const voiceAssimilate = (ph1, ph2) => {
        let data2 = phdb.find(el => el[0] === ph2);
        if (data2 && data2[3] !== 2) {
            let data1 = phdb.find(el => el[0] === ph1);
            if (data1) {
                let result = phdb.find(el => el[1] === data2[1]
                    && el[2] === data1[2]
                    && el[3] === data1[3]);
                if (result) {
                    return result[0];
                }
            }
        }
        return ph1;
    };
    let newArr = [...word];
    for (let i = 0; i < word.length - 1; ++i) {
        newArr[i] = voiceAssimilate(word[i], word[i + 1]);
        newArr[i] = nasalAssimilate(newArr[i], word[i + 1]);
    }
    return newArr;
};
const applyCoronalMetathesis = (word) => {
    const coronalMetathesis = (ph1, ph2) => {
        let data1 = phdb.filter(el => el[0] === ph1)[0];
        if (data1 && data1[2] === 2) {
            let data2 = phdb.filter(el => el[0] === ph2)[0];
            if (data2
                && [6, 0].includes(data2[2])
                && [0, 2].includes(data2[3])
                && data2[3] === data1[3]) {
                return [ph2, ph1];
            }
        }
        return [ph1, ph2];
    };
    let newArr = [...word];
    for (let i = 0; i < word.length - 1; ++i) {
        [newArr[i], newArr[i + 1]] = coronalMetathesis(word[i], word[i + 1]);
    }
    return newArr;
};
const wrap = (s) => s.replace(/(?![^\n]{1,70}$)([^\n]{1,70})\s/gu, '$1\n');
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
        for (let filt of filters) {
            this.applyFilter(...filt);
            if (last(this.forms) === 'REJECT') {
                return;
            }
        }
    }
    applyAssimilations() {
        if (Word.sorter) {
            let newWord = applyAssimilations(Word.sorter.split(last(this.forms)))
                .join('');
            if (newWord !== last(this.forms)) {
                this.forms.push(newWord);
                this.filters.push('std-assimilations');
            }
        }
    }
    applyCoronalMetathesis() {
        if (Word.sorter) {
            let newWord = applyCoronalMetathesis(Word.sorter.split(last(this.forms)))
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
            for (let i in this.forms) {
                ans += `${this.filters[i]} – ${this.forms[i]}\n`;
            }
            return ans;
        }
        else {
            return last(this.forms);
        }
    }
}
Word.verbose = false;
Word.sorter = null;
const invalidItemAndWeight = (item) => {
    let parts = item.split(':');
    if (parts.length !== 2) {
        return true;
    }
    let weight = +parts[1];
    return isNaN(weight) || weight < 0 || weight === Infinity;
};
class ArbSorter {
    constructor(order) {
        let graphs = order.split(/\s+/gu);
        let splitOrder = [...graphs].sort((a, b) => b.length - a.length);
        this.splitter = new RegExp(`(${splitOrder.join('|')}|.)`, 'gu');
        this.ords = {};
        this.vals = [];
        for (let i in graphs) {
            this.ords[graphs[i]] = +i;
            this.vals.push(graphs[i]);
        }
    }
    wordAsValues(word) {
        let w = this.split(word);
        let arrayedWord = w.map(char => this.ords[char]);
        if (arrayedWord.includes(undefined)) {
            throw new Error(`word with unknown letter: '${word}'.\n`
                + 'A filter or assimilation might have caused this.');
        }
        return arrayedWord;
    }
    valuesAsWord(values) {
        return values.map(v => this.vals[v])
            .join('');
    }
    split(word) {
        return word.split(this.splitter)
            .filter((_, i) => i % 2);
    }
    sort(l) {
        let l2 = l.filter(el => el !== '').map(el => this.wordAsValues(el));
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
        let n = rule.length;
        let s = [];
        if (rule[0] === '!' || rule[1] === '!' || rule.includes('!!')) {
            throw new Error("misplaced '!' option: in non-duplicate "
                + `environment: '${rule}'.`);
        }
        for (let i = 0; i < n; ++i) {
            if ('?!'.includes(rule[i])) {
                continue;
            }
            if (i < n - 1 && rule[i + 1] === '?') {
                if (Math.random() * 100 < this.randpercent) {
                    if (rule[i] in this.phonemeset) {
                        s.push(this.phonemeset[rule[i]].select());
                    }
                    else {
                        s.push(rule[i]);
                    }
                }
            }
            else if (i < n - 1
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
                    } while (nph === last(s));
                    s.push(nph);
                }
            }
            else if (rule[i] in this.phonemeset) {
                s.push(this.phonemeset[rule[i]].select());
            }
            else {
                s.push(rule[i]);
            }
        }
        return s.join('');
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
            const jitter = (v, percent = 10) => {
                let move = v * percent / 100;
                return v + move * (Math.random() - 0.5);
            };
            let p = phonemes.split(/\s+/gu);
            let weighted = {};
            let n = p.length;
            for (let i = 0; i < n; ++i) {
                weighted[p[i]] = jitter((Math.log(n + 1) - Math.log(i + 1)) / n);
            }
            let temp = '';
            for (let k in weighted) {
                temp += `${k}:${weighted[k]} `;
            }
            temp.trim();
            return temp;
        };
        const ruleToDict = (rule) => {
            let items = rule.trim().split(/\s+/gu);
            let d = {};
            for (let item of items) {
                if (invalidItemAndWeight(item)) {
                    throw new Error(`'${item}' is not a valid phoneme and `
                        + 'weight.');
                }
                let [value, weight] = item.split(':');
                d[value] = +weight;
            }
            return d;
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
    generate(n, verbose, unsorted, category, force = false) {
        let words = new Set();
        Word.verbose = verbose;
        Word.sorter = this.sorter;
        let ruleSelector;
        if (!this.ruleset[category]) {
            throw new Error(`unknown category '${category}'.`);
        }
        let dict = Object.assign(Object.assign({}, this.ruleset[category]), { [_weight]: undefined });
        if (Object.keys(dict).length === 1) {
            dict = Object.assign({ [category]: 0 }, dict);
        }
        ruleSelector = new WeightedSelector(dict);
        for (let i = 0; force || i < 3 * n; ++i) {
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
            }
            else {
                wordList.sort();
            }
        }
        return wordList;
    }
    randomCategory() {
        let weightedCats = {};
        for (let cat in this.ruleset) {
            weightedCats[cat] = this.ruleset[cat][_weight];
        }
        let catSelector = new WeightedSelector(weightedCats);
        return catSelector.select();
    }
}
const textify = (phsys, sentences = 25) => {
    let text = '';
    for (let i = 0; i < sentences; ++i) {
        let sent = Math.floor(Math.random() * 9) + 3;
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
