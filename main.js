// main.js - API Doc Builder
// Starley Interface © 2025

import { app, BrowserWindow, ipcMain, dialog, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url'; // Necessário para simular __dirname
import autoUpdaterPkg from 'electron-updater';
const { autoUpdater } = autoUpdaterPkg;

// Variáveis globais
let mainWindow;
const isDevelopment = process.env.NODE_ENV === 'development';

// ⚠️ CORREÇÃO: Define __dirname para compatibilidade com Módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Obtém a resolução da tela do usuário
 * @returns {Object} { width, height }
 */
function getScreenResolution() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  console.log(`📺 Resolução detectada: ${width}x${height}`);
  
  // Retorna 90% da resolução para não ocupar toda a tela
  return {
    width: Math.floor(width * 0.9),
    height: Math.floor(height * 0.9)
  };
}

/**
 * Cria e configura a janela principal do Electron
 */
async function createWindow() {
  const resolution = getScreenResolution();
  
  mainWindow = new BrowserWindow({
    width: resolution.width,
    height: resolution.height,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDevelopment,
      sandbox: true,
    },
    autoHideMenuBar: true,
    frame: true,
    icon: path.join(__dirname, 'public', 'icon.png'),
    title: 'API Doc Builder - Starley Interface',
    backgroundColor: '#000000ff',
    show: false,
  });

  // Remover menu
  mainWindow.setMenu(null);

  // Carregar aplicação
  if (isDevelopment) {
    // Modo desenvolvimento - conectar ao servidor Vite
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Modo produção - carregar arquivo estático
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ API Doc Builder carregado com sucesso');
  });

  // Eventos da janela
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('📄 Página carregada');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Falha ao carregar:', errorDescription);
    
    if (!isDevelopment && (errorCode === -102 || errorCode === -6)) {
      dialog.showErrorBox(
        'Erro ao Carregar',
        'Não foi possível carregar a aplicação. Por favor, reinstale o programa.'
      );
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Verificar atualizações apenas em produção
  if (!isDevelopment) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3000);
  }
}

// Ciclo de vida da aplicação
app.whenReady().then(() => {
  console.log('🚀 API Doc Builder iniciando...');
  console.log('📦 Versão:', app.getVersion());
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  console.log('👋 API Doc Builder encerrando...');
});

// Auto-updater eventos
autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Verificando atualizações...');
});

autoUpdater.on('update-available', (info) => {
  console.log('✨ Atualização disponível:', info.version);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', () => {
  console.log('✅ Aplicação está atualizada');
});

autoUpdater.on('error', (err) => {
  console.error('❌ Erro no auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  const percent = Math.round(progressObj.percent);
  console.log(`📥 Download: ${percent}%`);
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('✅ Atualização baixada:', info.version);
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Atualização Pronta',
    message: `Uma nova versão (${info.version}) foi baixada. Deseja reiniciar agora para instalar?`,
    buttons: ['Reiniciar Agora', 'Mais Tarde'],
    defaultId: 0,
    cancelId: 1
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// Tratamento de erros globais
process.on('uncaughtException', (error) => {
  console.error('💥 Erro não tratado:', error);
  dialog.showErrorBox(
    'Erro Fatal',
    `Ocorreu um erro inesperado:\n\n${error.message}\n\nA aplicação será fechada.`
  );
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promise rejeitada:', reason);
});

// IPC Handlers - Comunicação com o renderer
ipcMain.on('app-version', (event) => {
  event.reply('app-version', app.getVersion());
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  if (!mainWindow || mainWindow.isDestroyed()) return { canceled: true };
  return await dialog.showSaveDialog(mainWindow, options);
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  if (!mainWindow || mainWindow.isDestroyed()) return { canceled: true };
  return await dialog.showOpenDialog(mainWindow, options);
});

ipcMain.handle('show-message-box', async (event, options) => {
  if (!mainWindow || mainWindow.isDestroyed()) return { response: 0 };
  return await dialog.showMessageBox(mainWindow, options);
});

ipcMain.on('ping', (event) => {
  event.reply('pong');
});

ipcMain.on('app-quit', () => {
  app.quit();
});

ipcMain.on('app-reload', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.reload();
  }
});

console.log('✨ API Doc Builder - Starley Interface');
console.log('📍 Diretório:', __dirname);
console.log('🔧 Modo:', isDevelopment ? 'Desenvolvimento' : 'Produção');