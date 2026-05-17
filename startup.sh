#!/bin/bash
# Custom startup script that bypasses Azure's Oryx auto-generated wrapper.
# The default wrapper does `rm -fr /node_modules` + `mv node_modules _del_node_modules`,
# which destroys the trimmed node_modules shipped by Next.js standalone output.
set -euo pipefail
cd /home/site/wwwroot
exec node server.js
