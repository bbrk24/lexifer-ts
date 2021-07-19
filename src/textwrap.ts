// taken from https://stackoverflow.com/questions/14484787/wrap-text-in-javascript#answer-51506718
const wrap = (s: string) => s.replace(
    /(?![^\n]{1,70}$)([^\n]{1,70})\s/gu, '$1\n'
);

export default wrap;