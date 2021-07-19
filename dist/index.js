"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var textwrap_1 = tslib_1.__importDefault(require("./textwrap"));
var PhDefParser_1 = tslib_1.__importDefault(require("./PhDefParser"));
var wordgen_1 = require("./wordgen");
var main = function (file, num, unsorted, onePerLine, stderr) {
    if (stderr === void 0) { stderr = console.error; }
    var ans = '';
    try {
        var pd = new PhDefParser_1.default(new wordgen_1.SoundSystem(), file, stderr);
        if (typeof num == 'number') {
            // wordlist mode
            var words = pd.generate(num, unsorted);
            if (onePerLine) {
                ans = words.join('\n');
            }
            else {
                ans = textwrap_1.default(words.join(' '));
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
exports.default = main;
