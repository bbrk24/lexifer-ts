#! /bin/sh
# TODO, potentially unimportant: Switch this from shell to node, completely
# removing any dependence on a non-JS system. I already specify that node must
# be v14.17.0, but shell is system-dependent.
echo 'Combining files...'
sed '/export/d;/import/d' src/*.ts > combined.ts
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
    # output the version number comment first
    printf '/* Lexifer TS v%s */\n' \
        "$(grep version package.json | cut -d '"' -f 4)" \
        > ./dist/lexifer.min.js
    # use terser
    ./node_modules/.bin/terser ./dist/index.js -m reserved=['genWords'] -c \
        --mangle-props --ecma 2015 -f wrap_func_args=false \
        >> ./dist/lexifer.min.js
    # remove the trailing newline
    perl -pi -e 'chomp if eof' ./dist/lexifer.min.js
    echo 'Done.'
    echo 'Minified file size:' \
        "$(wc -c ./dist/lexifer.min.js | awk '{print $1}') bytes"
fi
