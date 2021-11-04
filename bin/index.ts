#! /usr/bin/env node

/*!
 * Copyright (c) 2021 William Baker
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

import { readFileSync } from 'fs';
import yargs from 'yargs/yargs';
import main from '../dist';

const encodings: readonly BufferEncoding[] = [
    'ascii',
    'base64',
    'binary',
    'hex',
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
    _: string[],
    $0: string
} = <any>yargs(process.argv.slice(2))
    // aliases for default flags
    .alias({ help: '?', version: 'v' })
    // custom options
    .option('one-per-line', {
        alias:    'o',
        describe: 'Display one word per line',
        type:     'boolean'
    })
    .option('unsorted', {
        alias:    'u',
        describe: 'Leave output unsorted',
        type:     'boolean'
    })
    .option('number', {
        alias:    'n',
        describe: 'How many words to generate',
        type:     'number'
    })
    .option('verbose', {
        alias:    'V',
        describe: 'Display all generation steps',
        type:     'boolean'
    })
    .option('encoding', {
        alias:    'e',
        describe: 'What file encoding to use',
        default:  'utf-8',
        choices:  encodings,
        coerce:   (enc: string) => {
            // ignore case, and allow 'utf-16le' as a synonym for 'utf16le'
            let littleEnc = enc.toLowerCase();

            if (littleEnc === 'utf-16le') {
                littleEnc = 'utf16le';
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
    // ensure that they don't pass in multiple files
    .check(argv => {
        const length = argv._.length;

        if (length > 1) {
            throw new Error(`Expected 1 file (saw ${length}).`);
        }

        if (argv.number === 0) {
            console.error('Cannot generate 0 words.');
        }

        return true;
    })
    .argv;

// If no filename is provided, read from stdin -- support piping
const fileDescriptor = argv._[0] ?? 0;

try {
    const fileText = readFileSync(fileDescriptor, argv.encoding);

    console.log(
        main(
            fileText,
            argv.number,
            argv.verbose,
            argv.unsorted,
            argv['one-per-line'],
            e => {
                if (e instanceof Error) {
                    process.exitCode = 1;
                }

                console.error(e);
            }
        )
    );
} catch (e) {
    /*
     * For some reason, on Windows, if no pipe is provided then stdin is a
     * directory. Obviously, you can't read a directory as a file, so the
     * readFileSync() call errors.
     * As for why that is, I'm baffled too. All I know is that somewhere down
     * the line readFileSync() attempts to stat the file, and doing so with
     * file descriptor 0 results in EISDIR.
     */
    console.error('Error: No input or pipe provided; cannot read from stdin on'
        + ' Windows.');
    process.exitCode = 1;
}