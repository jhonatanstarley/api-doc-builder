import React, { useState } from 'react';
import { Clock, RotateCcw, Trash2, X, Save } from 'lucide-react';
import { useDocStore } from '../store/useDocStore';
import { format } from 'date-fns';

interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoricoModal: React.FC<HistoricoModalProps> = ({ isOpen, onClose }) => {
  const { historico, restaurarVersao, limparHistorico, formatarVersao } = useDocStore();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleRestaurar = (id: string) => {
    if (confirm('Deseja restaurar esta versão? A versão atual será salva no histórico.')) {
      restaurarVersao(id);
      onClose();
    }
  };

  const handleLimpar = () => {
    if (showConfirm) {
      limparHistorico();
      setShowConfirm(false);
      onClose();
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Histórico de Versões</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLimpar}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {showConfirm ? 'Confirmar Limpeza' : 'Limpar Histórico'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {historico.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Nenhuma versão salva ainda
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Use o botão "Salvar Versão" para criar checkpoints do seu documento
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historico.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-mono text-sm font-semibold">
                          {formatarVersao(item.versao)}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-semibold">
                            Mais Recente
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                        {item.descricao}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          📅 {format(new Date(item.timestamp), "dd/MM/yyyy")}
                        </span>
                        <span>
                          🕒 {format(new Date(item.timestamp), 'HH:mm:ss')}
                        </span>
                        <span>
                          📄 {item.documento.metodos.length} método(s)
                        </span>
                      </div>

                      {item.documento.nomeRecurso && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Recurso:</span> {item.documento.nomeRecurso}Rsrc
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRestaurar(item.id)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restaurar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Total de versões: <strong>{historico.length}</strong> / 50
            </span>
            <span>
              💡 Dica: As últimas 50 versões são mantidas automaticamente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SalvarVersaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (descricao: string, tipo: 'major' | 'minor' | 'patch') => void;
}

export const SalvarVersaoModal: React.FC<SalvarVersaoModalProps> = ({ isOpen, onClose, onSave }) => {
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'major' | 'minor' | 'patch'>('patch');
  const { documento, formatarVersao } = useDocStore();

  if (!isOpen || !documento) return null;

  const handleSave = () => {
    if (!descricao.trim()) {
      alert('Por favor, adicione uma descrição para esta versão');
      return;
    }
    onSave(descricao, tipo);
    setDescricao('');
    setTipo('patch');
    onClose();
  };

  const getNovaVersao = () => {
    const v = documento.versao;
    switch (tipo) {
      case 'major':
        return `v${v.major + 1}.0.0.${Date.now()}`;
      case 'minor':
        return `v${v.major}.${v.minor + 1}.0.${Date.now()}`;
      case 'patch':
        return `v${v.major}.${v.minor}.${v.patch + 1}.${Date.now()}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold">Salvar Nova Versão</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Versão Atual → Nova */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-4 text-lg font-mono">
              <span className="text-gray-600 dark:text-gray-400">
                {formatarVersao(documento.versao)}
              </span>
              <span className="text-2xl">→</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {getNovaVersao()}
              </span>
            </div>
          </div>

          {/* Tipo de Versão */}
          <div>
            <label className="block text-sm font-semibold mb-3">Tipo de Atualização</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTipo('major')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipo === 'major'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                }`}
              >
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">MAJOR</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Mudanças incompatíveis
                </div>
              </button>

              <button
                onClick={() => setTipo('minor')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipo === 'minor'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-yellow-300'
                }`}
              >
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">MINOR</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Novos recursos
                </div>
              </button>

              <button
                onClick={() => setTipo('patch')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipo === 'patch'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                }`}
              >
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">PATCH</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Correções de bugs
                </div>
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Descrição das Mudanças *
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Adicionado método consultarSituacao e corrigidos bugs na validação..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>

          {/* Info */}
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm space-y-2">
            <p className="font-semibold">ℹ️ Guia de Versionamento:</p>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400 ml-4">
              <li>• <strong>MAJOR:</strong> Alterações que quebram compatibilidade</li>
              <li>• <strong>MINOR:</strong> Novos recursos mantendo compatibilidade</li>
              <li>• <strong>PATCH:</strong> Correções de bugs e pequenas melhorias</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Versão
          </button>
        </div>
      </div>
    </div>
  );
};
