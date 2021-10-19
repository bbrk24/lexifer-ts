/*
 * Copyright (c) 2021 William Baker
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

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
        if (num) {
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
