#!/usr/bin/env node

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SECURE BUILD SCRIPT
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Aman, Risenex Global
 * 
 * Usage:
 *   npm run build:secure        → Full protection (production)
 *   npm run build:secure:fast   → Quick build (testing)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const JavaScriptObfuscator = require('javascript-obfuscator');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DIST_DIR = path.join(__dirname, '../dist');
const SECURE_DIR = path.join(__dirname, '../dist-secure');

// 🔐 HIGH SECURITY FILES (extra protection)
const HIGH_SECURITY_FILES = [
  'soriva.personality',
  'jailbreak-detector',
  'prompt-sanitizer',
  'security-config',
  'context.builder',
  'content-moderator',
];

// Standard obfuscation config
const STANDARD_CONFIG = {
  compact: true,
  simplify: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  stringArray: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayThreshold: 0.75,
  stringArrayEncoding: ['base64'],
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.3,
  splitStrings: true,
  splitStringsChunkLength: 8,
  selfDefending: true,
  target: 'node',
  sourceMap: false,
  reservedNames: ['^prisma', '^req$', '^res$', '^next$', '^router$', '^app$'],
};

// HIGH security config for sensitive files
const HIGH_SECURITY_CONFIG = {
  ...STANDARD_CONFIG,
  stringArrayThreshold: 1.0,
  stringArrayEncoding: ['rc4', 'base64'],
  stringArrayWrappersCount: 5,
  stringArrayWrappersChainedCalls: true,
  controlFlowFlatteningThreshold: 1.0,
  deadCodeInjectionThreshold: 0.5,
  splitStringsChunkLength: 4,
  transformObjectKeys: true,
  unicodeEscapeSequence: true,
};

// Quick config (for fast builds)
const QUICK_CONFIG = {
  compact: true,
  simplify: true,
  identifierNamesGenerator: 'hexadecimal',
  stringArray: true,
  stringArrayThreshold: 0.5,
  sourceMap: false,
  target: 'node',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function log(message, type = 'info') {
  const icons = {
    info: '📦',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    security: '🔐',
    build: '🔨',
  };
  console.log(`${icons[type] || '•'} ${message}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('test')) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function isHighSecurityFile(filePath) {
  const fileName = path.basename(filePath);
  return HIGH_SECURITY_FILES.some((hsf) => fileName.includes(hsf));
}

function obfuscateFile(inputPath, outputPath, config) {
  try {
    const code = fs.readFileSync(inputPath, 'utf8');
    
    // Skip if already obfuscated or too small
    if (code.includes('_0x') || code.length < 100) {
      fs.copyFileSync(inputPath, outputPath);
      return { success: true, skipped: true };
    }

    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, config);
    fs.writeFileSync(outputPath, obfuscatedCode.getObfuscatedCode());
    return { success: true, skipped: false };
  } catch (error) {
    // If obfuscation fails, copy original
    fs.copyFileSync(inputPath, outputPath);
    return { success: false, error: error.message };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN BUILD FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function build() {
  const startTime = Date.now();
  const isQuick = process.argv.includes('--fast');

  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   🔐 SORIVA SECURE BUILD');
  console.log('   Mode:', isQuick ? 'QUICK (Development)' : 'FULL (Production)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n');

  try {
    // Step 1: TypeScript Compilation
    log('Compiling TypeScript...', 'build');
    execSync('npx tsc', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    log('TypeScript compiled successfully', 'success');

    // Check if dist exists
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error('dist folder not found. TypeScript compilation may have failed.');
    }

    // Step 2: Prepare secure directory
    log('Preparing secure output directory...', 'build');
    if (fs.existsSync(SECURE_DIR)) {
      fs.rmSync(SECURE_DIR, { recursive: true });
    }
    ensureDir(SECURE_DIR);

    // Step 3: Get all JS files
    const files = getAllFiles(DIST_DIR);
    
    if (files.length === 0) {
      throw new Error('No JavaScript files found in dist folder.');
    }

    let stats = { total: 0, obfuscated: 0, highSecurity: 0, skipped: 0, errors: 0 };

    // Step 4: Obfuscate each file
    log(`Obfuscating ${files.length} files...`, 'security');

    for (const filePath of files) {
      const relativePath = path.relative(DIST_DIR, filePath);
      const outputPath = path.join(SECURE_DIR, relativePath);

      ensureDir(path.dirname(outputPath));
      stats.total++;

      // Determine config based on file sensitivity
      let config;
      if (isQuick) {
        config = QUICK_CONFIG;
      } else if (isHighSecurityFile(filePath)) {
        config = HIGH_SECURITY_CONFIG;
        stats.highSecurity++;
        log(`HIGH SECURITY: ${relativePath}`, 'security');
      } else {
        config = STANDARD_CONFIG;
      }

      const result = obfuscateFile(filePath, outputPath, config);

      if (result.skipped) {
        stats.skipped++;
      } else if (result.success) {
        stats.obfuscated++;
      } else {
        stats.errors++;
        log(`Error: ${relativePath} - ${result.error}`, 'warning');
      }
    }

    // Step 5: Copy package.json for production
    log('Creating production package.json...', 'build');
    const packageJsonPath = path.join(__dirname, '../package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = require(packageJsonPath);
      const prodPackage = {
        name: packageJson.name,
        version: packageJson.version,
        main: 'index.js',
        scripts: {
          start: 'node index.js',
        },
        dependencies: packageJson.dependencies,
      };
      fs.writeFileSync(
        path.join(SECURE_DIR, 'package.json'),
        JSON.stringify(prodPackage, null, 2)
      );
    }

    // Step 6: Copy prisma folder if exists
    const prismaDir = path.join(__dirname, '../prisma');
    if (fs.existsSync(prismaDir)) {
      log('Copying Prisma schema...', 'build');
      const securePrismaDir = path.join(SECURE_DIR, 'prisma');
      ensureDir(securePrismaDir);
      
      // Copy schema.prisma
      const schemaPath = path.join(prismaDir, 'schema.prisma');
      if (fs.existsSync(schemaPath)) {
        fs.copyFileSync(schemaPath, path.join(securePrismaDir, 'schema.prisma'));
      }
    }

    // Step 7: Remove source maps
    log('Removing source maps...', 'security');
    try {
      execSync(`find ${SECURE_DIR} -name "*.map" -delete 2>/dev/null || true`, {
        stdio: 'pipe',
      });
    } catch (e) {
      // Ignore errors
    }

    // Step 8: Create build info
    const buildInfo = {
      version: require(path.join(__dirname, '../package.json')).version || '1.0.0',
      buildTime: new Date().toISOString(),
      mode: isQuick ? 'quick' : 'full',
      nodeVersion: process.version,
      stats,
    };
    fs.writeFileSync(
      path.join(SECURE_DIR, '.build-info.json'),
      JSON.stringify(buildInfo, null, 2)
    );

    // Done!
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   ✅ BUILD COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   📁 Output: dist-secure/`);
    console.log(`   📊 Files processed: ${stats.total}`);
    console.log(`   🔐 High security: ${stats.highSecurity}`);
    console.log(`   ✅ Obfuscated: ${stats.obfuscated}`);
    console.log(`   ⏭️  Skipped: ${stats.skipped}`);
    console.log(`   ⚠️  Errors: ${stats.errors}`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n');
    console.log('🚀 Deploy: cd dist-secure && npm install --production && node index.js');
    console.log('\n');
  } catch (error) {
    log(`Build failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run build
build();