for f in packages/*; do
	mkdir -p "$f/lib"
	babel "$f/src/index.js" -o "$f/lib/index.js"
	mkdir -p "$f/.test"
	babel "$f/test/index.js" -o "$f/.test/index.js"
done
