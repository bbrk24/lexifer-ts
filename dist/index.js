"use strict";
/*! Lexifer TS v1.2.1-beta.2

Copyright (c) 2021-2022 William Baker

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
        const l2 = list.filter(el => el !== '').map(this.wordAsValues, this);
        l2.sort((a, b) => {
            for (let i = 0; i < Math.min(a.length, b.length); ++i) {
                if (a[i] !== b[i]) {
                    return a[i] - b[i];
                }
            }
            return a.length - b.length;
        });
        return l2.map(this.valuesAsWord, this);
    }
}
const last = (arr) => arr && arr[arr.length - 1];
class PhonologyDefinition {
    constructor(defFile, stderr) {
        this.stderr = stderr;
        this.macros = [];
        this.phClasses = [];
        this.letters = [];
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
        Fragment.addOptional = () => this.soundsys.randpercent > Math.random() * 100;
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
        if (this.soundsys.useAssim || this.soundsys.useCoronalMetathesis) {
            if (!Word.clusterEngine) {
                throw new Error('Must select a featureset.');
            }
            else if (!this.soundsys.sorter) {
                this.stderr("Without 'letters:' cannot apply assimilations or "
                    + 'coronal metathesis.');
            }
        }
    }
    sanityCheck() {
        if (this.letters.length > 0) {
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
        var _a;
        if (((_a = line.match(/features/gu)) !== null && _a !== void 0 ? _a : []).length > 1) {
            throw new Error('Must only choose one featureset.');
        }
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
        if (line[0] === '?' || /\s\?[^?!]/u.test(line)) {
            throw new Error("Rule cannot start with '?'.");
        }
        if (line.includes('??')) {
            this.stderr("'??' may cause unexpected behavior.");
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
                weight = 10 / (i + 1) ** 0.9;
            }
            if (!/[^?!]/u.test(rule)) {
                throw new Error(`'${rules[i]}'`
                    + `${cat ? ` (in category ${cat})` : ''} will only `
                    + 'produce empty words.');
            }
            else if (/^\?*[^?!]!?\?+!?$/u.test(rule)) {
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
            if (/\s/u.test(values)) {
                this.stderr(`Unexpected whitespace in macro '${sclass}'. `
                    + 'Macros cannot make choices, so this may give very '
                    + 'unexpected output.');
            }
            this.macros.push([
                new RegExp(`\\${sclass}`, 'gu'),
                values
            ]);
        }
        else if (sclass.length === 1) {
            this.phClasses.push(...values.split(/\s+/gu));
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
                this.categories.push(name);
                this.soundsys.addCategory(name, +weight);
            }
            else {
                this.categories.push(cat);
                this.soundsys.addCategory(cat, 1);
            }
        }
    }
    generate(numWords = 1, verbose = false, unsorted = verbose) {
        const retval = Object.create(null);
        for (const cat of this.categories) {
            const wordList = this.soundsys.generate(numWords, verbose, unsorted, cat);
            if (wordList.length < numWords) {
                this.stderr(`Could only generate ${wordList.length} word`
                    + `${wordList.length === 1 ? '' : 's'} `
                    + (cat === 'words:' ? '' : `of category '${cat}' `)
                    + `(${numWords} requested).`);
            }
            retval[cat] = wordList;
        }
        return retval;
    }
    paragraph(sentences) {
        return textify(this.soundsys, sentences);
    }
}
class Rule {
    constructor(rule) {
        if (rule[0] === '!' || rule.includes('!!')) {
            throw new Error("misplaced '!' option: in non-duplicate "
                + `environment: '${rule}'.`);
        }
        this.parts = [];
        this.str = rule;
        let minReps = 1, maxReps = 1;
        let letter = rule[0];
        let allowRepeats;
        for (let i = 1; i < rule.length; ++i) {
            if (rule[i] === '?') {
                --minReps;
                continue;
            }
            else if (rule[i] === '!') {
                if (maxReps <= 1) {
                    throw new Error("misplaced '!' option: in non-duplicate "
                        + `environment: '${rule}'.`);
                }
                else if (allowRepeats === undefined) {
                    allowRepeats = false;
                }
                continue;
            }
            if (rule[i] === letter
                && allowRepeats === false == (rule[i + 1] === '!')) {
                ++minReps;
                ++maxReps;
            }
            else {
                this.parts.push(new Fragment(letter, minReps, maxReps, allowRepeats));
                letter = rule[i];
                maxReps = 1;
                minReps = 1;
                allowRepeats = undefined;
            }
        }
        this.parts.push(new Fragment(letter, minReps, maxReps));
    }
    generate() {
        return this.parts.map(el => el.generate()).join('');
    }
    toString() {
        return this.str;
    }
}
class Fragment {
    constructor(value, minReps, maxReps, allowRepeats) {
        this.value = value;
        this.minReps = minReps;
        this.maxReps = maxReps;
        this.allowRepeats = allowRepeats;
    }
    getPhoneme(word) {
        if (!(word === null || word === void 0 ? void 0 : word.length)) {
            return Fragment.getRandomPhoneme(this.value);
        }
        let val;
        do {
            val = Fragment.getRandomPhoneme(this.value);
        } while (this.allowRepeats === false && val === last(word));
        return val;
    }
    generate() {
        if (this.maxReps === 1) {
            if (this.minReps === 0 && !Fragment.addOptional()) {
                return '';
            }
            return this.getPhoneme();
        }
        let i;
        let retVal = '';
        for (i = 0; i < this.minReps; ++i) {
            retVal += this.getPhoneme(retVal);
        }
        for (; i < this.maxReps; ++i) {
            if (Fragment.addOptional()) {
                retVal += this.getPhoneme(retVal);
            }
        }
        return retVal;
    }
}
var Place;
(function (Place) {
    Place[Place["Bilabial"] = 0] = "Bilabial";
    Place[Place["Labiodental"] = 1] = "Labiodental";
    Place[Place["Alveolar"] = 2] = "Alveolar";
    Place[Place["Postalveolar"] = 3] = "Postalveolar";
    Place[Place["Retroflex"] = 4] = "Retroflex";
    Place[Place["Palatal"] = 5] = "Palatal";
    Place[Place["Velar"] = 6] = "Velar";
    Place[Place["Uvular"] = 7] = "Uvular";
})(Place || (Place = {}));
var Manner;
(function (Manner) {
    Manner[Manner["Plosive"] = 0] = "Plosive";
    Manner[Manner["Fricative"] = 1] = "Fricative";
    Manner[Manner["Nasal"] = 2] = "Nasal";
    Manner[Manner["Sibilant"] = 3] = "Sibilant";
    Manner[Manner["LateralFricative"] = 4] = "LateralFricative";
    Manner[Manner["LateralAffricate"] = 5] = "LateralAffricate";
    Manner[Manner["Affricate"] = 6] = "Affricate";
})(Manner || (Manner = {}));
class Segment {
    constructor(representation, voiced, place, manner) {
        this.representation = representation;
        this.voiced = voiced;
        this.place = place;
        this.manner = manner;
    }
    get isStop() {
        return this.manner === Manner.Nasal || this.manner === Manner.Plosive;
    }
    get isPeripheral() {
        return this.place === Place.Bilabial || this.place === Place.Velar;
    }
    toString() {
        return this.representation;
    }
}
class ClusterEngine {
    constructor(isIpa) {
        this.segments = [
            new Segment('p', false, Place.Bilabial, Manner.Plosive),
            new Segment('b', true, Place.Bilabial, Manner.Plosive),
            new Segment(isIpa ? 'ɸ' : 'ph', false, Place.Bilabial, Manner.Fricative),
            new Segment(isIpa ? 'β' : 'bh', true, Place.Bilabial, Manner.Fricative),
            new Segment('f', false, Place.Labiodental, Manner.Fricative),
            new Segment('v', true, Place.Labiodental, Manner.Fricative),
            new Segment('m', true, Place.Bilabial, Manner.Nasal),
            new Segment('m', true, Place.Labiodental, Manner.Nasal),
            new Segment('t', false, Place.Alveolar, Manner.Plosive),
            new Segment('d', true, Place.Alveolar, Manner.Plosive),
            new Segment('s', false, Place.Alveolar, Manner.Sibilant),
            new Segment('z', true, Place.Alveolar, Manner.Sibilant),
            new Segment(isIpa ? 'θ' : 'th', false, Place.Alveolar, Manner.Fricative),
            new Segment(isIpa ? 'ð' : 'dh', true, Place.Alveolar, Manner.Fricative),
            new Segment(isIpa ? 'ɬ' : 'lh', false, Place.Alveolar, Manner.LateralFricative),
            new Segment(isIpa ? 'ɮ' : 'ldh', true, Place.Alveolar, Manner.LateralFricative),
            new Segment(isIpa ? 'tɬ' : 'tl', false, Place.Alveolar, Manner.LateralAffricate),
            new Segment(isIpa ? 'dɮ' : 'dl', true, Place.Alveolar, Manner.LateralAffricate),
            new Segment('ts', false, Place.Alveolar, Manner.Affricate),
            new Segment('dz', true, Place.Alveolar, Manner.Affricate),
            new Segment(isIpa ? 'ʃ' : 'sh', false, Place.Postalveolar, Manner.Sibilant),
            new Segment(isIpa ? 'ʒ' : 'zh', true, Place.Postalveolar, Manner.Sibilant),
            new Segment(isIpa ? 'tʃ' : 'ch', false, Place.Postalveolar, Manner.Affricate),
            new Segment(isIpa ? 'dʒ' : 'j', true, Place.Postalveolar, Manner.Affricate),
            new Segment('n', true, Place.Alveolar, Manner.Nasal),
            new Segment(isIpa ? 'ʈ' : 'rt', false, Place.Retroflex, Manner.Plosive),
            new Segment(isIpa ? 'ɖ' : 'rd', true, Place.Retroflex, Manner.Plosive),
            new Segment(isIpa ? 'ʂ' : 'sr', false, Place.Retroflex, Manner.Sibilant),
            new Segment(isIpa ? 'ʐ' : 'zr', true, Place.Retroflex, Manner.Sibilant),
            new Segment(isIpa ? 'ʈʂ' : 'rts', false, Place.Retroflex, Manner.Affricate),
            new Segment(isIpa ? 'ɖʐ' : 'rdz', true, Place.Retroflex, Manner.Affricate),
            new Segment(isIpa ? 'ɳ' : 'rn', true, Place.Retroflex, Manner.Nasal),
            new Segment(isIpa ? 'c' : 'ky', false, Place.Palatal, Manner.Plosive),
            new Segment(isIpa ? 'ɟ' : 'gy', true, Place.Palatal, Manner.Plosive),
            new Segment(isIpa ? 'ɕ' : 'sy', false, Place.Palatal, Manner.Sibilant),
            new Segment(isIpa ? 'ʑ' : 'zy', true, Place.Palatal, Manner.Sibilant),
            new Segment(isIpa ? 'ç' : 'hy', false, Place.Palatal, Manner.Fricative),
            new Segment(isIpa ? 'ʝ' : 'yy', true, Place.Palatal, Manner.Fricative),
            new Segment(isIpa ? 'tɕ' : 'cy', false, Place.Palatal, Manner.Affricate),
            new Segment(isIpa ? 'dʑ' : 'jy', true, Place.Palatal, Manner.Affricate),
            new Segment(isIpa ? 'ɲ' : 'ny', true, Place.Palatal, Manner.Nasal),
            new Segment('k', false, Place.Velar, Manner.Plosive),
            new Segment('g', true, Place.Velar, Manner.Plosive),
            new Segment(isIpa ? 'x' : 'kh', false, Place.Velar, Manner.Fricative),
            new Segment(isIpa ? 'ɣ' : 'gh', true, Place.Velar, Manner.Fricative),
            new Segment(isIpa ? 'ŋ' : 'ng', true, Place.Velar, Manner.Nasal),
            new Segment('q', false, Place.Uvular, Manner.Plosive),
            new Segment(isIpa ? 'ɢ' : 'gq', true, Place.Uvular, Manner.Plosive),
            new Segment(isIpa ? 'χ' : 'qh', false, Place.Uvular, Manner.Fricative),
            new Segment(isIpa ? 'ʁ' : 'gqh', true, Place.Uvular, Manner.Fricative),
            new Segment(isIpa ? 'ɴ' : 'nq', true, Place.Uvular, Manner.Nasal)
        ];
    }
    getSegment(features) {
        return this.segments.find(el => (features.voiced === undefined || el.voiced === features.voiced)
            && (features.place === undefined || el.place === features.place)
            && (features.manner === undefined
                || el.manner === features.manner));
    }
    applyAssimilations(word) {
        const nasalAssimilate = (ph1, ph2) => {
            const data1 = this.segments.find(el => el.representation === ph1);
            if (data1 && data1.manner === Manner.Nasal) {
                const data2 = this.segments.find(el => el.representation === ph2);
                if (data2) {
                    const result = this.segments.find(el => el.place === data2.place
                        && el.manner === Manner.Nasal);
                    if (result) {
                        return result.representation;
                    }
                }
            }
            return ph1;
        };
        const voiceAssimilate = (ph1, ph2) => {
            const data2 = this.segments.find(el => el.representation === ph2);
            if (data2) {
                const data1 = this.segments.find(el => el.representation === ph1);
                if (data1) {
                    const result = this.segments.find(el => el.voiced === data2.voiced
                        && el.place === data1.place
                        && el.manner === data1.manner);
                    if (result) {
                        return result.representation;
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
    }
    applyCoronalMetathesis(word) {
        const coronalMetathesis = (ph1, ph2) => {
            const data1 = this.segments.find(el => el.representation === ph1);
            if (data1 && data1.place === Place.Alveolar) {
                const data2 = this.segments.find(el => el.representation === ph2);
                if ((data2 === null || data2 === void 0 ? void 0 : data2.isPeripheral)
                    && data2.isStop
                    && data2.manner === data1.manner) {
                    return [ph2, ph1];
                }
            }
            return [ph1, ph2];
        };
        const newArr = [...word];
        for (let i = 0; i < word.length - 1; ++i) {
            [newArr[i], newArr[i + 1]] = coronalMetathesis(newArr[i], word[i + 1]);
        }
        return newArr;
    }
}
class WeightedSelector {
    constructor(dic) {
        this.keys = [];
        this.weights = [];
        for (const [key, weight] of dic) {
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
        if (Word.sorter && Word.clusterEngine) {
            const newWord = Word.clusterEngine.applyAssimilations(Word.sorter.split(last(this.forms)))
                .join('');
            if (newWord !== last(this.forms)) {
                this.forms.push(newWord);
                this.filters.push('std-assimilations');
            }
        }
    }
    applyCoronalMetathesis() {
        if (Word.sorter && Word.clusterEngine) {
            const newWord = Word.clusterEngine.applyCoronalMetathesis(Word.sorter.split(last(this.forms)))
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
Word.clusterEngine = null;
const invalidItemAndWeight = (item) => {
    const parts = item.split(':');
    if (parts.length !== 2) {
        return true;
    }
    const weight = +parts[1];
    return Number.isNaN(weight) || weight < 0 || weight === Infinity;
};
class Category extends Map {
    constructor(weight) {
        super();
        this.weight = weight;
    }
}
class SoundSystem {
    constructor() {
        this.filters = [];
        this.phonemeset = {};
        this.ruleset = {};
        this.randpercent = 10;
        this.useAssim = false;
        this.useCoronalMetathesis = false;
        this.sorter = null;
        Fragment.getRandomPhoneme = phoneme => {
            if (phoneme in this.phonemeset) {
                return this.phonemeset[phoneme].select();
            }
            return phoneme;
        };
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
            const jitter = (val, percent = 10) => val * (1 + percent * (Math.random() - 0.5) / 100);
            const phons = phonemes.split(/\s+/gu);
            const weighted = {};
            const numPhons = phons.length;
            for (let i = 0; i < numPhons; ++i) {
                weighted[phons[i]] = jitter(Math.log(numPhons + 1) - Math.log(i + 1));
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
            const dict = new Map();
            for (const item of items) {
                if (invalidItemAndWeight(item)) {
                    throw new Error(`'${item}' is not a valid phoneme and `
                        + 'weight.');
                }
                const [value, weight] = item.split(':');
                dict.set(value, +weight);
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
            this.ruleset[cat].set(new Rule(rule), weight);
        }
        else {
            throw new Error(`uninitialized category '${cat}' referenced.`);
        }
    }
    addCategory(name, weight) {
        this.ruleset[name] = new Category(weight);
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
        Word.clusterEngine = new ClusterEngine(true);
    }
    useDigraphs() {
        Word.clusterEngine = new ClusterEngine(false);
    }
    generate(numWords, verbose, unsorted, category, force = false) {
        const words = new Set();
        Word.verbose = verbose;
        Word.sorter = this.sorter;
        if (!this.ruleset[category]) {
            throw new Error(`unknown category '${category}'.`);
        }
        const dict = new Map(this.ruleset[category]);
        if (dict.size === 0) {
            dict.set(category, 0);
        }
        const ruleSelector = new WeightedSelector(dict);
        for (let i = 0; i < Number.MAX_SAFE_INTEGER && (force || i < 4 * numWords); ++i) {
            const rule = ruleSelector.select();
            const form = rule.generate();
            const word = new Word(form, rule.toString());
            this.applyFilters(word);
            if (word.toString() !== 'REJECT') {
                words.add(word.toString());
                if (words.size === numWords) {
                    break;
                }
            }
        }
        let wordList = [...words];
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
        const weightedCats = new Map();
        for (const cat in this.ruleset) {
            weightedCats.set(cat, this.ruleset[cat].weight);
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
        text += Math.random() <= 0.85 ? '. ' : '? ';
    }
    return wrap(text.trim());
};
const wrap = (str) => str.replace(/(?![^\n]{1,70}$)([^\n]{1,70})\s/gu, '$1\n');
class GeneratedWords {
    constructor(categories, warnings) {
        this.categories = categories;
        this.warnings = warnings;
    }
    get allWords() {
        const retval = [];
        for (const words of Object.values(this.categories)) {
            retval.push(...words);
        }
        return retval;
    }
    *[Symbol.iterator]() {
        for (const [cat, words] of Object.entries(this.categories)) {
            for (const word of words) {
                yield [word, cat];
            }
        }
    }
}
class WordGenerator {
    constructor(file) {
        this.initWarnings = [];
        let initDone = false;
        this.phonDef = new PhonologyDefinition(file, e => {
            if (initDone) {
                this.runWarnings.push(e);
            }
            else {
                this.initWarnings.push(e);
            }
        });
        initDone = true;
    }
    generate(options) {
        if (options.number > Number.MAX_SAFE_INTEGER
            || options.number <= 0
            || Number.isNaN(options.number)) {
            throw new Error(`Cannot generate ${options.number} words.`);
        }
        this.runWarnings = [];
        let number = options.number;
        if (number !== Math.round(number)) {
            this.runWarnings.push(`Requested number of words (${number}) is `
                + `not an integer. Rounding to ${Math.round(number)}.`);
            number = Math.round(number);
        }
        return new GeneratedWords(this.phonDef.generate(number, false, options.unsorted), [...this.initWarnings, ...this.runWarnings]);
    }
}
const main = (() => {
    let hash = 0;
    let phonDef = null;
    const hashString = (str) => {
        let hash = 0;
        if (str.length === 0) {
            return hash;
        }
        for (let i = 0; i < str.length; ++i) {
            hash = Math.trunc((hash << 5) - hash + str.codePointAt(i));
        }
        return hash;
    };
    const lexifer = (file, num, verbose = false, unsorted, onePerLine = false, stderr = console.error) => {
        let ans = '';
        try {
            const newHash = hashString(file);
            if (hash !== newHash || !phonDef) {
                phonDef = new PhonologyDefinition(file, stderr);
                hash = newHash;
            }
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
                            stderr("** 'Unsorted' option always enabled in "
                                + 'verbose mode.');
                            unsorted = true;
                        }
                        if (onePerLine) {
                            stderr("** 'One per line' option ignored in "
                                + 'verbose mode.');
                        }
                    }
                    const words = phonDef.generate(num, verbose, unsorted);
                    for (const cat in words) {
                        if (cat !== 'words:') {
                            ans += `\n\n${cat}:\n`;
                        }
                        ans += words[cat].join(onePerLine || verbose
                            ? '\n'
                            : ' ');
                    }
                    ans = wrap(ans);
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
                    stderr("** 'One per line' option ignored in paragraph "
                        + 'mode.');
                }
                ans = phonDef.paragraph();
            }
        }
        catch (e) {
            stderr(e);
        }
        return ans;
    };
    lexifer.WordGenerator = WordGenerator;
    lexifer.GeneratedWords = GeneratedWords;
    lexifer.ClusterEngine = ClusterEngine;
    lexifer.Segment = Segment;
    lexifer.Place = Place;
    lexifer.Manner = Manner;
    lexifer.__ArbSorter = ArbSorter;
    return lexifer;
})();
const genWords = () => {
    document.getElementById('errors').innerHTML = '';
    document.getElementById('result').innerHTML = main(document.getElementById('def').value, parseInt(document.getElementById('number').value), document.getElementById('verbose').checked, document.getElementById('unsorted').checked, document.getElementById('one-per-line').checked, message => {
        document.getElementById('errors').innerHTML += `${message}<br />`;
    }).replace(/\n/gu, '<br />');
};
module.exports = main;
