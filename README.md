# lexifer

This is a TypeScript implementation of William Annis's
[Lexifer](https://github.com/wmannis/lexifer).

To compile this, run the build shell script. This can be run directly, or with
`yarn build`. Windows users may NOT use powershell, and will have to install a
proper shell terminal.

## Using Lexifer in your project

To use Lexifer in your project, install it as with any other dependency:

```sh
# with NPM
npm i -S lexifer
# with yarn
yarn add lexifer
```

And then, in your script:

```js
// with CommonJS
const lexifer = require('lexifer');
// with ES6
import lexifer from 'lexifer';
```

The export is currently a single function, with the following signature:

```ts
declare const lexifer: (
    file: string,
    num?: number | undefined,
    verbose?: boolean,
    unsorted?: boolean | undefined,
    onePerLine?: boolean,
    stderr?: (inp: string | Error) => void
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
- `unsorted`: A boolean value or `undefined`, indicating whether to leave the
words in the generated order rather than alphabetizing them. If set to `true`
without specifying a number of words, or set to `false` when `verbose` is set
to `true`, it is ignored with a warning. Defaults to `false` unless `verbose`
is `true`.
- `onePerLine`: A boolean value indicating whether to only display one word per
output line. If set to `true` without specifying a number of words, it is
ignored with a warning. Defaults to `false`.
- `stderr`: What to do when encountering a warning or error. Non-fatal errors
and warnings are reported as strings; fatal errors are reported as error
objects. The body of the main function is wrapped in a try-catch statement, so
any errors are guaranteed to hit here without being thrown. If not given,
defaults to `console.error`.

It always returns a string value. This value is the value that would be output
to `stdout` in the Python version, or displayed as the generation output in the
online version. If a fatal error is hit, this may be empty string.

## About tsconfig

The main-level `tsconfig.json` is the one actually used during compilation.
`src/tsconfig.json` is only used to aid the IDE, as otherwise unexpected errors
may occur when the build script is run.
