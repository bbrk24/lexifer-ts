import wrap from './textwrap';
import PhonologyDefinition from './PhDefParser';

// Original "main" -- returns a string
const main = (
    file: string,
    num?: number,
    verbose = false,
    unsorted?: boolean,
    onePerLine = false,
    stderr: (inp: string | Error) => void = console.error
) => {
    let ans = '';
    try {
        let pd = new PhonologyDefinition(file, stderr);
        if (typeof num == 'number') {
            // wordlist mode
            if (num < 0) {
                stderr(`Cannot generate ${num} words.`);
                ans = pd.paragraph();
            } else {
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

// Actual code run when you click "generate"
const genWords = () => {
    document.getElementById('errors')!.innerHTML = '';
    
    document.getElementById('result')!.innerHTML = main(
        (<HTMLTextAreaElement>document.getElementById('def')).value,
        parseInt((<HTMLInputElement>document.getElementById('number')).value) || undefined,
        (<HTMLInputElement>document.getElementById('verbose')).checked,
        (<HTMLInputElement>document.getElementById('unsorted')).checked,
        (<HTMLInputElement>document.getElementById('one-per-line')).checked,
        message => {
            document.getElementById('errors')!.innerHTML += message + '<br />';
        }
    ).replace(/\n/gu, '<br />');
};
