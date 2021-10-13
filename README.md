# lexifer-ts

This is a TypeScript implementation of William Annis's
[Lexifer](https://github.com/wmannis/lexifer).

To compile this, run the build shell script. This can be run directly, or with
`yarn build`. Windows users may NOT use powershell, and will have to install a
proper shell terminal.

## About tsconfig

The main-level `tsconfig.json` is the one actually used during compilation.
`src/tsconfig.json` is only used to aid the IDE, as otherwise unexpected errors
may occur when the build script is run.
