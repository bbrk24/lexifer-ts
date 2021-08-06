This is a TypeScript implementation of William Annis's
[Lexifer](https://github.com/wmannis/lexifer).

To compile this, run the appropriate build shell script depending on what terminal your machine has
(bash or zshell). You may need to install typescript globally (`npm i -g typescript` or
`yarn global add typescript`).

The version available on Lingweenie is minified, and has one more function to connect the input
fields into `main()`.

## About tsconfig

The main-level `tsconfig.json` is the one actually used during compilation. `src/tsconfig.json` is
only used to aid the linter, as otherwise unexpected errors may occur when the build script is run.