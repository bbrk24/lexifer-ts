/*
 * Copyright (c) 2021-2022 William Baker
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

const testCase = require('./testCase');
const lexifer = require('../dist');

// create two sorters, one with digraphs and one without
const simpleSorter = new lexifer.__ArbSorter('a b c');
const digraphSorter = new lexifer.__ArbSorter('aa a b ch c');
// yes, the digraph order is weird on purpose

testCase(
    'sort single letter 1',
    simpleSorter.sort(['b', 'a', 'c']),
    ['a', 'b', 'c']
);
testCase(
    'sort single letter 2',
    digraphSorter.sort(['a', 'c', 'ch']),
    ['a', 'ch', 'c']
);

testCase(
    'sort by length 1',
    simpleSorter.sort(['a', 'aaa', 'aa']),
    ['a', 'aa', 'aaa']
);
testCase(
    'sort by length 2',
    digraphSorter.sort(['a', 'aaa', 'aa']),
    ['aa', 'aaa', 'a']
);

testCase(
    'sort by second letter',
    simpleSorter.sort(['ab', 'ac', 'aa']),
    ['aa', 'ab', 'ac']
);

// This test is based on a real-world use case where an older implementation
// failed to work as expected.

const diacriticSorter = new lexifer.__ArbSorter('t i f ti ì e');

testCase(
    'combine diacritics correctly',
    diacriticSorter.split('tìfe'),
    ['t', 'ì', 'f', 'e']
);
