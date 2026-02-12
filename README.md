# AVL Tree

A small AVL tree application with a Java backend and HTML/CSS/JavaScript frontend.

## Requirements

- **JDK 17+** (OpenJDK 17 or 21 recommended)
  - Ubuntu/Debian: `sudo apt install openjdk-17-jdk`
  - Verify: `java -version` and `javac -version`

## Build and run

From the project root (`avl_tree/`):

```bash
# Compile
./compile.sh
# Or manually:
mkdir -p out
javac -d out src/main/java/avl/*.java

# Run (must run from project root so `static/` is found)
java -cp out avl.Main
```

Then open **http://localhost:8080** in your browser.

## Usage

- **Insert**: Enter an integer and click *Insert* (or press Enter).
- **Delete**: Enter an integer and click *Delete*.
- **Clear**: Remove all nodes.

The tree is drawn with the root at the top; after each insert/delete the tree rebalances and the view updates.

## Project layout

- `src/main/java/avl/` – Java backend (AVL tree, HTTP server, API)
- `static/` – Frontend (index.html, styles.css, app.js)
- `compile.sh` – Compilation script

## API

- `GET /api/tree` – Current tree (JSON) and size
- `POST /api/insert` – Body: `{"value": number}` – Insert and return tree
- `POST /api/delete` – Body: `{"value": number}` – Delete and return tree
- `POST /api/clear` – Clear tree and return empty state
