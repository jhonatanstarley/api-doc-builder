import React, { useState } from 'react';
import { Plus, Save, Trash2, Moon, Sun, Download, Upload, FilePlus, Clock, GitBranch } from 'lucide-react';
import { useDocStore } from '../store/useDocStore';
import { HistoricoModal, SalvarVersaoModal } from './HistoricoModal';
import type { Metodo } from '../types';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps & { onClose: () => void }> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up`}>
      {message}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { documento, metodoAtual, setMetodoAtual, addMetodo, deleteMetodo, darkMode, toggleDarkMode, resetDocumento, salvarVersao, formatarVersao } = useDocStore();
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [showHistorico, setShowHistorico] = useState(false);
  const [showSalvarVersao, setShowSalvarVersao] = useState(false);

  const criarNovoMetodo = () => {
    const novoMetodo: Metodo = {
      id: crypto.randomUUID(),
      nome: 'novoMetodo',
      objetivo: '',
      tipoHttp: 'POST',
      parametrosEntrada: [],
      validacoes: [],
      parametrosSaida: [],
      descricao: [],
      tabelasAuxiliares: [],
      exemplos: []
    };
    addMetodo(novoMetodo);
    setToast({ message: 'Método criado com sucesso!', type: 'success' });
  };

  const handleSalvarRascunho = () => {
    // O Zustand já está persistindo automaticamente
    setToast({ message: '✅ Rascunho salvo com sucesso!', type: 'success' });
  };

  const handleNovoDocumento = () => {
    if (confirm('Deseja criar um novo documento? Os dados atuais serão perdidos se não foram salvos.')) {
      resetDocumento();
      setToast({ message: 'Novo documento criado!', type: 'info' });
    }
  };

  const handleExportarJSON = () => {
    if (!documento) return;
    const json = JSON.stringify(documento, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documento.nomeRecurso || 'documento'}_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'JSON exportado com sucesso!', type: 'success' });
  };

  const handleImportarJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const importedDoc = JSON.parse(event.target.result);
            // Validação básica
            if (importedDoc.nomeRecurso && importedDoc.metodos) {
              useDocStore.setState({ documento: importedDoc });
              setToast({ message: 'Documento importado com sucesso!', type: 'success' });
            } else {
              setToast({ message: 'Arquivo JSON inválido!', type: 'error' });
            }
          } catch (error) {
            setToast({ message: 'Erro ao importar JSON!', type: 'error' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSalvarVersao = (descricao: string, tipo: 'major' | 'minor' | 'patch') => {
    salvarVersao(descricao, tipo);
    setToast({ message: `✅ Versão ${tipo.toUpperCase()} salva com sucesso!`, type: 'success' });
  };

  return (
    <div className={`w-64 h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold">API Doc Builder</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {documento?.nomeRecurso || 'Novo Documento'}Rsrc
        </p>
        {documento && (
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono font-semibold">
              {formatarVersao(documento.versao)}
            </span>
          </div>
        )}
      </div>

      {/* Métodos */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Métodos</h3>
          <button
            onClick={criarNovoMetodo}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Novo Método"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {documento?.metodos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Nenhum método criado
          </p>
        ) : (
          <div className="space-y-2">
            {documento?.metodos.map((metodo) => (
              <div
                key={metodo.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  metodoAtual === metodo.id
                    ? 'bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setMetodoAtual(metodo.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                        metodo.tipoHttp === 'GET' ? 'bg-green-200 text-green-800' :
                        metodo.tipoHttp === 'POST' ? 'bg-blue-200 text-blue-800' :
                        metodo.tipoHttp === 'PUT' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {metodo.tipoHttp}
                      </span>
                      <span className="text-sm font-medium">{metodo.nome}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMetodo(metodo.id);
                    }}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    title="Excluir Método"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={handleNovoDocumento}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <FilePlus className="w-4 h-4" />
          Novo Documento
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowSalvarVersao(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <GitBranch className="w-4 h-4" />
            Salvar
          </button>
          <button
            onClick={() => setShowHistorico(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Clock className="w-4 h-4" />
            Histórico
          </button>
        </div>

        <button
          onClick={handleSalvarRascunho}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <Save className="w-4 h-4" />
          Auto-Save
        </button>
        
        <button
          onClick={handleExportarJSON}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Exportar JSON
        </button>
        <button
          onClick={handleImportarJSON}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          Importar JSON
        </button>
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>

      {/* Modais */}
      <SalvarVersaoModal
        isOpen={showSalvarVersao}
        onClose={() => setShowSalvarVersao(false)}
        onSave={handleSalvarVersao}
      />
      
      <HistoricoModal
        isOpen={showHistorico}
        onClose={() => setShowHistorico(false)}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
