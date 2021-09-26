#! /bin/sh
echo 'Combining files...'
sed '/export/d;/import/d' src/*.ts > combined.ts
echo 'Compiling to JS...'
tsc > errors
if [ -s errors ]
then
    echo 'Build errors:'
    cat errors
    rm errors
else
    rm errors
    echo 'Done.'
fi
