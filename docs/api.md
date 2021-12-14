# The API

## Table of Contents

> - [The Default Export](#the-default-export)
> - [`lexifer.ClusterEngine`](#lexiferclusterengine)
> - [`lexifer.WordGenerator`](#lexiferwordgenerator)

## The Default Export

The default export may be used as a function with the following signature:

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

If the main function simply threw its errors, they would be logged to the
console without the end user ever seeing them. In the web app, the `stderr`
parameter puts the error message on the page so the user can see it. In the
API, it defaults to `console.error` if not provided. I expect a common
callback to look something like this:

```js
lexifer(
    // ...other arguments
    err => {
        if (err instanceof Error) {
            // Lexifer encountered a problem and stopped.
            throw err;
        } else {
            // Lexifer has a concern but may proceed.
            console.warn(err);
        }
    }
)
```

Because of this error-capturing parameter, lexifer guarantees that it always
returns a string (even if that string is `''`). I recognize that this is not
idiomatic in JavaScript, but as it is part of the public API in v1.1.2, it
cannot be changed until release 2.0.0.

## `lexifer.ClusterEngine`

This exposes just the assimilation engines of Lexifer. You can learn more about
those under the documentation for [the `with:`
directive](./grammar.md#options--the-with-directive).

The constructor takes a single argument: a boolean value. `true` indicates to
use the IPA featureset, and `false` indicates to use digraphs.

The methods `applyAssimilation()` and `applyCoronalMetathesis()` act on arrays
of phones. This makes processing the words simpler, as the cluster engine itself
does not have to parse the words.

If you just want to search the engine's database to see what phoneme matches a
given set of features, you can use the `getSegment()` method to do so.

## `lexifer.WordGenerator`

Everything about this class is heavily WIP and subject to change without
notice. At this time, its use is discouraged.
