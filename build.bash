echo 'Combining files...'
cat src/*.ts > combined.ts
sed -i '/export/d' combined.ts
sed -i '/import/d' combined.ts
echo 'Compiling to JS...'
tsc > errors.txt
if [ -s errors.txt ]
then
    echo 'Build errors:'
    cat errors.txt
    rm errors.txt
else
    rm errors.txt
    echo 'Done.'
fi
