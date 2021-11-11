const _ = require('lodash');

/**
 * @param {string} testName
 * @param {*} testVal
 * @param {*} expectedVal
 */
module.exports = (testName, testVal, expectedVal) => {
    if (!_.isEqual(testVal, expectedVal)) {
        process.exitCode = 1;
        console.error(`Test case ${testName} failed\n\tExpected ${expectedVal}`
            + ` but saw ${testVal}`);
    }
};
