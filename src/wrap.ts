/*
 * This work is not my own. Rather, it is adapted from
 * https://stackoverflow.com/a/51506718/
 */

/**
 * Strategically replace spaces with line breaks, allowing no more than 70
 * chars per line.
 * @param s The paragraph to add line breaks to.
 * @returns The paragraph, with line breaks inserted.
 */
const wrap = (str: string) => str.replace(
    /(?![^\n]{1,70}$)([^\n]{1,70})\s/gu,
    '$1\n'
);

export default wrap;
