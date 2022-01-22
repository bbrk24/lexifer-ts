/*
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

const testCase = require('./testCase');
const lexifer = require('../dist');

// Create two ClusterEngine instances for testing
const ipaEngine = new lexifer.ClusterEngine(true);
const digraphEngine = new lexifer.ClusterEngine(false);

// test the assimilations engine
// test cases: anpa, amxa, adpa, akba

testCase(
    'IPA nasal assim 1',
    ipaEngine.applyAssimilations(['a', 'n', 'p', 'a']),
    ['a', 'm', 'p', 'a']
);
testCase(
    'IPA nasal assim 2',
    ipaEngine.applyAssimilations(['a', 'm', 'x', 'a']),
    ['a', 'ŋ', 'x', 'a']
);
testCase(
    'IPA voice assim 1',
    ipaEngine.applyAssimilations(['a', 'd', 'p', 'a']),
    ['a', 't', 'p', 'a']
);
testCase(
    'IPA voice assim 2',
    ipaEngine.applyAssimilations(['a', 'k', 'b', 'a']),
    ['a', 'g', 'b', 'a']
);

testCase(
    'Digraph nasal assim 1',
    digraphEngine.applyAssimilations(['a', 'n', 'p', 'a']),
    ['a', 'm', 'p', 'a']
);
testCase(
    'Digraph nasal assim 2',
    digraphEngine.applyAssimilations(['a', 'm', 'kh', 'a']),
    ['a', 'ng', 'kh', 'a']
);
testCase(
    'Digraph voice assim 1',
    digraphEngine.applyAssimilations(['a', 'd', 'p', 'a']),
    ['a', 't', 'p', 'a']
);
testCase(
    'Digraph voice assim 2',
    digraphEngine.applyAssimilations(['a', 'k', 'b', 'a']),
    ['a', 'g', 'b', 'a']
);

// Test the coronal metathesis engine
// test cases: adka, atpa, anma, anpa

testCase(
    'IPA metathesis 1',
    ipaEngine.applyCoronalMetathesis(['a', 'd', 'k', 'a']),
    ['a', 'k', 'd', 'a']
);
testCase(
    'IPA metathesis 2',
    ipaEngine.applyCoronalMetathesis(['a', 't', 'p', 'a']),
    ['a', 'p', 't', 'a']
);
testCase(
    'IPA metathesis 3',
    ipaEngine.applyCoronalMetathesis(['a', 'n', 'm', 'a']),
    ['a', 'm', 'n', 'a']
);
testCase(
    'IPA metathesis 4',
    ipaEngine.applyCoronalMetathesis(['a', 'n', 'p', 'a']),
    ['a', 'n', 'p', 'a']
);

testCase(
    'Digraph metathesis 1',
    digraphEngine.applyCoronalMetathesis(['a', 'd', 'k', 'a']),
    ['a', 'k', 'd', 'a']
);
testCase(
    'Digraph metathesis 2',
    digraphEngine.applyCoronalMetathesis(['a', 't', 'p', 'a']),
    ['a', 'p', 't', 'a']
);
testCase(
    'Digraph metathesis 3',
    digraphEngine.applyCoronalMetathesis(['a', 'n', 'm', 'a']),
    ['a', 'm', 'n', 'a']
);
testCase(
    'Digraph metathesis 4',
    digraphEngine.applyCoronalMetathesis(['a', 'n', 'p', 'a']),
    ['a', 'n', 'p', 'a']
);
