DOCS = "documentation"

build-docs:
	rm -rf ./docs && \
	cd $(DOCS) && \
	rm -rf site && \
	mkdocs build && \
	cp -r site ../docs && \
	rm -rf site

