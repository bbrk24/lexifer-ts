/*
 * Copyright (c) 2021-2022 William Baker
 *
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

import fs = require('fs');
import yargs = require('yargs');
import main = require('../dist');

const encodings: readonly BufferEncoding[] = [
    'ascii',
    'binary',
    'latin1',
    'ucs-2',
    'ucs2',
    'utf-8',
    'utf16le',
    'utf8'
];

const argv = yargs.parserConfiguration({ 'duplicate-arguments-array': false })
    // aliases for default flags
    .alias({ help: '?', version: 'v' })
    // custom options
    .positional('--', {
        describe:  'The name of the input file.',
        normalize: true,
        type:      'string'
    })
    .option('one-per-line', {
        alias:    'o',
        describe: 'Display one word per line',
        implies:  'number',
        type:     'boolean'
    })
    .option('unsorted', {
        alias:    'u',
        describe: 'Leave output unsorted',
        implies:  'number',
        type:     'boolean'
    })
    .option('number', {
        alias:       'n',
        describe:    'How many words to generate',
        requiresArg: true,
        type:        'number'
    })
    .option('verbose', {
        alias:     'V',
        conflicts: 'one-per-line',
        describe:  'Display all generation steps',
        implies:   'number',
        type:      'boolean'
    })
    .option('filter-classes', {
        alias:    'f',
        describe: 'Consider phoneme classes in filters',
        type:     'boolean'
    })
    .option('encoding', {
        alias:       'e',
        choices:     encodings,
        describe:    'What file encoding to use',
        default:     'utf8',
        requiresArg: true,
        coerce(enc: number | string) {
            // ignore case, and allow 'utf-16le' as a synonym for 'utf16le'
            if (typeof enc == 'string') {
                const littleEnc = enc.toLowerCase();
                if (littleEnc === 'utf-16le') {
                    return 'utf16le';
                }

                if (
                    (
                        <(enc: string) => enc is BufferEncoding>
                        (<readonly string[]>encodings).includes
                    )(littleEnc)
                ) {
                    return littleEnc;
                }
            }

            throw new Error('Invalid values:\n  Argument: encoding, Given: '
                + JSON.stringify(enc) + ', Choices: "' + encodings.join('", "')
                + '"');
        }
    })
    // perform some sanity checks
    .check(argv => {
        /*
         * To pass validation, must return one of:
         * - the boolean `true`
         * - a non-Error object or function
         * - a symbol
         * - a truthy number or bigint
         * To fail validation, must throw an Error or return an Error or string.
         *
         * Returning a falsey value will technically make validation fail, but
         * gives this arrow function as the error message. It's easier to never
         * return falsey values.
         */

        // ensure that no more than one file name is passed in
        if (argv._.length > 1) {
            throw new Error(`Expected 1 file (saw ${argv._.length}).`);
        }

        // warn about something otherwise undetected
        if (argv.number === 0) {
            console.error('Cannot generate 0 words.');
        }

        return true;
    })
    .strictOptions()
    .argv;

// convince TS this isn't a promise without changing the type by accident
// eslint-disable-next-line
const assertNotPromise: <T>(x: Promise<T> | T) => asserts x is T = () => {}; assertNotPromise(argv);

// If no filename is provided, read from stdin -- support piping
const fileDescriptor = argv._[0] ?? 0;

try {
    const fileText = fs.readFileSync(fileDescriptor, argv.encoding);

    console.log(
        main(
            fileText,
            argv.number,
            argv.verbose,
            argv.unsorted,
            argv.onePerLine,
            e => {
                // Don't throw it; the `catch` block is designed to catch the
                // fs error.
                if (e instanceof Error) {
                    process.exitCode = 1;
                }

                console.error(e);
            },
            argv.filterClasses
        )
    );
} catch {
    process.exitCode = 1;
    if (fileDescriptor === 0 || fileDescriptor === '-') {
        console.error('Error: Cannot read stdin.');
    } else {
        console.error(`Error: Could not find file '${fileDescriptor}'.`);
    }
}
