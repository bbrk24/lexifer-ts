import wrap from './textwrap';
import PhonologyDefinition from './PhDefParser';

const main = (
    file: string,
    num?: number,
    verbose = false,
    unsorted?: boolean,
    onePerLine?: boolean,
    stderr: (inp: string | Error) => void = console.error
) => {
    let ans = '';
    try {
        let pd = new PhonologyDefinition(file, stderr);
        if (typeof num == 'number') {
            // wordlist mode
            if (verbose) {
                if (unsorted === false) {
                    stderr("** 'Unsorted' option always enabled in verbose "
                        + 'mode.');
                    unsorted = true;
                }
                if (onePerLine) {
                    stderr("** 'One per line' option ignored in verbose "
                        + 'mode.');
                }
            }
            ans = wrap(pd.generate(num, verbose, unsorted, onePerLine));
        } else {
            // paragraph mode
            if (verbose) {
                stderr("** 'Verbose' option ignored in paragraph mode.");
            }
            if (unsorted) {
                stderr("** 'Unsorted' option ignored in paragraph mode.");
            }
            if (onePerLine) {
                stderr("** 'One per line' option ignored in paragraph mode.");
            }
            ans = pd.paragraph();
        }
    } catch (e) {
        stderr(<Error>e);
    }
    return ans;
};
