import React from 'react';
import { useDocStore } from '../store/useDocStore';

export const HeaderSection: React.FC = () => {
  const { documento, updateDocumento } = useDocStore();

  if (!documento) return null;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2">
          Nome do Recurso
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={documento.nomeRecurso}
            onChange={(e) => updateDocumento({ nomeRecurso: e.target.value })}
            placeholder="ex: Advise, Pirelli, etc."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
          <span className="text-gray-500 font-mono">Rsrc</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Autenticação
        </label>
        <input
          type="text"
          value={documento.descricaoGeral.autenticacao}
          onChange={(e) =>
            updateDocumento({
              descricaoGeral: { ...documento.descricaoGeral, autenticacao: e.target.value }
            })
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          URL Base
        </label>
        <input
          type="text"
          value={documento.descricaoGeral.urlBase}
          onChange={(e) =>
            updateDocumento({
              descricaoGeral: { ...documento.descricaoGeral, urlBase: e.target.value }
            })
          }
          placeholder="https://api-exemplo.com.br"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Regras Gerais da API
        </label>
        <textarea
          value={documento.descricaoGeral.regras}
          onChange={(e) =>
            updateDocumento({
              descricaoGeral: { ...documento.descricaoGeral, regras: e.target.value }
            })
          }
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
        />
      </div>
    </div>
  );
};
