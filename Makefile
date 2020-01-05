compiled=./dist/drandjs.js

compile:
	@find ./src -type f -name "*.js" | xargs cat > $(compiled)
