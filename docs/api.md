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

This is meant to provide a cleaner API than the default export. Its constructor
takes a single argument, the phonology definition. If it cannot be parsed, the
constructor will throw an error.

It currently has one public method, `generate()`. This method takes an object as
its argument which must include at least the number of words (per category) to
generate. It returns a custom object -- an instance of `lexifer.GeneratedWords`.

This class has a few properties meant to make it versatile.

- To grab words by category, use the `categories` property. For example, you
might access `categories["noun"]` to get only the nouns generated, and ignore
the rest.
- To get all words ignoring category, use the `allWords` property. Note that
this is a computed property, so repeated accesses at runtime, especially on
larger objects, may result in slowdowns.
- To see any warnings from word generation, you may access the `warnings`
property. I don't anticipate this getting high usage, but it's there for
completeness.
- Finally, you may iterate over the words and categories in a for-of loop. This
might look like:

```ts
for (const [wordform, category] of generatedWords) {
   console.log(category, wordform);
   // prints e.g:
   // noun foo
   // noun bar
   // verb baz
   // verb qux
}
```

Or, if you don't use the categories (i.e. you use `words:` instead), you may
simply omit `category`:

```ts
for (const [wordform] of generatedWords) {
    console.log(wordform);
}
```
