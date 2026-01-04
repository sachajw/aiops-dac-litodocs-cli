import { execa } from 'execa';

let detectedManager = null;

export async function getPackageManager() {
    if (detectedManager) return detectedManager;

    // Check for Bun first (fastest) - keeping preference for Bun as per user rules if available
    try {
        await execa('bun', ['--version']);
        detectedManager = 'bun';
        return 'bun';
    } catch { }

    // Check for pnpm
    try {
        await execa('pnpm', ['--version']);
        detectedManager = 'pnpm';
        return 'pnpm';
    } catch { }

    // Check for yarn
    try {
        await execa('yarn', ['--version']);
        detectedManager = 'yarn';
        return 'yarn';
    } catch { }

    // Default to npm
    detectedManager = 'npm';
    return 'npm';
}

export async function installDependencies(projectDir, { silent = true } = {}) {
    const manager = await getPackageManager();

    await execa(manager, ['install'], {
        cwd: projectDir,
        stdio: silent ? 'pipe' : 'inherit',
        env: { ...process.env, CI: 'true' }, // Force non-interactive mode
    });
}

export async function installPackage(projectDir, packageName, { dev = false, silent = true } = {}) {
    const manager = await getPackageManager();
    const args = manager === 'npm' ? ['install'] : ['add'];
    
    if (dev) {
        args.push('-D');
    }
    
    args.push(packageName);

    await execa(manager, args, {
        cwd: projectDir,
        stdio: silent ? 'pipe' : 'inherit',
    });
}

/**
 * Runs a binary using the package manager (e.g. 'astro').
 */
export async function runBinary(projectDir, binary, args = []) {
    const manager = await getPackageManager();

    let cmd = manager;
    let cmdArgs = [];

    if (manager === 'npm') {
        cmd = 'npx';
        cmdArgs = [binary, ...args];
    } else {
        // bun astro, pnpm astro, yarn astro
        // yarn might need 'yarn run' or just 'yarn' if bin is exposed? 'yarn astro' works.
        cmdArgs = [binary, ...args];
    }

    await execa(cmd, cmdArgs, {
        cwd: projectDir,
        stdio: 'inherit',
        preferLocal: true,
    });
}

export async function getRunInstruction(script) {
    const manager = await getPackageManager();
    if (manager === 'npm') {
        return `npm run ${script}`;
    }
    return `${manager} run ${script}`;
}

export async function getInstallInstruction() {
    const manager = await getPackageManager();
    return `${manager} install`;
}
