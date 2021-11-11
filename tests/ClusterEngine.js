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
