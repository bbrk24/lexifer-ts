"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textify = exports.SoundSystem = void 0;
var tslib_1 = require("tslib");
var last_1 = tslib_1.__importDefault(require("lodash/last"));
var distribution_1 = tslib_1.__importDefault(require("./distribution"));
var textwrap_1 = tslib_1.__importDefault(require("./textwrap"));
var sc = tslib_1.__importStar(require("./SmartClusters"));
var RuleError = /** @class */ (function (_super) {
    tslib_1.__extends(RuleError, _super);
    function RuleError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RuleError;
}(Error));
var ArbSorter = /** @class */ (function () {
    function ArbSorter(order) {
        var graphs = order.split(/\s+/g);
        var splitOrder = graphs.sort(function (a, b) { return b.length - a.length; });
        this.splitter = new RegExp("(" + splitOrder.join('|') + "|.)", 'g');
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
            throw new Error("Word with unknown letter: '" + word + "'.\n"
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
        l2.sort();
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
    var p = phonemes.split(/\s+/g);
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
    var e_1, _a;
    var items = rule.split(/\s+/g);
    var d = {};
    try {
        for (var items_1 = tslib_1.__values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
            var item = items_1_1.value;
            if (!item.includes(':')) {
                throw new RuleError(item + " is not a valid phoneme and weight");
            }
            var _b = tslib_1.__read(item.split(':'), 2), value = _b[0], weight = _b[1];
            d[value] = parseFloat(weight);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return d;
};
var SoundSystem = /** @class */ (function () {
    function SoundSystem() {
        this.phonemeset = {};
        this.ruleset = {};
        this.filters = [];
        this.randpercent = 10;
        this.sorter = null;
        this.useAssim = false;
        this.useCoronalMetathesis = false;
    }
    SoundSystem.prototype.addPhUnit = function (name, selection) {
        if (!selection.includes(':')) {
            selection = naturalWeights(selection);
        }
        this.phonemeset[name] = new distribution_1.default(ruleToDict(selection));
    };
    SoundSystem.prototype.addRule = function (rule, weight) {
        this.ruleset[rule] = weight;
    };
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
                    throw new RuleError('Misplaced \'!\' option: in '
                        + ("non-duplicate environment: " + rule));
                }
                if (rule[i] in this.phonemeset) {
                    var nph = this.phonemeset[rule[i]].select();
                    while (nph === last_1.default(s)) {
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
    SoundSystem.prototype.addFilter = function (pat, repl) {
        if (repl === '!') {
            this.filters.push([pat, '']);
        }
        else {
            this.filters.push([pat, repl]);
        }
    };
    SoundSystem.prototype.applyFilters = function (word) {
        var e_2, _a;
        if (this.sorter) {
            var w = this.sorter.split(word);
            if (this.useAssim) {
                w = sc.applyAssimilations(w);
            }
            if (this.useCoronalMetathesis) {
                w = sc.applyCoronalMetathesis(w);
            }
            word = w.join('');
        }
        try {
            for (var _b = tslib_1.__values(this.filters), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), pat = _d[0], repl = _d[1];
                word = word.replaceAll(pat, repl);
                if (word.includes('REJECT')) {
                    return 'REJECT';
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return word;
    };
    SoundSystem.prototype.addSortOrder = function (order) {
        this.sorter = new ArbSorter(order);
    };
    SoundSystem.prototype.useIpa = function () {
        sc.initialize();
    };
    SoundSystem.prototype.useDigraphs = function () {
        sc.initialize('digraph');
    };
    SoundSystem.prototype.withStdAssimilations = function () {
        this.useAssim = true;
    };
    SoundSystem.prototype.withCoronalMetathesis = function () {
        this.useCoronalMetathesis = true;
    };
    SoundSystem.prototype.generate = function (n, unsorted) {
        if (n === void 0) { n = 10; }
        if (unsorted === void 0) { unsorted = false; }
        var words = new Set();
        var ruleSelector = new distribution_1.default(this.ruleset);
        while (words.size < n) {
            var rule = ruleSelector.select();
            var word = this.applyFilters(this.runRule(rule));
            if (word != 'REJECT') {
                words.add(rule);
            }
        }
        var wordList = Array.from(words);
        if (!unsorted) {
            if (this.sorter) {
                wordList = this.sorter.sort(wordList);
            }
            else {
                wordList.sort();
            }
        }
        return wordList;
    };
    return SoundSystem;
}());
exports.SoundSystem = SoundSystem;
;
var textify = function (phsys, sentences) {
    if (sentences === void 0) { sentences = 11; }
    var text = '';
    for (var i = 0; i < sentences; ++i) {
        var sent = Math.floor(Math.random() * 9) + 3;
        var comma = -1;
        if (sent >= 7) {
            comma = Math.floor(Math.random() * (sent - 1));
        }
        // JS has no function to capitalize just the first letter, hence the regex
        text += phsys.generate(1, true)[0]
            .replace(/\b\w/g, function (l) { return l.toUpperCase(); });
        for (var j = 0; j < sent; ++j) {
            text += " " + phsys.generate(1, true)[0];
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
    text = textwrap_1.default(text);
    return text;
};
exports.textify = textify;
