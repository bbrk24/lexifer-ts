// https://stackoverflow.com/a/51506718/
const wrap = (s: string) => s.replace(
    /(?![^\n]{1,70}$)([^\n]{1,70})\s/gu,
    '$1\n'
);

export default wrap;
