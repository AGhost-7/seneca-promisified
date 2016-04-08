for f in packages/*; do
	babel -w "$f/index.es6" -o "$f/index.js" &
	babel -w "$f/test.es6" -e "$f/test.js" &
done
