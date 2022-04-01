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
import yargs = require('yargs/yargs');
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

const argv: {
    [x: string]: unknown,
    'one-per-line'?: boolean,
    unsorted?: boolean,
    number?: number,
    verbose?: boolean,
    encoding: BufferEncoding,
    _: (number | string)[],
    $0: string
} = <any>yargs(process.argv.slice(2))
    // aliases for default flags
    .alias({ help: '?', version: 'v' })
    // custom options
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
        alias:    'n',
        describe: 'How many words to generate',
        type:     'number'
    })
    .option('verbose', {
        alias:     'V',
        conflicts: 'one-per-line',
        describe:  'Display all generation steps',
        implies:   'number',
        type:      'boolean'
    })
    .option('encoding', {
        alias:    'e',
        describe: 'What file encoding to use',
        default:  'utf8',
        choices:  encodings,
        coerce:   (enc: string) => {
            // ignore case, and allow 'utf-16le' as a synonym for 'utf16le'
            const littleEnc = enc.toLowerCase();

            if (littleEnc === 'utf-16le') {
                return 'utf16le';
            } else if (!(<string[]>encodings).includes(littleEnc)) {
                // throw an error indicating an invalid encoding
                let errorString = 'Invalid values:\n  Argument: encoding, '
                    + `Given: "${enc}", Choices: `;

                for (let i = 0; i < encodings.length; ++i) {
                    if (i !== 0) {
                        errorString += ', ';
                    }

                    errorString += `"${encodings[i]}"`;
                }

                throw new Error(errorString);
            }

            return littleEnc;
        }
    })
    // perform some sanity checks
    .check((argv, aliases) => {
        // ensure that no more than one file name is passed in
        if (argv._.length > 1) {
            throw new Error(`Expected 1 file (saw ${argv._.length}).`);
        }

        // Error on unknown arguments
        for (const flagname in argv) {
            // '_' and '$0' are provided by yargs. For some reason 'e' is not
            // in the alias object.
            if (['_', '$0', 'e'].includes(flagname)) {
                continue;
            }
            // @ts-expect-error the type of `aliases` is not what yargs says
            if (!aliases.key[flagname]) {
                throw new Error(`Unknown argument: ${flagname}`);
            }
        }

        // warn about something otherwise undetected
        if (argv.number === 0) {
            console.error('Cannot generate 0 words.');
        }

        return true;
    })
    .argv;

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
            argv['one-per-line'],
            e => {
                // Don't throw it; the `catch` block is designed to catch the
                // fs error on Windows.
                if (e instanceof Error) {
                    process.exitCode = 1;
                }

                console.error(e);
            }
        )
    );
} catch {
    process.exitCode = 1;
    if (fileDescriptor === 0) {
        /*
         * For some reason, on Windows, if no pipe is provided then stdin is a
         * directory. Obviously, you can't read a directory as a file, so the
         * readFileSync() call errors.
         * As for why that is, I'm baffled too. All I know is that somewhere
         * down the line readFileSync() attempts to stat the file, and doing so
         * with file descriptor 0 results in EISDIR.
         */
        console.error('Error: No input or pipe provided; cannot read from '
            + 'stdin on Windows.');
    } else {
        console.error(`Error: Could not find file '${fileDescriptor}'.`);
    }
}
