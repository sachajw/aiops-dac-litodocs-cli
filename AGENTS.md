# AGENTS.md

## Build/Test/Lint Commands

This is a **pure ES modules project** (no TypeScript, no build step). Code runs directly from source.

```bash
# Install dependencies
pnpm install

# Make CLI executable and link globally for local dev
chmod +x bin/cli.js
npm link

# Test CLI with a docs folder
lito dev -i ./test-docs
lito build -i ./test-docs -o ./dist

# Note: No test or lint commands currently defined in package.json
```

## Code Style Guidelines

### Project Structure
- **Pure ES modules** - All `.js` files use ES6 imports/exports
- **No build step** - Code runs directly from source (no TypeScript, no transpilation)
- **Pipeline pattern** - Resolve template → scaffold to temp → sync docs → generate config → build → cleanup
- **Temp workspace** - All builds use `/tmp/.lito/` as workspace, cleaned up after completion

### Import Style
```javascript
// Prefer named imports from standard modules
import { readFile, writeFile, pathExists } from 'fs-extra';
import { join, basename } from 'path';
import { readdir, stat } from 'fs/promises';

// Default imports for packages that export single objects
import pc from 'picocolors';
import pkg from 'fs-extra';
const { copy, ensureDir } = pkg;

// Dynamic imports for circular dependencies or optional deps
const { installDependencies } = await import('./core/package-manager.js');
```

### Constants & Naming
- **Module constants**: UPPER_SNAKE_CASE at top of file
- **Functions**: camelCase, exported with `export` keyword
- **CLI command functions**: `buildCommand`, `devCommand`, `ejectCommand`

### Error Handling
```javascript
// Pattern 1: Try/catch with silent failures for non-critical operations
try {
  await someOperation();
} catch {
  // Ignore errors
}

// Pattern 2: Fatal errors with process.exit(1)
try {
  await criticalOperation();
} catch (error) {
  console.error(pc.red(error.message));
  process.exit(1);
}

// Pattern 3: Cleanup in finally blocks
try {
  await build();
} finally {
  await cleanupProject();
}
```

### Async Patterns
```javascript
// Always use async/await (no Promise chains)
export async function syncDocs(sourcePath, projectDir) {
  const targetPath = join(projectDir, 'src', 'pages');
  await ensureDir(targetPath);
}

// Parallel operations with Promise.all()
await Promise.all([
  installDependencies(projectDir),
  syncDocs(inputPath, projectDir),
  syncDocsConfig(projectDir, inputPath, userConfigPath)
]);
```

### File System Operations
```javascript
// Use fs-extra for convenience functions
import pkg from 'fs-extra';
const { copy, ensureDir, remove, readFile, writeFile, pathExists } = pkg;

// Use fs/promises for async operations
import { readdir, stat } from 'fs/promises';

// Path handling always with 'path'
import { join, resolve, relative, basename, dirname } from 'path';
```

### JSDoc Comments
Use JSDoc for complex functions with `@param` and `@returns`:
```javascript
/**
 * Merges user config with auto-generated navigation
 * @param {string} projectDir - Path to project directory
 * @param {string} docsPath - Path to docs source
 * @param {string} userConfigPath - Path to user config
 * @param {object} options - Options object
 * @param {boolean} options.validate - Whether to validate config
 * @returns {Promise<{config: object}>}
 */
export async function syncDocsConfig(projectDir, docsPath, userConfigPath, options = {}) {
  // ...
}
```

### CLI Output
```javascript
import pc from 'picocolors';
import { log, spinner, intro, outro } from '@clack/prompts';

// Spinner pattern
const s = spinner();
s.start('Doing something...');
await someOperation();
s.stop('Complete!');

// Colored output
console.log(pc.cyan('Success!'));
console.log(pc.red('Error!'));
```

### Package Manager Detection
The CLI auto-detects package managers in order: **bun → pnpm → yarn → npm**
Use `getPackageManager()` and `runBinary()` from `core/package-manager.js` for cross-manager compatibility.

### Important Paths
- **Temp workspace**: `/tmp/.lito/`
- **Template cache**: `~/.lito/templates/`
- **Template bundle**: `src/template/` (bundled default template)

### Adding New Commands
1. Create `src/commands/mycommand.js` with exported function
2. Register in `src/cli.js` with `program.addCommand()`
3. Import required core modules: `scaffold`, `syncDocs`, `syncDocsConfig`

### Key Functions
- `scaffoldProject()` - Copy template to temp workspace
- `syncDocs()` - Copy docs + inject layout frontmatter
- `syncDocsConfig()` - Merge config + auto-generate navigation
- `generateConfig()` - Generate astro.config.mjs
- `cleanupProject()` - Remove temp directory (always call in finally)
