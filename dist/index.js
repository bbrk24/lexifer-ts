"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var PhonologyDefinition = (function () {
    function PhonologyDefinition(soundsys, defFile, stderr) {
        this.macros = [];
        this.letters = [];
        this.phClasses = [];
        this.categories = [];
        this.defFileLineNum = 0;
        if (defFile.trim() === '') {
            throw new Error('Please include a definition.');
        }
        this.soundsys = soundsys;
        this.defFileArr = defFile.split('\n');
        this.stderr = stderr;
        this.parse();
        this.sanityCheck();
    }
    PhonologyDefinition.prototype.parse = function () {
        for (; this.defFileLineNum < this.defFileArr.length; ++this.defFileLineNum) {
            var line = this.defFileArr[this.defFileLineNum];
            line = line.replace(/#.*/, '').trim();
            if (line === '') {
                continue;
            }
            if (line.startsWith('with:')) {
                this.parseOption(line.substring(5).trim());
            }
            else if (line.startsWith('random-rate:')) {
                this.soundsys.randpercent = parseInt(line.substring(12));
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
                throw new Error("parsing error at '" + line + "'.");
            }
        }
        if ((this.soundsys.useAssim || this.soundsys.useCoronalMetathesis)
            && !this.soundsys.sorter) {
            this.stderr("Without 'letters:' cannot apply assimilations or "
                + 'coronal metathesis.');
        }
    };
    PhonologyDefinition.prototype.sanityCheck = function () {
        if (this.letters.length) {
            var letters_1 = new Set(this.letters);
            var phonemes = new Set(this.phClasses);
            if (phonemes.size > letters_1.size) {
                var diff = __spreadArray([], __read(phonemes)).filter(function (el) { return !letters_1.has(el); });
                this.stderr("A phoneme class contains '" + diff.join(' ') + "' "
                    + "missing from 'letters'.  Strange word shapes are likely"
                    + ' to result.');
            }
        }
    };
    PhonologyDefinition.prototype.parseOption = function (line) {
        var e_1, _a;
        try {
            for (var _b = __values(line.split(/\s+/gu)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var option = _c.value;
                switch (option) {
                    case 'std-ipa-features':
                        this.soundsys.useIpa();
                        break;
                    case 'std-digraph-features':
                        this.soundsys.useDigraphs();
                        break;
                    case 'std-assimilations':
                        this.soundsys.withStdAssimilations();
                        break;
                    case 'coronal-metathesis':
                        this.soundsys.withCoronalMetathesis();
                        break;
                    default:
                        throw new Error("unknown option '" + option + "'.");
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    PhonologyDefinition.prototype.parseFilter = function (line) {
        var e_2, _a;
        try {
            for (var _b = __values(line.split(';')), _c = _b.next(); !_c.done; _c = _b.next()) {
                var filt = _c.value;
                filt = filt.trim();
                if (filt === '') {
                    continue;
                }
                var _d = __read(filt.split('>'), 2), pre = _d[0], post = _d[1];
                this.addFilter(pre, post);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    PhonologyDefinition.prototype.addFilter = function (pre, post) {
        pre = pre.trim();
        post = post.trim();
        this.soundsys.addFilter(pre, post);
    };
    PhonologyDefinition.prototype.parseReject = function (line) {
        var e_3, _a;
        try {
            for (var _b = __values(line.split(/\s+/gu)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var filt = _c.value;
                this.soundsys.addFilter(filt, 'REJECT');
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    PhonologyDefinition.prototype.parseWords = function (line) {
        if (this.categories.length > 0 && this.categories[0] !== 'words:') {
            throw new Error("both 'words:' and 'categories:' found. Please "
                + 'only use one.');
        }
        this.categories = ['words:'];
        this.addRules(line);
    };
    PhonologyDefinition.prototype.addRules = function (line, cat) {
        var _a;
        var rules = line.split(/\s+/gu);
        var weighted = line.includes(':');
        for (var i = 0; i < rules.length; ++i) {
            var rule = void 0;
            var weight = void 0;
            if (weighted) {
                var weightStr = void 0;
                _a = __read(rules[i].split(':'), 2), rule = _a[0], weightStr = _a[1];
                weight = parseFloat(weightStr !== null && weightStr !== void 0 ? weightStr : 'NaN');
                if (isNaN(weight)) {
                    throw new Error("'" + rules[i] + "' is not a valid pattern and"
                        + 'weight.');
                }
            }
            else {
                rule = rules[i];
                weight = 10.0 / Math.pow((i + 1), 0.9);
            }
            rule = this.expandMacros(rule);
            this.soundsys.addRule(rule, weight, cat);
        }
    };
    PhonologyDefinition.prototype.expandMacros = function (word) {
        var e_4, _a;
        try {
            for (var _b = __values(this.macros), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), macro = _d[0], value = _d[1];
                word = word.replace(macro, value);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return word;
    };
    PhonologyDefinition.prototype.parseLetters = function (line) {
        this.letters = line.split(/\s+/gu);
        this.soundsys.addSortOrder(line);
    };
    PhonologyDefinition.prototype.parseClusterfield = function () {
        var _a;
        var c2list = this.defFileArr[this.defFileLineNum]
            .split(/\s+/gu);
        c2list.shift();
        var n = c2list.length;
        while (!['', '\n', undefined].includes(this.defFileArr[this.defFileLineNum])) {
            ++this.defFileLineNum;
            var line = (_a = this.defFileArr[this.defFileLineNum]) !== null && _a !== void 0 ? _a : '';
            line = line.replace(/#.*/, '').trim();
            if (line === '') {
                continue;
            }
            var row = line.split(/\s+/gu);
            var c1 = row.splice(0, 1);
            if (row.length === n) {
                for (var i = 0; i < n; ++i) {
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
                throw new Error("cluster field row too long: '" + line + "'.");
            }
            else {
                throw new Error("cluster field row too short: '" + line + "'.");
            }
        }
    };
    PhonologyDefinition.prototype.parseClass = function (line) {
        var _a = __read(line.split('='), 2), sclass = _a[0], values = _a[1];
        sclass = sclass.trim();
        values = values.trim();
        if (sclass[0] === '$') {
            this.macros.push([
                new RegExp("\\" + sclass, 'gu'),
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
            throw new Error("unknown category '" + sclass + "'.");
        }
    };
    PhonologyDefinition.prototype.parseCategories = function (line) {
        var e_5, _a;
        if (this.categories.includes('words:')) {
            throw new Error("both 'words:' and 'categories:' found. Please "
                + 'only use one.');
        }
        var splitLine = line.split(/\s+/gu);
        var weighted = line.includes(':');
        try {
            for (var splitLine_1 = __values(splitLine), splitLine_1_1 = splitLine_1.next(); !splitLine_1_1.done; splitLine_1_1 = splitLine_1.next()) {
                var cat = splitLine_1_1.value;
                if (weighted) {
                    var _b = __read(cat.split(':'), 2), name_1 = _b[0], weight = _b[1];
                    var weightNum = parseFloat(weight !== null && weight !== void 0 ? weight : 'NaN');
                    if (isNaN(weightNum)) {
                        throw new Error(cat + " is not a valid category and weight.");
                    }
                    this.categories.push(name_1);
                    this.soundsys.addCategory(name_1, weightNum);
                }
                else {
                    this.categories.push(cat);
                    this.soundsys.addCategory(cat, 1);
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (splitLine_1_1 && !splitLine_1_1.done && (_a = splitLine_1.return)) _a.call(splitLine_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    PhonologyDefinition.prototype.generate = function (n, verbose, unsorted, onePerLine) {
        var e_6, _a;
        if (n === void 0) { n = 1; }
        if (verbose === void 0) { verbose = false; }
        if (unsorted === void 0) { unsorted = false; }
        if (onePerLine === void 0) { onePerLine = false; }
        var words = '';
        var wordList = [];
        try {
            for (var _b = __values(this.categories), _c = _b.next(); !_c.done; _c = _b.next()) {
                var cat = _c.value;
                wordList = this.soundsys.generate(n, verbose, unsorted, cat);
                if (wordList.length < n) {
                    this.stderr("Could only generate " + wordList.length + " word"
                        + ((wordList.length === 1 ? '' : 's') + " ")
                        + (cat === 'words:' ? '' : "of category '" + cat + "' ")
                        + ("(" + n + " requested)."));
                }
                if (cat !== 'words:') {
                    words += "\n\n" + cat + ":\n";
                }
                words += wordList.join(onePerLine || verbose ? '\n' : ' ');
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return words.trim();
    };
    PhonologyDefinition.prototype.paragraph = function (sentences) {
        return textify(this.soundsys, sentences);
    };
    return PhonologyDefinition;
}());
var data = [
    ['p', 'p', 'voiceless', 'bilabial', 'stop'],
    ['b', 'b', 'voiced', 'bilabial', 'stop'],
    ["\u0278", 'ph', 'voiceless', 'bilabial', 'fricative'],
    ["\u03B2", 'bh', 'voiced', 'bilabial', 'fricative'],
    ['f', 'f', 'voiceless', 'labiodental', 'fricative'],
    ['v', 'v', 'voiced', 'labiodental', 'fricative'],
    ['m', 'm', 'voiced', 'bilabial', 'nasal'],
    ['m', 'm', 'voiced', 'labiodental', 'nasal'],
    ['t', 't', 'voiceless', 'alveolar', 'stop'],
    ['d', 'd', 'voiced', 'alveolar', 'stop'],
    ['s', 's', 'voiceless', 'alveolar', 'sibilant'],
    ['z', 'z', 'voiced', 'alveolar', 'sibilant'],
    ["\u03B8", 'th', 'voiceless', 'alveolar', 'fricative'],
    ['ð', 'dh', 'voiced', 'alveolar', 'fricative'],
    ["\u026C", 'lh', 'voiceless', 'alveolar', 'lateral fricative'],
    ["\u026E", 'ldh', 'voiced', 'alveolar', 'lateral fricative'],
    ["t\u026C", 'tl', 'voiceless', 'alveolar', 'lateral affricate'],
    ["d\u026E", 'dl', 'voiced', 'alveolar', 'lateral affricate'],
    ['ts', 'ts', 'voiceless', 'alveolar', 'affricate'],
    ['dz', 'dz', 'voiced', 'alveolar', 'affricate'],
    ["\u0283", 'sh', 'voiceless', 'postalveolar', 'sibilant'],
    ["\u0292", 'zh', 'voiced', 'postalveolar', 'sibilant'],
    ["t\u0283", 'ch', 'voiceless', 'postalveolar', 'affricate'],
    ["d\u0292", 'j', 'voiced', 'postalveolar', 'affricate'],
    ['n', 'n', 'voiced', 'alveolar', 'nasal'],
    ["\u0288", 'rt', 'voiceless', 'retroflex', 'stop'],
    ["\u0256", 'rd', 'voiced', 'retroflex', 'stop'],
    ["\u0282", 'sr', 'voiceless', 'retroflex', 'sibilant'],
    ["\u0290", 'zr', 'voiced', 'retroflex', 'sibilant'],
    ["\u0288\u0282", 'rts', 'voiceless', 'retroflex', 'affricate'],
    ["\u0256\u0290", 'rdz', 'voiced', 'retroflex', 'affricate'],
    ["\u0273", 'rn', 'voiced', 'retroflex', 'nasal'],
    ['c', 'ky', 'voiceless', 'palatal', 'stop'],
    ["\u025F", 'gy', 'voiced', 'palatal', 'stop'],
    ["\u0255", 'sy', 'voiceless', 'palatal', 'sibilant'],
    ["\u0291", 'zy', 'voiced', 'palatal', 'sibilant'],
    ['ç', 'hy', 'voiceless', 'palatal', 'fricative'],
    ["\u029D", 'yy', 'voiced', 'palatal', 'fricative'],
    ["t\u0255", 'cy', 'voiceless', 'palatal', 'affricate'],
    ["d\u0291", 'jy', 'voiced', 'palatal', 'affricate'],
    ["\u0272", 'ny', 'voiced', 'palatal', 'nasal'],
    ['k', 'k', 'voiceless', 'velar', 'stop'],
    ['g', 'g', 'voiced', 'velar', 'stop'],
    ['x', 'kh', 'voiceless', 'velar', 'fricative'],
    ["\u0263", 'gh', 'voiced', 'velar', 'fricative'],
    ["\u014B", 'ng', 'voiced', 'velar', 'nasal'],
    ['q', 'q', 'voiceless', 'uvular', 'stop'],
    ["\u0262", 'gq', 'voiced', 'uvular', 'stop'],
    ["\u03C7", 'qh', 'voiceless', 'uvular', 'fricative'],
    ["\u0281", 'gqh', 'voiced', 'uvular', 'fricative'],
    ["\u0274", 'nq', 'voiced', 'uvular', 'nasal']
];
var phdb = [];
var initialize = function (notation) {
    var e_7, _a, e_8, _b;
    if (notation === void 0) { notation = 'ipa'; }
    if (notation === 'ipa') {
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var row = data_1_1.value;
                phdb.push([row[0], row[2], row[3], row[4]]);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_7) throw e_7.error; }
        }
    }
    else if (notation === 'digraph') {
        try {
            for (var data_2 = __values(data), data_2_1 = data_2.next(); !data_2_1.done; data_2_1 = data_2.next()) {
                var row = data_2_1.value;
                phdb.push([row[1], row[2], row[3], row[4]]);
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (data_2_1 && !data_2_1.done && (_b = data_2.return)) _b.call(data_2);
            }
            finally { if (e_8) throw e_8.error; }
        }
    }
    else {
        throw new Error("Unknown notation: " + notation);
    }
};
var nasalAssimilate = function (ph1, ph2) {
    var data1 = phdb.filter(function (el) { return el[0] === ph1; })[0];
    if (data1 && data1[3] === 'nasal') {
        var data2_1 = phdb.filter(function (el) { return el[0] === ph2; })[0];
        if (data2_1) {
            var result = phdb.filter(function (el) {
                return el[2] === data2_1[2] && el[3] === 'nasal';
            })[0];
            if (result && result[0]) {
                return result[0];
            }
        }
    }
    return ph1;
};
var voiceAssimilate = function (ph1, ph2) {
    var data2 = phdb.filter(function (el) { return el[0] === ph2; })[0];
    if (data2 && data2[3] !== 'nasal') {
        var data1_1 = phdb.filter(function (el) { return el[0] === ph1; })[0];
        if (data1_1) {
            var result = phdb.filter(function (el) {
                return el[1] === data2[1]
                    && el[2] === data1_1[2]
                    && el[3] === data1_1[3];
            })[0];
            if (result && result[0]) {
                return result[0];
            }
        }
    }
    return ph1;
};
var coronalMetathesis = function (ph1, ph2) {
    var data1 = phdb.filter(function (el) { return el[0] === ph1; })[0];
    if (data1 && data1[2] === 'alveolar') {
        var data2 = phdb.filter(function (el) { return el[0] === ph2; })[0];
        if (data2
            && ['velar', 'bilabial'].includes(data2[2])
            && ['stop', 'nasal'].includes(data2[3])
            && data2[3] === data1[3]) {
            return [ph2, ph1];
        }
    }
    return [ph1, ph2];
};
var applyAssimilations = function (word) {
    var newArr = __spreadArray([], __read(word));
    for (var i = 0; i < word.length - 1; ++i) {
        newArr[i] = voiceAssimilate(word[i], word[i + 1]);
        newArr[i] = nasalAssimilate(newArr[i], word[i + 1]);
    }
    return newArr;
};
var applyCoronalMetathesis = function (word) {
    var _a;
    var newArr = __spreadArray([], __read(word));
    for (var i = 0; i < word.length - 1; ++i) {
        _a = __read(coronalMetathesis(word[i], word[i + 1]), 2), newArr[i] = _a[0], newArr[i + 1] = _a[1];
    }
    return newArr;
};
var WeightedSelector = (function () {
    function WeightedSelector(dic) {
        this.keys = [];
        this.weights = [];
        for (var key in dic) {
            var weight = dic[key];
            if (typeof weight == 'number') {
                this.keys.push(key);
                this.weights.push(weight);
            }
        }
        this.sum = this.weights.reduce(function (a, b) { return a + b; }, 0);
        this.n = this.keys.length;
    }
    WeightedSelector.prototype.select = function () {
        var pick = Math.random() * this.sum;
        var temp = 0;
        for (var i = 0; i < this.n; ++i) {
            temp += this.weights[i];
            if (pick < temp) {
                return this.keys[i];
            }
        }
        throw new Error("failed to choose options from '" + this.keys.join("', '") + "'.");
    };
    return WeightedSelector;
}());
var main = function (file, num, verbose, unsorted, onePerLine, stderr) {
    if (verbose === void 0) { verbose = false; }
    if (stderr === void 0) { stderr = console.error; }
    var ans = '';
    try {
        var pd = new PhonologyDefinition(new SoundSystem(), file, stderr);
        if (typeof num == 'number') {
            if (verbose) {
                if (!unsorted) {
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
function last(array) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
}
var wrap = function (s) { return s.replace(/(?![^\n]{1,70}$)([^\n]{1,70})\s/gu, '$1\n'); };
var Word = (function () {
    function Word(form, rule) {
        this.forms = [form];
        this.filters = [rule];
    }
    Word.prototype.applyFilter = function (pat, repl) {
        var regex = new RegExp(pat, 'gu');
        var newWord = last(this.forms);
        newWord = newWord.replace(regex, repl);
        if (newWord.includes('REJECT')) {
            newWord = 'REJECT';
        }
        if (newWord !== last(this.forms)) {
            this.forms.push(newWord);
            this.filters.push(pat + " > " + (repl || '!'));
        }
    };
    Word.prototype.applyFilters = function (filters) {
        var e_9, _a;
        try {
            for (var filters_1 = __values(filters), filters_1_1 = filters_1.next(); !filters_1_1.done; filters_1_1 = filters_1.next()) {
                var filt = filters_1_1.value;
                this.applyFilter.apply(this, __spreadArray([], __read(filt)));
                if (last(this.forms) === 'REJECT') {
                    return;
                }
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (filters_1_1 && !filters_1_1.done && (_a = filters_1.return)) _a.call(filters_1);
            }
            finally { if (e_9) throw e_9.error; }
        }
    };
    Word.prototype.applyAssimilations = function () {
        if (Word.sorter) {
            var newWord = applyAssimilations(Word.sorter.split(last(this.forms)))
                .join('');
            if (newWord !== last(this.forms)) {
                this.forms.push(newWord);
                this.filters.push('std-assimilations');
            }
        }
    };
    Word.prototype.applyCoronalMetathesis = function () {
        if (Word.sorter) {
            var newWord = applyCoronalMetathesis(Word.sorter.split(last(this.forms)))
                .join('');
            if (newWord !== last(this.forms)) {
                this.forms.push(newWord);
                this.filters.push('coronal-metathesis');
            }
        }
    };
    Word.prototype.toString = function () {
        if (Word.verbose) {
            var ans = '';
            for (var i = 0; i < this.forms.length; ++i) {
                ans += this.filters[i] + " \u2013 " + this.forms[i] + "\n";
            }
            return ans;
        }
        else {
            return last(this.forms);
        }
    };
    Word.verbose = false;
    Word.sorter = null;
    return Word;
}());
var ArbSorter = (function () {
    function ArbSorter(order) {
        var graphs = order.split(/\s+/gu);
        var splitOrder = __spreadArray([], __read(graphs)).sort(function (a, b) { return b.length - a.length; });
        this.splitter = new RegExp("(" + splitOrder.join('|') + "|.)", 'gu');
        this.ords = {};
        this.vals = [];
        for (var i in graphs) {
            this.ords[graphs[i]] = parseInt(i);
            this.vals.push(graphs[i]);
        }
    }
    ArbSorter.prototype.wordAsValues = function (word) {
        var _this = this;
        var w = this.split(word);
        var arrayedWord = w.map(function (char) { return _this.ords[char]; });
        if (arrayedWord.includes(undefined)) {
            throw new Error("word with unknown letter: '" + word + "'.\n"
                + 'A filter or assimilation might have caused this.');
        }
        return arrayedWord;
    };
    ArbSorter.prototype.valuesAsWord = function (values) {
        var _this = this;
        return values.map(function (v) { return _this.vals[v]; })
            .join('');
    };
    ArbSorter.prototype.split = function (word) {
        return word.split(this.splitter)
            .filter(function (_, i) { return i % 2; });
    };
    ArbSorter.prototype.sort = function (l) {
        var _this = this;
        var l2 = l.map(function (el) { return _this.wordAsValues(el); });
        l2.sort(function (a, b) { return a[0] - b[0]; });
        return l2.map(function (el) { return _this.valuesAsWord(el); });
    };
    return ArbSorter;
}());
var jitter = function (v, percent) {
    if (percent === void 0) { percent = 10; }
    var move = v + percent / 100;
    return v + move * (Math.random() - 0.5);
};
var naturalWeights = function (phonemes) {
    var p = phonemes.split(/\s+/gu);
    var weighted = {};
    var n = p.length;
    for (var i = 0; i < n; ++i) {
        weighted[p[i]] = jitter((Math.log(n + 1) - Math.log(i + 1)) / n);
    }
    var temp = '';
    for (var k in weighted) {
        temp += k + ":" + weighted[k] + " ";
    }
    temp.trim();
    return temp;
};
var ruleToDict = function (rule) {
    var e_10, _a;
    var items = rule.trim().split(/\s+/gu);
    var d = {};
    try {
        for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
            var item = items_1_1.value;
            if (!item.includes(':')) {
                throw new Error(item + " is not a valid phoneme and weight.");
            }
            var _b = __read(item.split(':'), 2), value = _b[0], weight = _b[1];
            d[value] = parseFloat(weight);
        }
    }
    catch (e_10_1) { e_10 = { error: e_10_1 }; }
    finally {
        try {
            if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
        }
        finally { if (e_10) throw e_10.error; }
    }
    return d;
};
var SoundSystem = (function () {
    function SoundSystem() {
        this.phonemeset = {};
        this.filters = [];
        this.randpercent = 10;
        this.useAssim = false;
        this.useCoronalMetathesis = false;
        this.ruleset = {};
        this.sorter = null;
    }
    SoundSystem.prototype.runRule = function (rule) {
        var n = rule.length;
        var s = [];
        for (var i = 0; i < n; ++i) {
            if ('?!'.includes(rule[i])) {
                continue;
            }
            if (i < n - 1
                && rule[i + 1] === '?') {
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
                var prevc = void 0;
                if (rule[i - 1] === '?' && i > 2) {
                    prevc = rule[i - 2];
                }
                else {
                    prevc = rule[i - 1];
                }
                if (rule[i] !== prevc) {
                    throw new Error("misplaced '!' option: in non-duplicate"
                        + (" environment: '" + rule + "'."));
                }
                if (rule[i] in this.phonemeset) {
                    var nph = this.phonemeset[rule[i]].select();
                    while (nph === last(s)) {
                        nph = this.phonemeset[rule[i]].select();
                    }
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
    };
    SoundSystem.prototype.applyFilters = function (word) {
        if (this.useAssim) {
            word.applyAssimilations();
        }
        if (this.useCoronalMetathesis) {
            word.applyCoronalMetathesis();
        }
        word.applyFilters(this.filters);
        return word;
    };
    SoundSystem.prototype.addPhUnit = function (name, selection) {
        if (!selection.includes(':')) {
            selection = naturalWeights(selection);
        }
        this.phonemeset[name] = new WeightedSelector(ruleToDict(selection));
    };
    SoundSystem.prototype.addRule = function (rule, weight, cat) {
        if (cat === void 0) { cat = 'words:'; }
        if (this.ruleset[cat]) {
            this.ruleset[cat][rule] = weight;
        }
        else {
            throw new Error("uninitialized category '" + cat + "' referenced.");
        }
    };
    SoundSystem.prototype.addCategory = function (name, weight) {
        this.ruleset[name] = { _weight: weight };
    };
    SoundSystem.prototype.addFilter = function (pat, repl) {
        if (repl === '!') {
            this.filters.push([pat, '']);
        }
        else {
            this.filters.push([pat, repl]);
        }
    };
    SoundSystem.prototype.addSortOrder = function (order) {
        this.sorter = new ArbSorter(order);
    };
    SoundSystem.prototype.useIpa = function () {
        initialize();
    };
    SoundSystem.prototype.useDigraphs = function () {
        initialize('digraph');
    };
    SoundSystem.prototype.withStdAssimilations = function () {
        this.useAssim = true;
    };
    SoundSystem.prototype.withCoronalMetathesis = function () {
        this.useCoronalMetathesis = true;
    };
    SoundSystem.prototype.generate = function (n, verbose, unsorted, category) {
        var _a;
        var words = new Set();
        Word.verbose = verbose;
        Word.sorter = this.sorter;
        var ruleSelector;
        if (this.ruleset[category]) {
            var dict = __assign(__assign({}, this.ruleset[category]), { _weight: undefined });
            if (Object.keys(dict).length === 1) {
                dict = __assign((_a = {}, _a[category] = 0, _a), dict);
            }
            ruleSelector = new WeightedSelector(dict);
        }
        else {
            throw new Error("unknown category '" + category + "'.");
        }
        for (var i = 0; i < n * 2 + 1; ++i) {
            var rule = ruleSelector.select();
            var form = this.runRule(rule);
            var word = new Word(form, rule);
            this.applyFilters(word);
            if (word.toString() !== 'REJECT') {
                words.add(word.toString());
                if (words.size === n) {
                    break;
                }
            }
        }
        var wordList = Array.from(words);
        if (!(unsorted || verbose)) {
            if (this.sorter) {
                wordList = this.sorter.sort(wordList);
            }
            else {
                wordList.sort();
            }
        }
        return wordList;
    };
    SoundSystem.prototype.randomCategory = function () {
        var weightedCats = {};
        for (var cat in this.ruleset) {
            weightedCats[cat] = this.ruleset[cat]._weight;
        }
        var catSelector = new WeightedSelector(weightedCats);
        return catSelector.select();
    };
    return SoundSystem;
}());
;
var textify = function (phsys, sentences) {
    if (sentences === void 0) { sentences = 25; }
    var text = '';
    for (var i = 0; i < sentences; ++i) {
        var sent = Math.floor(Math.random() * 9) + 3;
        var comma = -1;
        if (sent >= 7) {
            comma = Math.floor(Math.random() * (sent - 1));
        }
        text += phsys.generate(1, false, true, phsys.randomCategory())[0]
            .toString()
            .replace(/./u, function (el) { return el.toUpperCase(); });
        for (var j = 0; j < sent; ++j) {
            text += " " + phsys.generate(1, false, true, phsys.randomCategory())[0];
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
    text = wrap(text.trim());
    return text;
};
