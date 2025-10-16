// preload.js - API Doc Builder
// Starley Interface © 2025

const { contextBridge, ipcRenderer } = require('electron');

/**
 * API segura exposta para o renderer process
 * Todas as comunicações entre Electron e React devem passar por aqui
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // ==========================================
  // INFORMAÇÕES DA APLICAÇÃO
  // ==========================================
  
  /**
   * Obtém a versão da aplicação
   * @returns {Promise<string>} Versão (ex: "1.0.0")
   */
  getVersion: () => {
    return new Promise((resolve) => {
      ipcRenderer.send('app-version');
      ipcRenderer.once('app-version', (event, version) => {
        resolve(version);
      });
    });
  },

  /**
   * Obtém o caminho de dados do usuário
   * @returns {Promise<string>} Caminho completo
   */
  getAppPath: () => {
    return ipcRenderer.invoke('get-app-path');
  },

  // ==========================================
  // DIÁLOGOS DO SISTEMA
  // ==========================================
  
  /**
   * Abre diálogo para salvar arquivo
   * @param {Object} options - Opções do diálogo (title, defaultPath, filters, etc)
   * @returns {Promise<Object>} { canceled: boolean, filePath: string }
   */
  showSaveDialog: (options) => {
    return ipcRenderer.invoke('show-save-dialog', options);
  },

  /**
   * Abre diálogo para abrir arquivo
   * @param {Object} options - Opções do diálogo
   * @returns {Promise<Object>} { canceled: boolean, filePaths: string[] }
   */
  showOpenDialog: (options) => {
    return ipcRenderer.invoke('show-open-dialog', options);
  },

  /**
   * Mostra caixa de mensagem
   * @param {Object} options - Opções (type, title, message, buttons)
   * @returns {Promise<Object>} { response: number, checkboxChecked: boolean }
   */
  showMessageBox: (options) => {
    return ipcRenderer.invoke('show-message-box', options);
  },

  // ==========================================
  // SISTEMA DE ATUALIZAÇÕES
  // ==========================================
  
  /**
   * Escuta por atualizações disponíveis
   * @param {Function} callback - Função chamada quando atualização está disponível
   */
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, info) => {
      callback(info);
    });
  },

  /**
   * Escuta progresso do download da atualização
   * @param {Function} callback - Função chamada com progresso (0-100)
   */
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, progress) => {
      callback(progress);
    });
  },

  /**
   * Remove listener de atualização
   */
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.removeAllListeners('download-progress');
  },

  // ==========================================
  // CONTROLE DA APLICAÇÃO
  // ==========================================
  
  /**
   * Fecha a aplicação
   */
  quit: () => {
    ipcRenderer.send('app-quit');
  },

  /**
   * Recarrega a aplicação
   */
  reload: () => {
    ipcRenderer.send('app-reload');
  },

  /**
   * Ping/Pong para verificar se a comunicação está funcionando
   * @returns {Promise<boolean>} true se comunicação está OK
   */
  ping: () => {
    return new Promise((resolve) => {
      ipcRenderer.send('ping');
      const timeout = setTimeout(() => resolve(false), 5000);
      
      ipcRenderer.once('pong', () => {
        clearTimeout(timeout);
        resolve(true);
      });
    });
  },

  // ==========================================
  // PLATAFORMA E AMBIENTE
  // ==========================================
  
  /**
   * Verifica se está rodando no Electron
   * @returns {boolean} true se está no Electron
   */
  isElectron: () => {
    return true;
  },

  /**
   * Obtém informações da plataforma
   * @returns {Object} { platform, arch, version }
   */
  getPlatform: () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version
    };
  },
});

// ==========================================
// LOG DE INICIALIZAÇÃO
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
  console.log('%c🚀 API Doc Builder', 'color: #3B82F6; font-size: 16px; font-weight: bold');
  console.log('%c📦 Starley Interface © 2025', 'color: #10B981; font-size: 12px');
  console.log('%c─────────────────────────────', 'color: #6B7280');
  
  const versions = {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    v8: process.versions.v8
  };
  
  console.table(versions);
  
  console.log('%c✅ Preload script carregado com sucesso', 'color: #10B981');
  console.log('%c─────────────────────────────', 'color: #6B7280');
});

// ==========================================
// SEGURANÇA: PREVENÇÃO DE NAVEGAÇÃO
// ==========================================

window.addEventListener('beforeunload', (event) => {
  // Você pode adicionar lógica para avisar sobre dados não salvos
  // Descomente as linhas abaixo se necessário:
  
  // const hasUnsavedChanges = localStorage.getItem('hasUnsavedChanges');
  // if (hasUnsavedChanges === 'true') {
  //   event.preventDefault();
  //   event.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
  //   return event.returnValue;
  // }
});

// ==========================================
// UTILITÁRIOS PARA DEBUG (apenas dev)
// ==========================================

if (process.env.NODE_ENV === 'development') {
  window.__ELECTRON_DEBUG__ = {
    versions: process.versions,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd ? process.cwd() : 'N/A',
  };
  
  console.log('%c🔧 Modo de Desenvolvimento', 'color: #F59E0B; font-size: 14px; font-weight: bold');
  console.log('Debug info disponível em: window.__ELECTRON_DEBUG__');
}