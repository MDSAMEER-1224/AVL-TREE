#!/bin/bash
set -e
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/main/java/avl/*.java
echo "Compiled. Run with: java -cp out avl.Main"
