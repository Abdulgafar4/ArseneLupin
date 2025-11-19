import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

try {
  // Try to require the rollup native binding
  require('@rollup/rollup-linux-x64-gnu');
  console.log('✅ Rollup native bindings already installed');
} catch (e) {
  console.log('📦 Installing rollup native bindings for Linux...');
  try {
    execSync('npm install --no-save --force @rollup/rollup-linux-x64-gnu', {
      stdio: 'inherit'
    });
    console.log('✅ Rollup native bindings installed successfully');
  } catch (installError) {
    console.warn('⚠️  Could not install rollup native bindings, continuing anyway...');
  }
}

