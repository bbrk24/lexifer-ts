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
