#! /bin/sh

# Copyright (c) 2021-2022, 2024 William Baker
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

set -e

# run a linter pass
echo 'Linting...'
yarn -s lint --fix

echo 'Combining files...'
# put the version number and license comment here, so it ends up in all dist/
# files
version=$(grep version package.json | cut -d '"' -f 4)
# the use of `/*!` ensures compilation preserves it
license_comment=$(printf '/*! Lexifer TS v%s\n\n%s\n*/' "$version" "$(cat LICENSE)")
{
    echo "$license_comment"
    # index.ts needs to go last; the others, order doesn't matter
    for filename in src/*.ts
    do
        [ "$filename" != 'src/index.ts' ] &&
            sed '/import/d;/export/d' "$filename"
    done
    sed '/import/d;/export/d' src/index.ts
    echo 'export = main;'
} > index.ts

echo 'Compiling to JS...'
npx tsc

# Run `tsc` in the bin/ directory
cd bin/
npx tsc
cd ../

echo 'Minifying...'
sed '$d' dist/index.js | npx terser -m reserved='[genWords]' --ecma 2022 \
    --toplevel -c unsafe,unsafe_symbols,top_retain='genWords' \
    -o dist/lexifer.min.js -f wrap_func_args=false
npx terser bin/index.js -mc unsafe --ecma 2022 --toplevel -o bin/lexifer \
    -f wrap_func_args=false,semicolons=false,preamble="'$(printf \
    '#! /usr/bin/env node\n%s' "$license_comment" | awk '{printf "%s\\n", $0}')'"

echo 'Testing...'
yarn -s test
echo 'Done.'
