# lexifer

[![version][1]][2] [![license][3]][4] [![issue count][5]][6]
[![git activity][7]][8]

This is a TypeScript implementation of William Annis's [Lexifer][9].

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

```ts
// in CommonJS
const lexifer = require('lexifer');

// in TypeScript with --module commonjs, node12, or nodenext
import lexifer = require('lexifer');

// in ES modules
import lexifer from 'lexifer';
```

Lexifer comes bundled with its own type declarations. However, these
declarations are not parsed properly by TypeScript v3.5 and earlier. If you're
using Lexifer in a TypeScript project, you must be using TypeScript v3.6 or
later.

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
[10]: ./docs/index.md
