# The CLI

As of v1.2, this package now provides a CLI for lexifer. The general syntax is

```
lexifer [def file] [flags...]
```

To ensure that `lexifer` is in your path, you should install it globally, using
`npm i -g lexifer`. If you install it locally, you may have to run `npx lexifer`
instead.

If no input file is specified, it will read from stdin, so it supports piping
from other commands.

Note: on Windows, file names and pipes are supported, but Lexifer cannot read
directly from stdin as it can on Unix-like systems. This is largely beyond my
control, as `fs` throws an error in this case.

Flags are as follows:

- `-?` or `--help`: Show the list of flags.
- `-v` or `--version`: Print the version number then exit.
- `-o` or `--one-per-line`: Display exactly one generated word per output line.
Requires `--number`; incompatible with `--verbose`.
- `-u` or `--unsorted`: Display words in generated order rather than sorting
them. Requires `--number`; implied by `--verbose`.
- `-n` or `--number`: Specify the number of words. Example usage:
`lexifer example.def -n 15`
- `-V` or `--verbose`: This option exists primarily for debugging. It shows you
how exactly Lexifer got to the words it generated, but can produce long outputs.
- `-e` or `--encoding`: The input encoding. If not given, defaults to utf-8.
Valid values: `ascii`; `binary` or `latin1`; `utf-8` or `utf8`; `utf16le`,
`ucs-2`, or `ucs-2`. For details, see [Node's documentation for encodings][1].

The input file name should go before any flags. If you want to put it at the
end, it must be delimited with `--`, such as `lexifer -n 15 -- example.def`.

[1]: https://nodejs.org/api/buffer.html#buffers-and-character-encodings
