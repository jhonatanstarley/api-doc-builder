#!/usr/bin/env node

/**
 * Script de Verificação Pré-Build
 * API Doc Builder - Starley Interface © 2025
 * 
 * Verifica se todos os requisitos estão prontos antes de buildar
 */

const fs = require('fs');
const path = require('path');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

let hasErrors = false;
let hasWarnings = false;

function log(message, color = colors.reset, prefix = '') {
  console.log(`${color}${prefix}${message}${colors.reset}`);
}

function checkFile(filePath, description, required = true) {
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024).toFixed(2);
    log(`✅ ${description}`, colors.green, '  ');
    log(`   └─ ${filePath} (${sizeMB} KB)`, colors.cyan, '  ');
    return true;
  } else {
    if (required) {
      log(`❌ ${description}`, colors.red, '  ');
      log(`   └─ Arquivo não encontrado: ${filePath}`, colors.red, '  ');
      hasErrors = true;
    } else {
      log(`⚠️  ${description}`, colors.yellow, '  ');
      log(`   └─ Arquivo opcional não encontrado: ${filePath}`, colors.yellow, '  ');
      hasWarnings = true;
    }
    return false;
  }
}

function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath);
  
  if (exists && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    log(`✅ ${description} (${files.length} arquivos)`, colors.green, '  ');
    return true;
  } else {
    log(`❌ ${description}`, colors.red, '  ');
    log(`   └─ Diretório não encontrado: ${dirPath}`, colors.red, '  ');
    hasErrors = true;
    return false;
  }
}

function checkPackageJson() {
  log('\n📦 Verificando package.json...', colors.cyan + colors.bright);
  
  if (!checkFile('package.json', 'Arquivo package.json')) {
    return;
  }
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Verificar campos obrigatórios
    const requiredFields = ['name', 'version', 'main', 'description', 'author'];
    requiredFields.forEach(field => {
      if (pkg[field]) {
        log(`✅ Campo "${field}": ${pkg[field]}`, colors.green, '  ');
      } else {
        log(`❌ Campo "${field}" não encontrado`, colors.red, '  ');
        hasErrors = true;
      }
    });
    
    // Verificar scripts importantes
    const importantScripts = ['dev', 'build', 'electron:build'];
    importantScripts.forEach(script => {
      if (pkg.scripts && pkg.scripts[script]) {
        log(`✅ Script "${script}" configurado`, colors.green, '  ');
      } else {
        log(`⚠️  Script "${script}" não encontrado`, colors.yellow, '  ');
        hasWarnings = true;
      }
    });
    
    // Verificar versão
    const version = pkg.version;
    if (version && /^\d+\.\d+\.\d+$/.test(version)) {
      log(`✅ Versão válida: ${version}`, colors.green, '  ');
    } else {
      log(`⚠️  Formato de versão inválido: ${version}`, colors.yellow, '  ');
      log(`   └─ Use formato: X.Y.Z (ex: 1.0.0)`, colors.yellow, '  ');
      hasWarnings = true;
    }
    
  } catch (error) {
    log(`❌ Erro ao ler package.json: ${error.message}`, colors.red, '  ');
    hasErrors = true;
  }
}

function checkElectronConfig() {
  log('\n⚙️  Verificando configurações do Electron...', colors.cyan + colors.bright);
  
  checkFile('main.js', 'Processo principal (main.js)');
  checkFile('preload.js', 'Script preload (preload.js)');
  checkFile('electron-builder.json', 'Configuração do builder', false);
  
  // Se electron-builder.json não existir, verificar se está no package.json
  if (!fs.existsSync('electron-builder.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (pkg.build) {
        log(`✅ Configuração do builder encontrada no package.json`, colors.green, '  ');
      } else {
        log(`⚠️  Nenhuma configuração do Electron Builder encontrada`, colors.yellow, '  ');
        hasWarnings = true;
      }
    } catch (error) {
      // Já tratado anteriormente
    }
  }
}

function checkIcons() {
  log('\n🎨 Verificando ícones...', colors.cyan + colors.bright);
  
  const iconChecks = [
    { path: 'public/icon.ico', desc: 'Ícone Windows (.ico)', platform: 'Windows', required: true },
    { path: 'public/icon.png', desc: 'Ícone Linux (.png)', platform: 'Linux', required: false },
    { path: 'public/icon.icns', desc: 'Ícone macOS (.icns)', platform: 'macOS', required: false },
  ];
  
  iconChecks.forEach(icon => {
    const exists = checkFile(icon.path, `${icon.desc} - ${icon.platform}`, icon.required);
    
    if (exists) {
      // Verificar tamanho mínimo do ícone
      const stats = fs.statSync(icon.path);
      if (stats.size < 1000) { // Menor que 1KB é suspeito
        log(`   ⚠️  Arquivo muito pequeno, pode estar corrompido`, colors.yellow, '  ');
        hasWarnings = true;
      }
    }
  });
}

function checkSourceCode() {
  log('\n📁 Verificando código fonte...', colors.cyan + colors.bright);
  
  checkDirectory('src', 'Diretório src/');
  checkFile('src/main.tsx', 'Entry point (main.tsx)', false);
  checkFile('src/App.tsx', 'Componente App', false);
  checkFile('index.html', 'HTML principal');
  checkFile('vite.config.ts', 'Configuração do Vite', false);
  checkFile('tsconfig.json', 'Configuração TypeScript', false);
  checkFile('tailwind.config.js', 'Configuração Tailwind', false);
}

function checkDependencies() {
  log('\n📚 Verificando dependências...', colors.cyan + colors.bright);
  
  if (checkDirectory('node_modules', 'Dependências instaladas')) {
    // Verificar algumas dependências críticas
    const criticalDeps = [
      'react',
      'react-dom',
      'electron',
      'electron-builder',
      'vite',
    ];
    
    criticalDeps.forEach(dep => {
      const depPath = path.join('node_modules', dep);
      if (fs.existsSync(depPath)) {
        log(`✅ ${dep} instalado`, colors.green, '  ');
      } else {
        log(`❌ ${dep} NÃO instalado`, colors.red, '  ');
        hasErrors = true;
      }
    });
  }
}

function checkLicense() {
  log('\n📄 Verificando licença...', colors.cyan + colors.bright);
  
  checkFile('license.rtf', 'Arquivo de licença (license.rtf)');
  
  // Verificar se contém informações da Starley Interface
  if (fs.existsSync('license.rtf')) {
    const content = fs.readFileSync('license.rtf', 'utf8');
    if (content.includes('Starley Interface')) {
      log(`✅ Licença contém informações da Starley Interface`, colors.green, '  ');
    } else {
      log(`⚠️  Licença pode precisar de atualização`, colors.yellow, '  ');
      hasWarnings = true;
    }
    
    if (content.includes('BlackHat') || content.includes('blackhat')) {
      log(`⚠️  Licença ainda contém referências a "BlackHat"`, colors.yellow, '  ');
      log(`   └─ Considere remover essas referências`, colors.yellow, '  ');
      hasWarnings = true;
    }
  }
}

function checkGit() {
  log('\n🔀 Verificando Git...', colors.cyan + colors.bright);
  
  if (fs.existsSync('.git')) {
    log(`✅ Repositório Git inicializado`, colors.green, '  ');
    
    // Verificar .gitignore
    if (checkFile('.gitignore', 'Arquivo .gitignore', false)) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      const importantIgnores = ['node_modules', 'dist', 'release'];
      
      importantIgnores.forEach(pattern => {
        if (gitignore.includes(pattern)) {
          log(`✅ "${pattern}" no .gitignore`, colors.green, '  ');
        } else {
          log(`⚠️  "${pattern}" não está no .gitignore`, colors.yellow, '  ');
          hasWarnings = true;
        }
      });
    }
  } else {
    log(`⚠️  Repositório Git não inicializado`, colors.yellow, '  ');
    log(`   └─ Execute: git init`, colors.yellow, '  ');
    hasWarnings = true;
  }
}

function checkBuildOutput() {
  log('\n🏗️  Verificando diretórios de build...', colors.cyan + colors.bright);
  
  // Verificar se existem builds anteriores
  if (fs.existsSync('dist')) {
    log(`⚠️  Diretório dist/ existe (build anterior)`, colors.yellow, '  ');
    log(`   └─ Será limpo automaticamente no próximo build`, colors.yellow, '  ');
  } else {
    log(`✅ Diretório dist/ limpo`, colors.green, '  ');
  }
  
  if (fs.existsSync('release')) {
    log(`⚠️  Diretório release/ existe (build anterior)`, colors.yellow, '  ');
    log(`   └─ Será limpo automaticamente no próximo build`, colors.yellow, '  ');
  } else {
    log(`✅ Diretório release/ limpo`, colors.green, '  ');
  }
}

function checkEnvironment() {
  log('\n🌍 Verificando ambiente...', colors.cyan + colors.bright);
  
  // Verificar versão do Node
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.substring(1).split('.')[0]);
  
  if (nodeMajor >= 18) {
    log(`✅ Node.js ${nodeVersion} (>= 18 requerido)`, colors.green, '  ');
  } else {
    log(`❌ Node.js ${nodeVersion} (18+ requerido)`, colors.red, '  ');
    hasErrors = true;
  }
  
  // Verificar npm
  try {
    const { execSync } = require('child_process');
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm ${npmVersion}`, colors.green, '  ');
  } catch (error) {
    log(`⚠️  Não foi possível verificar versão do npm`, colors.yellow, '  ');
  }
}

function provideSummary() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('  RESUMO DA VERIFICAÇÃO', colors.cyan + colors.bright);
  log('='.repeat(60), colors.cyan);
  
  if (!hasErrors && !hasWarnings) {
    log('\n🎉 TUDO PRONTO PARA O BUILD!', colors.green + colors.bright);
    log('\nPróximos passos:', colors.cyan);
    log('  1. Execute: npm run electron:build', colors.reset, '  ');
    log('  2. Ou use: node build-electron.js', colors.reset, '  ');
    log('\n✨ O executável será gerado em: release/', colors.cyan);
  } else if (hasErrors) {
    log('\n❌ ERROS ENCONTRADOS - BUILD NÃO PODE PROSSEGUIR', colors.red + colors.bright);
    log('\nCorreja os erros marcados com ❌ acima antes de buildar.', colors.red);
    log('\nDicas rápidas:', colors.yellow);
    log('  • Arquivos faltando? Verifique se estão no lugar certo', colors.reset, '  ');
    log('  • Dependências faltando? Execute: npm install', colors.reset, '  ');
    log('  • Node.js desatualizado? Atualize para v18+', colors.reset, '  ');
  } else if (hasWarnings) {
    log('\n⚠️  AVISOS ENCONTRADOS - BUILD PODE PROSSEGUIR', colors.yellow + colors.bright);
    log('\nÉ recomendado corrigir os avisos marcados com ⚠️, mas não é obrigatório.', colors.yellow);
    log('\nPara buildar mesmo assim:', colors.cyan);
    log('  • Execute: npm run electron:build', colors.reset, '  ');
  }
  
  log('\n' + '='.repeat(60) + '\n', colors.cyan);
}

function provideRecommendations() {
  log('\n💡 RECOMENDAÇÕES', colors.cyan + colors.bright);
  
  const recommendations = [];
  
  // Verificar se tem ícone macOS
  if (!fs.existsSync('public/icon.icns')) {
    recommendations.push({
      title: 'Ícone macOS',
      desc: 'Adicione icon.icns se planeja distribuir para macOS',
      command: 'Veja: GUIA_ICONES.md'
    });
  }
  
  // Verificar se tem README
  if (!fs.existsSync('README.md')) {
    recommendations.push({
      title: 'Documentação',
      desc: 'Adicione um README.md para documentar o projeto',
      command: null
    });
  }
  
  // Verificar se tem CHANGELOG
  if (!fs.existsSync('CHANGELOG.md')) {
    recommendations.push({
      title: 'Histórico de Versões',
      desc: 'Crie um CHANGELOG.md para rastrear mudanças',
      command: null
    });
  }
  
  // Verificar electron-builder.json
  if (!fs.existsSync('electron-builder.json')) {
    recommendations.push({
      title: 'Configuração do Builder',
      desc: 'Crie electron-builder.json para melhor controle',
      command: 'Veja: ELECTRON_BUILD_GUIDE.md'
    });
  }
  
  if (recommendations.length > 0) {
    recommendations.forEach((rec, index) => {
      log(`\n${index + 1}. ${rec.title}`, colors.yellow, '  ');
      log(`${rec.desc}`, colors.reset, '     ');
      if (rec.command) {
        log(`→ ${rec.command}`, colors.cyan, '     ');
      }
    });
  } else {
    log('  ✅ Nenhuma recomendação no momento!', colors.green);
  }
}

function provideQuickFixes() {
  if (hasErrors || hasWarnings) {
    log('\n🔧 SOLUÇÕES RÁPIDAS', colors.cyan + colors.bright);
    
    // Ícone faltando
    if (!fs.existsSync('public/icon.ico')) {
      log('\n❌ Ícone Windows faltando:', colors.red, '  ');
      log('   Solução 1: Crie um ícone profissional (recomendado)', colors.reset, '     ');
      log('   → Veja: GUIA_ICONES.md', colors.cyan, '     ');
      log('   Solução 2: Use um ícone temporário', colors.reset, '     ');
      log('   → https://favicon.io/favicon-generator/', colors.cyan, '     ');
    }
    
    // Dependências faltando
    if (!fs.existsSync('node_modules')) {
      log('\n❌ Dependências não instaladas:', colors.red, '  ');
      log('   Execute: npm install', colors.cyan, '     ');
    }
    
    // Arquivos principais faltando
    if (!fs.existsSync('main.js')) {
      log('\n❌ main.js faltando:', colors.red, '  ');
      log('   Este arquivo foi fornecido nos artifacts', colors.reset, '     ');
      log('   Copie-o para a raiz do projeto', colors.reset, '     ');
    }
    
    if (!fs.existsSync('preload.js')) {
      log('\n❌ preload.js faltando:', colors.red, '  ');
      log('   Este arquivo foi fornecido nos artifacts', colors.reset, '     ');
      log('   Copie-o para a raiz do projeto', colors.reset, '     ');
    }
  }
}

// Execução principal
function main() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('  API DOC BUILDER - VERIFICAÇÃO PRÉ-BUILD', colors.cyan + colors.bright);
  log('  Starley Interface © 2025', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);
  
  checkEnvironment();
  checkPackageJson();
  checkElectronConfig();
  checkIcons();
  checkSourceCode();
  checkDependencies();
  checkLicense();
  checkGit();
  checkBuildOutput();
  
  provideSummary();
  provideRecommendations();
  provideQuickFixes();
  
  // Exit code
  process.exit(hasErrors ? 1 : 0);
}

// Executar
main();