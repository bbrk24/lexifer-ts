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

echo 'Combining files...'
# put the version number and license comment here, so it ends up in all dist/
# files
{
    # the use of `/*!` ensures compilation preserves it
    printf '/*!\nLexifer TS v%s\n\n' \
        "$(grep version package.json | cut -d '"' -f 4)"
    cat LICENSE
    echo '*/'
    sed '/export/d;/import/d' src/*.ts
} > combined.ts

echo 'Compiling to JS...'
errors=$(./node_modules/.bin/tsc) 

if [ -n "$errors" ]
then
    echo 'Build errors:'
    echo "$errors"
else
    # change CRLF to LF (thanks Microsoft)
    sed -e s/^M// dist/index.js > tempfile
    mv tempfile dist/index.js
    sed -e s/^M// dist/index.d.ts > tempfile
    mv tempfile dist/index.d.ts
    
    echo 'Minifying code...'
    
    # use terser
    # --mangle-props is more trouble than it's worth
    # -c unsafe replaces `new Error()` with `Error()`
    ./node_modules/.bin/terser dist/index.js -mo dist/lexifer.min.js \
        -c unsafe --ecma 2015 -f wrap_func_args=false,semicolons=false
    
    # remove the trailing newline
    perl -pi -e 'chomp if eof' dist/lexifer.min.js
    
    # prepare for use as a package by declaring exports
    # can't be done earlier because otherwise TSC tries to prepare for a module loader
    # ES6 and CommonJS modules can't be used with only one outfile for some reason
    echo 'module.exports = main;' >> dist/index.js
    echo 'export default main;' >> dist/index.d.ts
    
    # and now it's done
    echo 'Done.'
    echo 'Minified file size:' \
        "$(wc -c dist/lexifer.min.js | awk '{print $1}') bytes"
fi
