// Copied from lodash to eliminate external dependencies, then converted to TS
function last<T>(array: T[]) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
}

export default last;
