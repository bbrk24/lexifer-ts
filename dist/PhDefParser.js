"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var wordgen_1 = require("./wordgen");
var UnknownOption = /** @class */ (function (_super) {
    tslib_1.__extends(UnknownOption, _super);
    function UnknownOption() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UnknownOption;
}(Error));
var ParseError = /** @class */ (function (_super) {
    tslib_1.__extends(ParseError, _super);
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
                var diff = tslib_1.__spreadArray([], tslib_1.__read(phonemes)).filter(function (el) { return !letters_1.has(el); });
                this.stderr("A phoneme class contains '" + diff.join(' ') + "' "
                    + 'missing from \'letters\'.  Strange word shapes are '
                    + 'likely to result.');
            }
        }
    };
    PhonologyDefinition.prototype.parseOption = function (line) {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__values(line.split(/\s+/gu)), _c = _b.next(); !_c.done; _c = _b.next()) {
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
            for (var _b = tslib_1.__values(line.split(';')), _c = _b.next(); !_c.done; _c = _b.next()) {
                var filt = _c.value;
                filt = filt.trim();
                if (filt === '') {
                    continue;
                }
                var _d = tslib_1.__read(filt.split('>'), 2), pre = _d[0], post = _d[1];
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
        this.soundsys.addFilter(new RegExp(pre, 'gu'), post);
    };
    PhonologyDefinition.prototype.parseReject = function (line) {
        var e_3, _a;
        try {
            for (var _b = tslib_1.__values(line.split(/\s+/gu)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var filt = _c.value;
                this.soundsys.addFilter(new RegExp(filt, 'gu'), 'REJECT');
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
        line = this.expandMacros(line);
        var splitLine = line.split(/\s+/gu);
        for (var i = 0; i < splitLine.length; ++i) {
            this.soundsys.addRule(splitLine[i], 10.0 / Math.pow((i + 1), 0.9));
        }
    };
    PhonologyDefinition.prototype.expandMacros = function (word) {
        var e_4, _a;
        try {
            for (var _b = tslib_1.__values(this.macros), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), macro = _d[0], value = _d[1];
                word = word.replaceAll(macro, value);
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
        var c2list = this.defFileArr[this.defFileLineNum]
            .split(/\s+/gu);
        c2list.shift();
        var n = c2list.length;
        while (!['', '\n'].includes(this.defFileArr[this.defFileLineNum])) {
            ++this.defFileLineNum;
            var line = this.defFileArr[this.defFileLineNum];
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
        var _a = tslib_1.__read(line.split('='), 2), sclass = _a[0], values = _a[1];
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
