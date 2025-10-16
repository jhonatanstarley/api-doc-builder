#!/usr/bin/env node

/**
 * Script de Build Automatizado - API Doc Builder
 * Starley Interface © 2025
 * 
 * Executa o processo completo de build:
 * 1. Limpa builds anteriores
 * 2. Compila TypeScript
 * 3. Gera build do Vite
 * 4. Cria executável com Electron Builder
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function execCommand(command, errorMessage) {
  try {
    log(`\n🔄 Executando: ${command}`, colors.cyan);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`\n❌ Erro: ${errorMessage}`, colors.red);
    log(error.message, colors.red);
    return false;
  }
}

function checkFiles() {
  log('\n📋 Verificando arquivos necessários...', colors.yellow);
  
  const requiredFiles = [
    { path: 'main.js', desc: 'Processo principal Electron' },
    { path: 'preload.js', desc: 'Script preload' },
    { path: 'package.json', desc: 'Configuração do projeto' },
    { path: 'electron-builder.json', desc: 'Configuração do builder' },
    { path: 'license.rtf', desc: 'Licença' },
    { path: 'public/icon.ico', desc: 'Ícone Windows' },
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      log(`  ✅ ${file.desc}: ${file.path}`, colors.green);
    } else {
      log(`  ❌ ${file.desc}: ${file.path} - NÃO ENCONTRADO`, colors.red);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function cleanBuild() {
  log('\n🧹 Limpando builds anteriores...', colors.yellow);
  
  const dirsToClean = ['dist', 'release'];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      log(`  ✅ Removido: ${dir}`, colors.green);
    }
  });
}

function checkDependencies() {
  log('\n📦 Verificando dependências...', colors.yellow);
  
  if (!fs.existsSync('node_modules')) {
    log('  ⚠️  node_modules não encontrado. Instalando dependências...', colors.yellow);
    return execCommand('npm install', 'Falha ao instalar dependências');
  }
  
  log('  ✅ Dependências OK', colors.green);
  return true;
}

function buildVite() {
  log('\n🏗️  Compilando projeto com Vite...', colors.yellow);
  return execCommand('npm run build', 'Falha ao compilar com Vite');
}

function buildElectron(platform) {
  log('\n📦 Criando executável com Electron Builder...', colors.yellow);
  
  let command = 'npm run electron:build';
  
  if (platform === 'all') {
    command = 'npm run electron:build:all';
    log('  📢 Construindo para todas as plataformas...', colors.cyan);
  } else {
    log('  📢 Construindo para Windows...', colors.cyan);
  }
  
  return execCommand(command, 'Falha ao criar executável');
}

function showResults() {
  log('\n✨ Build concluído com sucesso!', colors.green + colors.bright);
  
  if (fs.existsSync('release')) {
    log('\n📁 Arquivos gerados em:', colors.cyan);
    const files = fs.readdirSync('release');
    files.forEach(file => {
      const filePath = path.join('release', file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      log(`  📄 ${file} (${sizeMB} MB)`, colors.green);
    });
  }
  
  log('\n🎉 Pronto para distribuição!', colors.green + colors.bright);
}

// Processo principal
async function main() {
  const platform = process.argv[2] || 'win';
  
  log('\n' + '='.repeat(60), colors.cyan);
  log('  API DOC BUILDER - BUILD AUTOMATIZADO', colors.cyan + colors.bright);
  log('  Starley Interface © 2025', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);
  
  // Etapa 1: Verificar arquivos
  if (!checkFiles()) {
    log('\n❌ Build cancelado: arquivos necessários não encontrados', colors.red);
    process.exit(1);
  }
  
  // Etapa 2: Verificar dependências
  if (!checkDependencies()) {
    log('\n❌ Build cancelado: falha nas dependências', colors.red);
    process.exit(1);
  }
  
  // Etapa 3: Limpar builds anteriores
  cleanBuild();
  
  // Etapa 4: Build do Vite
  if (!buildVite()) {
    log('\n❌ Build cancelado: falha na compilação', colors.red);
    process.exit(1);
  }
  
  // Etapa 5: Build do Electron
  if (!buildElectron(platform)) {
    log('\n❌ Build cancelado: falha ao criar executável', colors.red);
    process.exit(1);
  }
  
  // Etapa 6: Mostrar resultados
  showResults();
}

// Executar
main().catch(error => {
  log('\n❌ Erro fatal durante o build:', colors.red);
  log(error.stack, colors.red);
  process.exit(1);
});