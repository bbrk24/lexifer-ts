# lexifer

[![version][1]][2] [![license][3]][4] [![issue count][5]][6]
[![git activity][7]][8]

This is a TypeScript implementation of William Annis's
[Lexifer][9].

**For full documentation, see [the docs here][10].**

To compile this, run the build shell script. This can be run directly, or with
`yarn prepack`. Windows users may NOT use powershell, and will have to install
a proper shell terminal.

## Using Lexifer in your project

To use Lexifer in your project, install it as with any other dependency:

```sh
# with npm
npm i -S lexifer

# with yarn
yarn add lexifer
```

And then, in your script:

```js
// with CommonJS
const lexifer = require('lexifer');

// with ES6 modules
import lexifer from 'lexifer';
```

Lexifer comes bundled with its own type declarations. However, these
declarations are not parsed properly by TypeScript v3.5 and earlier. If you're
using Lexifer in a TypeScript project, you must be using TypeScript v3.6 or
later.

The export is currently a single function, with the following signature:

```ts
declare const lexifer: (
    file: string,
    num?: number | undefined,
    verbose?: boolean,
    unsorted?: boolean | undefined,
    onePerLine?: boolean,
    stderr?: (inp: Error | string) => void
) => string;
```

The arguments are as follows:

- `file`: The full text of the .def file used for word generation. This is the
full text of the file rather than the file name so that it can be used in cases
where it is infeasible to use a file; the web version uses the text from an
HTML textarea as the input.
- `num`: A nonnegative number, or `undefined`. If falsy (`0`, `undefined`, or
`NaN`), a paragraph will be generated. If not an integer, it will round it with
a warning.
- `verbose`: A boolean value indicating whether to display all generation
steps. Useful for debugging, but `false` by default. If set to `true` without
specifying a number of words, it is ignored with a warning.
- `unsorted`: A boolean value indicating whether to leave the words in the
generated order rather than alphabetizing them. If set to `true` without
specifying a number of words, or set to `false` when `verbose` is set to
`true`, it is ignored with a warning. Defaults to `false` unless `verbose` is
`true`.
- `onePerLine`: A boolean value indicating whether to only display one word per
output line. If set to `true` without specifying a number of words, it is
ignored with a warning. Defaults to `false`.
- `stderr`: What to do when encountering a warning or error. Non-fatal errors
and warnings are reported as strings; fatal errors are reported as error
objects. The body of the main function is wrapped in a try-catch statement, so
any errors are guaranteed to hit here without being thrown. If not given,
defaults to `console.error`.

It always returns a string value. This value is the value that would be output
to `stdout` from the CLI, or displayed as the generation output in the online
version. If a fatal error is hit, this may be empty string.

## CLI

As of v1.2, this package now provides a CLI for lexifer. The general syntax is

```
lexifer [input file] [flags...]
```

To ensure that `lexifer` is in your path, you should install it globally, using
`npm i -g lexifer`. If you install it locally, you may have to run
`node_modules/.bin/lexifer` instead.

If no input file is specified, it will read from stdin, so it supports piping
from other commands.

Note: on Windows, file names and pipes are supported, but Lexifer cannot read
directly from stdin as it can on Unix-like systems. This is largely beyond my
control: `fs.readFileSync()` attempts to stat the file, and you cannot stat
stdin on Windows.

Flags are as follows:

- `-?` or `--help`: Show the list of flags.
- `-v` or `--version`: Print the version number then exit.
- `-o` or `--one-per-line`: Equivalent to `onePerLine` argument above.
- `-u` or `--unsorted`: Equivalent to the `unsorted` argument above.
- `-n` or `--number-of-words`: Specify the number of words. Unlike above, this
does not accept `0`. Example usage: `lexifer example.def -n 15`
- `-V` or `--verbose`: Equivalent to the `verbose` argument above.
- `-e` or `--encoding`: The input encoding. If not given, defaults to utf-8.
Valid values: `ascii`; `base64`; `binary` or `latin1`; `hex`; `utf-8` or
`utf8`; `utf16le`, `ucs-2`, or `ucs-2`. For details, see [Node's documentation
for encodings][11]. `base64url` is not supported, for backwards compatibility
with Node 12.

The input file name should go before any flags. If you want to put it at the
end, it must be delimited with `--`, such as `lexifer -n 15 -- example.def`.

## About tsconfig

The main-level `tsconfig.json` is the one used during compilation of the main
project. `bin/tsconfig.json` is necessary because the CLI is compiled
separately from the rest of the project. `src/tsconfig.json` is only used to
aid the IDE, as otherwise unexpected errors may occur when the build script is
run.

[1]: https://img.shields.io/npm/v/lexifer
[2]: https://www.npmjs.com/package/lexifer "npm package"
[3]: https://img.shields.io/npm/l/lexifer
[4]: https://github.com/bbrk24/lexifer-ts/blob/master/LICENSE "license text"
[5]: https://img.shields.io/github/issues-raw/bbrk24/lexifer-ts
[6]: https://github.com/bbrk24/lexifer-ts/issues "issues page"
[7]: https://img.shields.io/github/commit-activity/m/bbrk24/lexifer-ts
[8]: https://github.com/bbrk24/lexifer-ts/commits "commit log"
[9]: https://github.com/wmannis/lexifer
[10]: ./docs.md
[11]: https://nodejs.org/api/buffer.html#buffers-and-character-encodings
