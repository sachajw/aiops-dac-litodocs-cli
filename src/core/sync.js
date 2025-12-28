import pkg from 'fs-extra';
const { copy, ensureDir, remove, readFile, writeFile } = pkg;
import { join, relative, sep } from 'path';
import { readdir } from 'fs/promises';

export async function syncDocs(sourcePath, projectDir) {
  const targetPath = join(projectDir, 'src', 'pages');

  // Clear existing pages (except index if it exists in template)
  await ensureDir(targetPath);

  // Copy all docs to pages directory
  await copy(sourcePath, targetPath, {
    overwrite: true,
    filter: (src) => {
      // Only copy markdown and mdx files, and directories
      return src.endsWith('.md') || src.endsWith('.mdx') || !src.includes('.');
    },
  });

  // Inject layout into all markdown files
  await injectLayoutIntoMarkdown(targetPath, targetPath);

  // Check for custom landing page conflict
  // If the user provided an index.md or index.mdx, it should take precedence over the template's index.astro
  // Since Astro prioritizes .astro files, we must remove the default index.astro if a user index exists
  const hasUserIndex = ['index.md', 'index.mdx'].some(file =>
    pkg.existsSync(join(targetPath, file))
  );

  if (hasUserIndex) {
    const defaultIndexAstro = join(targetPath, 'index.astro');
    if (pkg.existsSync(defaultIndexAstro)) {
      await remove(defaultIndexAstro);
    }
  }
}

async function injectLayoutIntoMarkdown(dir, rootDir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await injectLayoutIntoMarkdown(fullPath, rootDir);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      let content = await readFile(fullPath, 'utf-8');

      // Calculate relative path to layout
      const relPath = relative(rootDir, fullPath);
      // Count directory separators to determine depth
      // e.g. "api/endpoints.md" -> 1 separator -> depth 1 -> ../../layouts
      // "index.md" -> 0 separators -> depth 0 -> ../layouts
      const depth = relPath.split(sep).length - 1;
      const layoutPath = '../'.repeat(depth + 1) + 'layouts/MarkdownLayout.astro';

      // Check if file already has frontmatter
      if (content.startsWith('---')) {
        // Extract existing frontmatter
        const endOfFrontmatter = content.indexOf('---', 3);
        if (endOfFrontmatter !== -1) {
          const frontmatterBlock = content.substring(3, endOfFrontmatter).trim();
          const body = content.substring(endOfFrontmatter + 3);

          // Determine which layout to use
          let targetLayout = layoutPath;
          if (frontmatterBlock.includes('api:')) {
            targetLayout = '../'.repeat(depth + 1) + 'layouts/APILayout.astro';
          }

          // Check if layout is already specified
          if (!frontmatterBlock.includes('layout:')) {
            // Add layout to existing frontmatter
            content = `---\n${frontmatterBlock}\nlayout: ${targetLayout}\n---${body}`;
          } else {
            // Use existing layout logic or force update? 
            // For now, let's respect user's manual layout if present, or maybe overwrite if it's the default one.
            // But to enable the feature, let's assume if they added 'api:', they want the api layout.
            if (frontmatterBlock.includes('api:') && !frontmatterBlock.includes('layout: APILayout.astro')) {
              // Replace existing layout if it exists, or just warn?
              // The safest is to NOT touch if layout is explicitly set, UNLESS it's the default one we injected before?
              // But we don't know state.
              // Let's just assume if NO layout is set, we pick based on content.
              // If layout IS set, leave it alone.
            }
            content = `---\n${frontmatterBlock}\n---${body}`;
          }
        }
      } else {
        // No frontmatter, add minimal frontmatter with layout
        const title = entry.name.replace(/\.(md|mdx)$/, '').replace(/-/g, ' ');
        // Default to MarkdownLayout
        content = `---\ntitle: ${title}\nlayout: ${layoutPath}\n---\n\n${content}`;
      }

      await writeFile(fullPath, content, 'utf-8');
    }
  }
}
