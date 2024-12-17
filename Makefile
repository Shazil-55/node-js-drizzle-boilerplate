prepare:
	npm install
migrate:
	npm run migrator-v1
local-only-cleanup-database:
	npm run local-only-cleanup-database
	
.PHONY: prepare migrate build dev stop implode logs start-prod local-only-cleanup-database
