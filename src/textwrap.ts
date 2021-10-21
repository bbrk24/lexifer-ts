/*
 * This work is not my own. Rather, it is adapted from
 * https://stackoverflow.com/a/51506718/
 */
const wrap = (str: string) => str.replace(
    /(?![^\n]{1,70}$)([^\n]{1,70})\s/gu,
    '$1\n'
);

export default wrap;
