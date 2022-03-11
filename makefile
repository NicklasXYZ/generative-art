DOCS = "documentation"

build-docs:
	cd $(DOCS) && \
	mkdocs build && \
	cp -r site ../docs

