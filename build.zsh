echo 'Combining files...'
cat src/*.ts > combined.ts
sed -i '' '/export/d' combined.ts
sed -i '' '/import/d' combined.ts
echo 'Compiling to JS...'
tsc
echo 'Done.'
