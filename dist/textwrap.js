"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// taken from https://stackoverflow.com/questions/14484787/wrap-text-in-javascript#answer-51506718
var wrap = function (s) { return s.replace(/(?![^\n]{1,70}$)([^\n]{1,70})\s/gu, '$1\n'); };
exports.default = wrap;
