import { join } from 'path';
import pkg from 'fs-extra';
const { writeFile, readFile, pathExists } = pkg;
import { installPackage } from './package-manager.js';

export async function configureProvider(projectDir, provider, rendering = 'static') {
  // Cloudflare
  if (provider === 'cloudflare') {
    if (rendering !== 'static') {
      await installPackage(projectDir, '@astrojs/cloudflare');
      await updateAstroConfig(projectDir, 'cloudflare', rendering);
    }
    // Cloudflare usually requires a _routes.json or wrangler.toml, but the adapter handles the build output.
    // We can add a basic wrangler.toml if needed, but often not required for Pages.
  }
  
  // Vercel
  else if (provider === 'vercel') {
    if (rendering !== 'static') {
      await installPackage(projectDir, '@astrojs/vercel');
      await updateAstroConfig(projectDir, 'vercel', rendering);
    }
    const configPath = join(projectDir, 'vercel.json');
    if (!await pathExists(configPath)) {
      const content = {
        "cleanUrls": true,
        "framework": "astro",
        "buildCommand": "lito build",
        "outputDirectory": "dist"
      };
      await writeFile(configPath, JSON.stringify(content, null, 2), 'utf-8');
    }
  }
  
  // Netlify
  else if (provider === 'netlify') {
    if (rendering !== 'static') {
      await installPackage(projectDir, '@astrojs/netlify');
      await updateAstroConfig(projectDir, 'netlify', rendering);
    }
    const configPath = join(projectDir, 'netlify.toml');
    if (!await pathExists(configPath)) {
      const content = `[build]
  publish = "dist"
  command = "lito build"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
`;
      await writeFile(configPath, content, 'utf-8');
    }
  }
}

async function updateAstroConfig(projectDir, adapterName, rendering) {
  const configPath = join(projectDir, 'astro.config.mjs');
  let content = await readFile(configPath, 'utf-8');

  // Add import
  const importStatement = `import ${adapterName} from '@astrojs/${adapterName}';\n`;
  if (!content.includes(`@astrojs/${adapterName}`)) {
    content = importStatement + content;
  }

  // Add adapter and output to defineConfig
  // We look for "export default defineConfig({"
  if (content.includes('export default defineConfig({') && !content.includes('output:')) {
    content = content.replace(
      'export default defineConfig({\n',
      `export default defineConfig({\n  adapter: ${adapterName}(),\n  output: '${rendering}',`
    );
  }

  await writeFile(configPath, content, 'utf-8');
}