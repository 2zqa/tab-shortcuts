BUILDDIR=build

name=tab-shortcuts
sourcefiles=manifest.json background.js LICENSE logo.png

.PHONY: all
all: $(BUILDDIR)/$(name).zip

$(BUILDDIR)/$(name).zip: $(sourcefiles) | $(BUILDDIR)/
	@echo "=> Preparing to build $(name).zip"
	rm -f $(BUILDDIR)/$(name).zip
	zip -r $(BUILDDIR)/$(name).zip $(sourcefiles)
	@echo "=> Successfully built $(name).zip"

$(BUILDDIR)/:
	mkdir $(BUILDDIR)/

.PHONY: clean
clean:
	rm -rf $(BUILDDIR)/
