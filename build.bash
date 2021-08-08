echo 'Combining files...'
cat src/*.ts > combined.ts
sed -i '/export/d' combined.ts
sed -i '/import/d' combined.ts
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
