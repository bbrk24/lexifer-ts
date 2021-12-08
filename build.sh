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
npx eslint ./ --fix || exit $?

echo 'Combining files...'
# put the version number and license comment here, so it ends up in all dist/
# files
version=$(grep version package.json | cut -d '"' -f 4)
{
    # the use of `/*!` ensures compilation preserves it
    printf '/*! Lexifer TS v%s\n\n' "$version"
    cat LICENSE
    echo '*/'
    # index.ts needs to go last; the others, order doesn't matter
    for filename in src/*.ts
    do
        [ "$filename" != 'src/index.ts' ] &&
            sed '/import/d;/export/d' "$filename"
    done
    sed '/import/d;/export/d' src/index.ts
    echo 'export = main;'
} > combined.ts

echo 'Compiling to JS...'
npx tsc || exit $?

# change CRLF to LF, and change the file names from 'combined' to 'index'
sed -e 's/^M//' dist/combined.js > dist/index.js
sed -e 's/^M//' dist/combined.d.ts > dist/index.d.ts
rm dist/combined.*

# In the bin directory, run `tsc`...
cd bin/ && npx tsc || exit $?
# ...and then add the hashbang, version number and license text to the js file.
{
    printf '#! /usr/bin/env node\n/*! Lexifer TS v%s\n\n' "$version"
    cat ../LICENSE
    echo '*/'
    cat index.js
} > tempfile
mv tempfile index.js
cd ../

echo 'Minifying...'

sed '$d' dist/index.js | npx terser -mo dist/lexifer.min.js --ecma 2017 \
    -c unsafe,unsafe_symbols -f wrap_func_args=false &&
    npx terser bin/index.js -mc unsafe --ecma 2019 --toplevel \
    -f wrap_func_args=false,semicolons=false > bin/lexifer || exit $?

echo 'Testing...'
# Only redirects on success, not error
if yarn test > /dev/null
then
    echo 'Done.'
else
    exit 1
fi
