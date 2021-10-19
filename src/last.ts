/*
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

// Copied from lodash to eliminate external dependencies, then converted to TS.
// Since this is not my work, my copyright notice is not attached to this file;
// rather, the copyright notice above is the original notice from lodash.
function last<T>(array: ArrayLike<T>) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
}

export default last;
