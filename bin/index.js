#! /usr/bin/env node
"use strict";
/*!
 * Copyright (c) 2021 William Baker
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const yargs_1 = __importDefault(require("yargs/yargs"));
const dist_1 = __importDefault(require("../dist"));
const encodings = [
    'ascii',
    'base64',
    'binary',
    'hex',
    'latin1',
    'ucs-2',
    'ucs2',
    'utf-8',
    'utf16le',
    'utf8'
];
const argv = (0, yargs_1.default)(process.argv.slice(2))
    .alias({ help: '?', version: 'v' })
    .option('one-per-line', {
    alias: 'o',
    describe: 'Display one word per line',
    type: 'boolean'
})
    .option('unsorted', {
    alias: 'u',
    describe: 'Leave output unsorted',
    type: 'boolean'
})
    .option('number-of-words', {
    alias: 'n',
    describe: 'How many words to generate',
    type: 'number'
})
    .option('verbose', {
    alias: 'V',
    describe: 'Display all generation steps',
    type: 'boolean'
})
    .option('encoding', {
    alias: 'e',
    describe: 'What file encoding to use',
    type: 'string',
    default: 'utf-8'
})
    .implies('verbose', 'unsorted')
    .choices('encoding', encodings)
    .check(argv => {
    const length = argv._.length;
    if (length > 1) {
        throw new Error(`Expected 1 file (saw ${length}).`);
    }
    if (argv['number-of-words'] === 0) {
        console.error('Cannot generate 0 words.');
    }
    return true;
})
    .argv;
const fileDescriptor = (_a = argv._[0]) !== null && _a !== void 0 ? _a : 0;
console.log((0, dist_1.default)((0, fs_1.readFileSync)(fileDescriptor, argv.encoding), argv['number-of-words'], argv.verbose, argv.unsorted, argv['one-per-line'], error => {
    if (error instanceof Error) {
        throw error;
    }
    else {
        console.warn(error);
    }
}));
