import wrap from './textwrap';
import PhonologyDefinition from './PhDefParser';
import { SoundSystem } from './wordgen';

const main = (
    file: string,
    num?: number,
    verbose: boolean = false,
    unsorted?: boolean,
    onePerLine?: boolean,
    stderr: (inp: string | Error) => void = console.error
) => {
    let ans = '';
    try {
        let pd = new PhonologyDefinition(new SoundSystem(), file, stderr);
        if (typeof num == 'number') {
            // wordlist mode
            
            if (verbose) {
                if (!unsorted) {
                    stderr("** 'Unsorted' option always enabled in verbose "
                        + 'mode.');
                    unsorted = true;
                }
                if (onePerLine) {
                    stderr("** 'One per line' option ignored in verbose "
                        + 'mode.');
                }
            }
            
            let words = pd.generate(num, verbose, unsorted);
            if (onePerLine || verbose) {
                ans = words.join('\n');
            } else {
                ans = wrap(words.join(' '));
            }
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
