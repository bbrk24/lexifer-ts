#! /bin/sh

# Copyright (c) 2021 William Baker
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

# run a linter pass
echo 'Linting...'
node_modules/.bin/eslint src/*.ts --fix || exit $?
node_modules/.bin/eslint bin/index.ts --fix || exit $?

echo 'Combining files...'
# put the version number and license comment here, so it ends up in all dist/
# files
version=$(grep version package.json | cut -d '"' -f 4)
{
    # the use of `/*!` ensures compilation preserves it
    printf '/*!\nLexifer TS v%s\n\n' "$version"
    cat LICENSE
    echo '*/'
    sed '/export/d;/import/d' src/*.ts
} > combined.ts

echo 'Compiling to JS...'
node_modules/.bin/tsc || exit $?

# prepare for use as a package by declaring exports
# ES6 and CommonJS modules can't be used with only one outfile for some reason
echo 'module.exports = main;' >> dist/index.js
echo 'export = main;' >> dist/index.d.ts

(
    cd bin 
    ../node_modules/.bin/tsc
) || exit $?

# change CRLF to LF (thanks Microsoft)
sed -e 's/^M//' dist/index.js > tempfile
mv tempfile dist/index.js
sed -e 's/^M//' dist/index.d.ts > tempfile
mv tempfile dist/index.d.ts

echo 'Minifying code...'

# use terser
# Even though --mangle-props shaves off 2kB, it ends up being more trouble
# than it's worth.
# -c unsafe replaces `new Error()` with `Error()`.
# The mixture of semicolons=true/false was chosen to minimize file size after
# gzip.
node_modules/.bin/terser dist/index.js -mo dist/lexifer.min.js -c unsafe \
    -f wrap_func_args=false --ecma 2017
node_modules/.bin/terser bin/index.js -mc unsafe --ecma 2019 \
    -f wrap_func_args=false,semicolons=false > bin/lexifer

# We never put the version number in the CLI file!
# Somewhat fortunately, due to a bug in terser, `-f semicolons=false` leaves a
# blank line near the top of the file. Replace that with the version number
# comment.
sed "s|^$|/*! Lexifer TS v${version} */|" bin/lexifer > tempfile
mv tempfile bin/lexifer

# If only the version number changed, the new version didn't actually change
# anything.
for filename in dist/* bin/lexifer
do
    # POSIX sh doesn't have arrays, so I can't just `| read -ra`
    diffstr=$(git diff --numstat "$filename")
    diffins=$(echo "$diffstr" | awk '{print $1}')
    diffdel=$(echo "$diffstr" | awk '{print $2}')

    if [ "$diffins" = '1' ] && [ "$diffdel" = '1' ]
    then
        git restore "$filename"
    fi
done

# and now it's done
echo 'Done.'
echo 'Minified file sizes:'
wc -c dist/lexifer.min.js bin/lexifer
