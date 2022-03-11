DOCS = "documentation"

build-docs:
	rm -rf /docs && \
	cd $(DOCS) && \
	mkdocs build && \
	cp -r site ../docs

