var lexifer;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/lodash/last.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/last.js ***!
  \*************************************/
/***/ ((module) => {

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

module.exports = last;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_LOCAL_MODULE_0__, __WEBPACK_LOCAL_MODULE_0__exports;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_LOCAL_MODULE_1__, __WEBPACK_LOCAL_MODULE_1__exports;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_LOCAL_MODULE_2__, __WEBPACK_LOCAL_MODULE_2__exports;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_LOCAL_MODULE_3__, __WEBPACK_LOCAL_MODULE_3__exports;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_LOCAL_MODULE_4__, __WEBPACK_LOCAL_MODULE_4__exports;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var __values = (this && this.__values) || function(o) {
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_LOCAL_MODULE_0__ = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    var WeightedSelector = /** @class */ (function () {
        function WeightedSelector(dic) {
            this.keys = [];
            this.weights = [];
            for (var key in dic) {
                this.keys.push(key);
                this.weights.push(dic[key]);
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
            return 'woo!';
        };
        return WeightedSelector;
    }());
    exports.default = WeightedSelector;
}).apply(__WEBPACK_LOCAL_MODULE_0__exports = {}, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_LOCAL_MODULE_0__ === undefined && (__WEBPACK_LOCAL_MODULE_0__ = __WEBPACK_LOCAL_MODULE_0__exports));
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_LOCAL_MODULE_1__ = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    // taken from https://stackoverflow.com/questions/14484787/wrap-text-in-javascript#answer-51506718
    var wrap = function (s) { return s.replace(/(?![^\n]{1,70}$)([^\n]{1,70})\s/gu, '$1\n'); };
    exports.default = wrap;
}).apply(__WEBPACK_LOCAL_MODULE_1__exports = {}, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_LOCAL_MODULE_1__ === undefined && (__WEBPACK_LOCAL_MODULE_1__ = __WEBPACK_LOCAL_MODULE_1__exports));
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_LOCAL_MODULE_2__ = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.applyCoronalMetathesis = exports.applyAssimilations = exports.initialize = void 0;
    var data = [
        // Bilabial, labio-dental
        ['p', 'p', 'voiceless', 'bilabial', 'stop'],
        ['b', 'b', 'voiced', 'bilabial', 'stop'],
        ['ɸ', 'ph', 'voiceless', 'bilabial', 'fricative'],
        ['β', 'bh', 'voiced', 'bilabial', 'fricative'],
        ['f', 'f', 'voiceless', 'labiodental', 'fricative'],
        ['v', 'v', 'voiced', 'labiodental', 'fricative'],
        ['m', 'm', 'voiced', 'bilabial', 'nasal'],
        ['m', 'm', 'voiced', 'labiodental', 'nasal'],
        // Alveolar
        ['t', 't', 'voiceless', 'alveolar', 'stop'],
        ['d', 'd', 'voiced', 'alveolar', 'stop'],
        ['s', 's', 'voiceless', 'alveolar', 'sibilant'],
        ['z', 'z', 'voiced', 'alveolar', 'sibilant'],
        ['θ', 'th', 'voiceless', 'alveolar', 'fricative'],
        ['ð', 'dh', 'voiced', 'alveolar', 'fricative'],
        ['ɬ', 'lh', 'voiceless', 'alveolar', 'lateral fricative'],
        ['ɮ', 'ldh', 'voiced', 'alveolar', 'lateral fricative'],
        ['tɬ', 'tl', 'voiceless', 'alveolar', 'lateral affricate'],
        ['dɮ', 'dl', 'voiced', 'alveolar', 'lateral affricate'],
        ['ts', 'ts', 'voiceless', 'alveolar', 'affricate'],
        ['dz', 'dz', 'voiced', 'alveolar', 'affricate'],
        ['ʃ', 'sh', 'voiceless', 'postalveolar', 'sibilant'],
        ['ʒ', 'zh', 'voiced', 'postalveolar', 'sibilant'],
        ['tʃ', 'ch', 'voiceless', 'postalveolar', 'affricate'],
        ['dʒ', 'j', 'voiced', 'postalveolar', 'affricate'],
        ['n', 'n', 'voiced', 'alveolar', 'nasal'],
        // Retroflex
        ['ʈ', 'rt', 'voiceless', 'retroflex', 'stop'],
        ['ɖ', 'rd', 'voiced', 'retroflex', 'stop'],
        ['ʂ', 'sr', 'voiceless', 'retroflex', 'sibilant'],
        ['ʐ', 'zr', 'voiced', 'retroflex', 'sibilant'],
        ['ʈʂ', 'rts', 'voiceless', 'retroflex', 'affricate'],
        ['ɖʐ', 'rdz', 'voiced', 'retroflex', 'affricate'],
        ['ɳ', 'rn', 'voiced', 'retroflex', 'nasal'],
        // Palatal
        ['c', 'ky', 'voiceless', 'palatal', 'stop'],
        ['ɟ', 'gy', 'voiced', 'palatal', 'stop'],
        ['ɕ', 'sy', 'voiceless', 'palatal', 'sibilant'],
        ['ʑ', 'zy', 'voiced', 'palatal', 'sibilant'],
        ['ç', 'hy', 'voiceless', 'palatal', 'fricative'],
        ['ʝ', 'yy', 'voiced', 'palatal', 'fricative'],
        ['tɕ', 'cy', 'voiceless', 'palatal', 'affricate'],
        ['dʑ', 'jy', 'voiced', 'palatal', 'affricate'],
        ['ɲ', 'ny', 'voiced', 'palatal', 'nasal'],
        // Velar
        ['k', 'k', 'voiceless', 'velar', 'stop'],
        ['g', 'g', 'voiced', 'velar', 'stop'],
        ['x', 'kh', 'voiceless', 'velar', 'fricative'],
        ['ɣ', 'gh', 'voiced', 'velar', 'fricative'],
        ['ŋ', 'ng', 'voiced', 'velar', 'nasal'],
        // Uvular
        ['q', 'q', 'voiceless', 'uvular', 'stop'],
        ['ɢ', 'gq', 'voiced', 'uvular', 'stop'],
        ['χ', 'qh', 'voiceless', 'uvular', 'fricative'],
        ['ʁ', 'gqh', 'voiced', 'uvular', 'fricative'],
        ['ɴ', 'nq', 'voiced', 'uvular', 'nasal']
    ];
    var phdb = [];
    var initialize = function (notation) {
        var e_1, _a, e_2, _b;
        if (notation === void 0) { notation = 'ipa'; }
        if (notation === 'ipa') {
            try {
                for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                    var row = data_1_1.value;
                    phdb.push([row[0], row[2], row[3], row[4]]);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        else if (notation === 'digraph') {
            try {
                for (var data_2 = __values(data), data_2_1 = data_2.next(); !data_2_1.done; data_2_1 = data_2.next()) {
                    var row = data_2_1.value;
                    phdb.push([row[1], row[2], row[3], row[4]]);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (data_2_1 && !data_2_1.done && (_b = data_2.return)) _b.call(data_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        else {
            throw new Error("Unknown notation: " + notation);
        }
    };
    exports.initialize = initialize;
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
            newArr[i] = nasalAssimilate(newArr[i], word[i + 1]); // sic
        }
        return newArr;
    };
    exports.applyAssimilations = applyAssimilations;
    var applyCoronalMetathesis = function (word) {
        var _a;
        var newArr = __spreadArray([], __read(word));
        for (var i = 0; i < word.length - 1; ++i) {
            _a = __read(coronalMetathesis(word[i], word[i + 1]), 2), newArr[i] = _a[0], newArr[i + 1] = _a[1];
        }
        return newArr;
    };
    exports.applyCoronalMetathesis = applyCoronalMetathesis;
}).apply(__WEBPACK_LOCAL_MODULE_2__exports = {}, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_LOCAL_MODULE_2__ === undefined && (__WEBPACK_LOCAL_MODULE_2__ = __WEBPACK_LOCAL_MODULE_2__exports));
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__(/*! lodash/last */ "./node_modules/lodash/last.js"), __WEBPACK_LOCAL_MODULE_0__, __WEBPACK_LOCAL_MODULE_1__, __WEBPACK_LOCAL_MODULE_2__], __WEBPACK_LOCAL_MODULE_3__ = (function (require, exports, last_1, distribution_1, textwrap_1, sc) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.textify = exports.SoundSystem = void 0;
    last_1 = __importDefault(last_1);
    distribution_1 = __importDefault(distribution_1);
    textwrap_1 = __importDefault(textwrap_1);
    sc = __importStar(sc);
    var RuleError = /** @class */ (function (_super) {
        __extends(RuleError, _super);
        function RuleError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return RuleError;
    }(Error));
    var ArbSorter = /** @class */ (function () {
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
        var e_3, _a;
        var items = rule.trim().split(/\s+/gu);
        var d = {};
        try {
            for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                var item = items_1_1.value;
                if (!item.includes(':')) {
                    throw new RuleError(item + " is not a valid phoneme and weight");
                }
                var _b = __read(item.split(':'), 2), value = _b[0], weight = _b[1];
                d[value] = parseFloat(weight);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return d;
    };
    var SoundSystem = /** @class */ (function () {
        function SoundSystem() {
            this.phonemeset = {};
            this.ruleset = {};
            this.filters = [];
            this.randpercent = 10;
            this.useAssim = false;
            this.useCoronalMetathesis = false;
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
        SoundSystem.prototype.applyFilters = function (word) {
            var e_4, _a;
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
                for (var _b = __values(this.filters), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), pat = _d[0], repl = _d[1];
                    word = word.replace(pat, repl);
                    if (word.includes('REJECT')) {
                        return 'REJECT';
                    }
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
        SoundSystem.prototype.addPhUnit = function (name, selection) {
            if (!selection.includes(':')) {
                selection = naturalWeights(selection);
            }
            this.phonemeset[name] = new distribution_1.default(ruleToDict(selection));
        };
        SoundSystem.prototype.addRule = function (rule, weight) {
            this.ruleset[rule] = weight;
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
            var words = new Set();
            var ruleSelector = new distribution_1.default(this.ruleset);
            while (words.size < n) {
                var rule = ruleSelector.select();
                var word = this.applyFilters(this.runRule(rule));
                if (word != 'REJECT') {
                    words.add(word);
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
        if (sentences === void 0) { sentences = 25; }
        var text = '';
        for (var i = 0; i < sentences; ++i) {
            var sent = Math.floor(Math.random() * 9) + 3;
            var comma = -1;
            if (sent >= 7) {
                comma = Math.floor(Math.random() * (sent - 1));
            }
            text += phsys.generate(1, true)[0].replace(/./u, function (el) { return el.toUpperCase(); });
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
}).apply(__WEBPACK_LOCAL_MODULE_3__exports = {}, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_LOCAL_MODULE_3__ === undefined && (__WEBPACK_LOCAL_MODULE_3__ = __WEBPACK_LOCAL_MODULE_3__exports));
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __WEBPACK_LOCAL_MODULE_3__], __WEBPACK_LOCAL_MODULE_4__ = (function (require, exports, wordgen_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    var UnknownOption = /** @class */ (function (_super) {
        __extends(UnknownOption, _super);
        function UnknownOption() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return UnknownOption;
    }(Error));
    var ParseError = /** @class */ (function (_super) {
        __extends(ParseError, _super);
        function ParseError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ParseError;
    }(Error));
    var PhonologyDefinition = /** @class */ (function () {
        function PhonologyDefinition(soundsys, defFile, stderr) {
            this.macros = [];
            this.letters = [];
            this.phClasses = [];
            // a bit of a hack since JS can't read files directly
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
                else if (line[0] === '%') {
                    this.parseClusterfield();
                }
                else if (line.includes('=')) {
                    this.parseClass(line);
                }
                else {
                    throw new ParseError(line);
                }
            }
            if ((this.soundsys.useAssim || this.soundsys.useCoronalMetathesis) && !this.soundsys.sorter) {
                this.stderr('Without \'letters:\' cannot apply assimilations or coronal metathesis.');
            }
        };
        PhonologyDefinition.prototype.sanityCheck = function () {
            if (this.letters.length) {
                var letters_1 = new Set(this.letters);
                var phonemes = new Set(this.phClasses);
                if (phonemes.size > letters_1.size) {
                    var diff = __spreadArray([], __read(phonemes)).filter(function (el) { return !letters_1.has(el); });
                    this.stderr("A phoneme class contains '" + diff.join(' ') + "' "
                        + 'missing from \'letters\'.  Strange word shapes are '
                        + 'likely to result.');
                }
            }
        };
        PhonologyDefinition.prototype.parseOption = function (line) {
            var e_5, _a;
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
                            throw new UnknownOption(option);
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
        };
        PhonologyDefinition.prototype.parseFilter = function (line) {
            var e_6, _a;
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
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        PhonologyDefinition.prototype.addFilter = function (pre, post) {
            pre = pre.trim();
            post = post.trim();
            this.soundsys.addFilter(new RegExp(pre, 'gu'), post);
        };
        PhonologyDefinition.prototype.parseReject = function (line) {
            var e_7, _a;
            try {
                for (var _b = __values(line.split(/\s+/gu)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var filt = _c.value;
                    this.soundsys.addFilter(new RegExp(filt, 'gu'), 'REJECT');
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
        };
        PhonologyDefinition.prototype.parseWords = function (line) {
            line = this.expandMacros(line);
            var splitLine = line.split(/\s+/gu);
            for (var i = 0; i < splitLine.length; ++i) {
                this.soundsys.addRule(splitLine[i], 10.0 / Math.pow((i + 1), 0.9));
            }
        };
        PhonologyDefinition.prototype.expandMacros = function (word) {
            var e_8, _a;
            try {
                for (var _b = __values(this.macros), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), macro = _d[0], value = _d[1];
                    word = word.replace(macro, value);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
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
                            this.soundsys.addFilter(new RegExp(c1 + c2list[i], 'gu'), 'REJECT');
                        }
                        else {
                            this.soundsys.addFilter(new RegExp(c1 + c2list[i], 'gu'), row[i]);
                        }
                    }
                }
                else if (row.length > n) {
                    throw new ParseError("Cluster field row too long: " + line);
                }
                else {
                    throw new ParseError("Cluster field row too short: " + line);
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
            else {
                this.phClasses = this.phClasses.concat(values.split(/\s+/gu));
                this.soundsys.addPhUnit(sclass, values);
            }
        };
        PhonologyDefinition.prototype.generate = function (n, unsorted) {
            if (n === void 0) { n = 1; }
            if (unsorted === void 0) { unsorted = false; }
            return this.soundsys.generate(n, unsorted);
        };
        PhonologyDefinition.prototype.paragraph = function (sentences) {
            return wordgen_1.textify(this.soundsys, sentences);
        };
        return PhonologyDefinition;
    }());
    exports.default = PhonologyDefinition;
}).apply(__WEBPACK_LOCAL_MODULE_4__exports = {}, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_LOCAL_MODULE_4__ === undefined && (__WEBPACK_LOCAL_MODULE_4__ = __WEBPACK_LOCAL_MODULE_4__exports));
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __WEBPACK_LOCAL_MODULE_1__, __WEBPACK_LOCAL_MODULE_4__, __WEBPACK_LOCAL_MODULE_3__], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, textwrap_2, PhDefParser_1, wordgen_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.main = void 0;
    textwrap_2 = __importDefault(textwrap_2);
    PhDefParser_1 = __importDefault(PhDefParser_1);
    var main = function (file, num, unsorted, onePerLine, stderr) {
        if (stderr === void 0) { stderr = console.error; }
        var ans = '';
        try {
            var pd = new PhDefParser_1.default(new wordgen_2.SoundSystem(), file, stderr);
            if (typeof num == 'number') {
                // wordlist mode
                var words = pd.generate(num, unsorted);
                if (onePerLine) {
                    ans = words.join('\n');
                }
                else {
                    ans = textwrap_2.default(words.join(' '));
                }
            }
            else {
                // paragraph mode
                if (unsorted) {
                    stderr('** \'Unsorted\' option ignored in paragraph mode.');
                }
                if (onePerLine) {
                    stderr('** \'One per line\' option ignored in paragraph mode.');
                }
                ans = pd.paragraph();
            }
        }
        catch (e) {
            stderr(e);
        }
        return ans;
    };
    exports.main = main;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	lexifer = __webpack_exports__;
/******/ 	
/******/ })()
;