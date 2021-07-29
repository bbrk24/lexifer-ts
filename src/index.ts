const main = (
    file: string,
    num?: number,
    unsorted?: boolean,
    onePerLine?: boolean,
    stderr: (inp: string | Error) => void = console.error
) => {
    let ans = '';
    try { // @ts-ignore
        let pd = new PhonologyDefinition(new SoundSystem(), file, stderr);
        if (typeof num == 'number') {
            // wordlist mode
            let words = pd.generate(num, unsorted);
            if (onePerLine) {
                ans = words.join('\n');
            } else {
                ans = wrap(words.join(' '));
            }
        } else {
            // paragraph mode
            if (unsorted) {
                stderr('** \'Unsorted\' option ignored in paragraph mode.')
            }
            if (onePerLine) {
                stderr('** \'One per line\' option ignored in paragraph mode.')
            }
            ans = pd.paragraph();
        }
    } catch (e) {
        stderr(<Error>e);
    }
    return ans;
};
