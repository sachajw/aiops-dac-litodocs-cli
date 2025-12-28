# SuperDocs

The open-source Mintlify alternative. Beautiful documentation sites from Markdown.

## Features

✨ **Simple Setup** - Point to your docs folder and go
🚀 **Astro-Powered** - Leverages Astro's speed and SEO optimization
📝 **Markdown & MDX** - Full support for both formats with frontmatter
🎨 **Responsive Design** - Mobile-friendly, beautiful documentation
🔥 **Hot Reload** - Dev server with live file watching
⚡ **Fast Builds** - Static site generation for optimal performance
🎯 **SEO Optimized** - Meta tags, semantic HTML, and proper structure

## Installation

### Global Installation

```bash
npm install -g superdocs
# or
pnpm add -g superdocs
```

### Local Development

```bash
cd superdocs
pnpm install
chmod +x bin/cli.js
```

## Usage

### Build Command

Generate a static documentation site:

```bash
superdocs build --input ./my-docs --output ./dist
```

**Options:**
- `-i, --input <path>` (required) - Path to your docs folder
- `-o, --output <path>` - Output directory (default: `./dist`)
- `-t, --theme <name>` - Theme to use (`default`, `dark`)
- `-b, --base-url <url>` - Base URL for the site (default: `/`)
- `--search` - Enable search functionality

**Example:**
```bash
superdocs build \
  --input ./docs \
  --output ./public \
  --theme dark \
  --base-url /docs/ \
  --search
```

### Dev Command

Start a development server with hot reload:

```bash
superdocs dev --input ./my-docs
```

**Options:**
- `-i, --input <path>` (required) - Path to your docs folder
- `-t, --theme <name>` - Theme to use
- `-b, --base-url <url>` - Base URL for the site
- `-p, --port <number>` - Port for dev server (default: `4321`)
- `--search` - Enable search functionality

**Example:**
```bash
superdocs dev --input ./docs --port 3000
```

### Eject Command

Export the full Astro project source code to customize it further:

```bash
superdocs eject --input ./my-docs --output ./my-project
```

**Options:**
- `-i, --input <path>` (required) - Path to your docs folder
- `-o, --output <path>` - Output directory for the project (default: `./astro-docs-project`)
- `-t, --theme <name>` - Theme to use
- `-b, --base-url <url>` - Base URL for the site
- `--search` - Enable search functionality

## Documentation Structure

Your docs folder should contain Markdown (`.md`) or MDX (`.mdx`) files:

```
my-docs/
├── index.md
├── getting-started.md
├── api/
│   ├── reference.md
│   └── examples.md
└── guides/
    └── advanced.md
```

### Frontmatter

Add frontmatter to your markdown files for better metadata:

```markdown
---
title: Getting Started
description: Learn how to get started quickly
---

# Getting Started

Your content here...
```

## Architecture

The CLI tool:

1. **Scaffolds** - Creates a temporary Astro project from an internal template
2. **Syncs** - Copies your docs into `src/pages/` for automatic routing
3. **Configures** - Generates dynamic `astro.config.mjs` with your options
4. **Builds/Serves** - Spawns native Astro CLI commands (`astro build` or `astro dev`)
5. **Watches** (dev mode) - Uses `chokidar` to monitor file changes

## Development

### Project Structure

```
superdocs/
├── bin/
│   └── cli.js              # CLI entry point
├── src/
│   ├── cli.js              # Commander setup
│   ├── commands/
│   │   ├── build.js        # Build command
│   │   ├── dev.js          # Dev command with watcher
│   │   └── eject.js        # Eject command
│   ├── core/
│   │   ├── scaffold.js     # Project scaffolding
│   │   ├── sync.js         # File syncing
│   │   ├── config.js       # Config generation
│   │   ├── astro.js        # Astro CLI spawning
│   │   └── output.js       # Output copying
│   └── template/           # Internal Astro template
│       ├── src/
│       │   ├── layouts/
│       │   └── pages/
│       └── package.json
└── package.json
```

### Running Tests

```bash
# Create sample docs
mkdir sample-docs
echo "# Hello\n\nWelcome!" > sample-docs/index.md

# Test build
node bin/cli.js build -i sample-docs -o test-output

# Test dev server
node bin/cli.js dev -i sample-docs
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

---

**Built with ❤️ using Astro and Node.js**
