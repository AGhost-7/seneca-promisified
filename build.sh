for f in packages/*; do
	babel "$f/index.es6" -o "$f/index.js"
	babel "$f/test.es6" -o "$f/test.js"
done
