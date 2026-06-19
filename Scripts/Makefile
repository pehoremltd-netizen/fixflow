UNAME_S := $(shell uname -s)
ROOT := $(dir $(realpath $(firstword $(MAKEFILE_LIST))))..

.PHONY: local vercel seed stop

local:
ifeq ($(UNAME_S),Linux)
	cd "$(ROOT)/Scripts" && ./start.sh local
else
	cd /d "$(ROOT)\Scripts" && start.bat local
endif

vercel:
ifeq ($(UNAME_S),Linux)
	cd "$(ROOT)/Scripts" && ./start.sh vercel
else
	cd /d "$(ROOT)\Scripts" && start.bat vercel
endif

seed:
ifeq ($(UNAME_S),Linux)
	cd "$(ROOT)/Scripts" && ./start.sh seed
else
	cd /d "$(ROOT)\Scripts" && start.bat seed
endif

stop:
ifeq ($(UNAME_S),Linux)
	cd "$(ROOT)/Scripts" && ./stop.sh
else
	cd /d "$(ROOT)\Scripts" && stop.bat
endif
