"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCoronalMetathesis = exports.applyAssimilations = exports.initialize = void 0;
var tslib_1 = require("tslib");
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
    ['g', 'k', 'voiced', 'velar', 'stop'],
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
            for (var data_1 = tslib_1.__values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
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
            for (var data_2 = tslib_1.__values(data), data_2_1 = data_2.next(); !data_2_1.done; data_2_1 = data_2.next()) {
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
    var newArr = tslib_1.__spreadArray([], tslib_1.__read(word));
    for (var i = 0; i < word.length - 1; ++i) {
        newArr[i] = voiceAssimilate(word[i], word[i + 1]);
        newArr[i] = nasalAssimilate(newArr[i], word[i + 1]); // sic
    }
    return newArr;
};
exports.applyAssimilations = applyAssimilations;
var applyCoronalMetathesis = function (word) {
    var _a;
    var newArr = tslib_1.__spreadArray([], tslib_1.__read(word));
    for (var i = 0; i < word.length - 1; ++i) {
        var temp = coronalMetathesis(word[i], word[i + 1]);
        _a = tslib_1.__read([temp[0], temp[1]], 2), newArr[i] = _a[0], newArr[i + 1] = _a[1];
    }
    return newArr;
};
exports.applyCoronalMetathesis = applyCoronalMetathesis;
