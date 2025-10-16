import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useDocStore } from '../store/useDocStore';
import { DraggableItem } from './DraggableItem';
import type { ParametroEntrada, ParametroSaida, Validacao, Exemplo } from '../types';

export const MethodSection: React.FC = () => {
  const { documento, metodoAtual, updateMetodo } = useDocStore();
  const [activeTab, setActiveTab] = useState<'params' | 'output' | 'validation' | 'description' | 'examples'>('params');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const metodo = documento?.metodos.find((m) => m.id === metodoAtual);

  if (!metodo) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Selecione um método para editar
      </div>
    );
  }

  // Drag & Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number, items: any[], updateKey: string) => {
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    updateMetodo(metodo.id, { [updateKey]: newItems });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Parâmetros Entrada
  const addParametroEntrada = () => {
    const novo: ParametroEntrada = {
      id: crypto.randomUUID(),
      nome: '',
      formato: 'char(16)',
      obrigatorio: false,
      descricao: ''
    };
    updateMetodo(metodo.id, {
      parametrosEntrada: [...metodo.parametrosEntrada, novo]
    });
  };

  const updateParametroEntrada = (id: string, updates: Partial<ParametroEntrada>) => {
    updateMetodo(metodo.id, {
      parametrosEntrada: metodo.parametrosEntrada.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
    });
  };

  const deleteParametroEntrada = (id: string) => {
    updateMetodo(metodo.id, {
      parametrosEntrada: metodo.parametrosEntrada.filter((p) => p.id !== id)
    });
  };

  // Parâmetros Saída
  const addParametroSaida = () => {
    const novo: ParametroSaida = {
      id: crypto.randomUUID(),
      nome: '',
      tipo: 'char(16)',
      descricao: ''
    };
    updateMetodo(metodo.id, {
      parametrosSaida: [...metodo.parametrosSaida, novo]
    });
  };

  const updateParametroSaida = (id: string, updates: Partial<ParametroSaida>) => {
    updateMetodo(metodo.id, {
      parametrosSaida: metodo.parametrosSaida.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
    });
  };

  const deleteParametroSaida = (id: string) => {
    updateMetodo(metodo.id, {
      parametrosSaida: metodo.parametrosSaida.filter((p) => p.id !== id)
    });
  };

  // Validações
  const addValidacao = () => {
    const nova: Validacao = {
      id: crypto.randomUUID(),
      nome: '',
      descricao: ''
    };
    updateMetodo(metodo.id, {
      validacoes: [...metodo.validacoes, nova]
    });
  };

  const updateValidacao = (id: string, updates: Partial<Validacao>) => {
    updateMetodo(metodo.id, {
      validacoes: metodo.validacoes.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      )
    });
  };

  const deleteValidacao = (id: string) => {
    updateMetodo(metodo.id, {
      validacoes: metodo.validacoes.filter((v) => v.id !== id)
    });
  };

  // Exemplos
  const addExemplo = () => {
    const novo: Exemplo = {
      id: crypto.randomUUID(),
      tipo: 'header',
      descricao: '',
      conteudo: ''
    };
    updateMetodo(metodo.id, {
      exemplos: [...metodo.exemplos, novo]
    });
  };

  const updateExemplo = (id: string, updates: Partial<Exemplo>) => {
    updateMetodo(metodo.id, {
      exemplos: metodo.exemplos.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      )
    });
  };

  const deleteExemplo = (id: string) => {
    updateMetodo(metodo.id, {
      exemplos: metodo.exemplos.filter((e) => e.id !== id)
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header do Método */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Nome do Método</label>
            <input
              type="text"
              value={metodo.nome}
              onChange={(e) => updateMetodo(metodo.id, { nome: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              placeholder="ex: cadastrarPesquisa"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Tipo HTTP</label>
            <select
              value={metodo.tipoHttp}
              onChange={(e) => updateMetodo(metodo.id, { tipoHttp: e.target.value as any })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Objetivo</label>
          <textarea
            value={metodo.objetivo}
            onChange={(e) => updateMetodo(metodo.id, { objetivo: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            placeholder="Descreva o objetivo deste método..."
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        {[
          { id: 'params', label: 'Parâmetros Entrada' },
          { id: 'output', label: 'Parâmetros Saída' },
          { id: 'validation', label: 'Validações' },
          { id: 'description', label: 'Descrição' },
          { id: 'examples', label: 'Exemplos' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'params' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Parâmetros de Entrada</h3>
              <button
                onClick={addParametroEntrada}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {metodo.parametrosEntrada.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhum parâmetro adicionado. Arraste para reordenar.</p>
            ) : (
              <div className="space-y-3">
                {metodo.parametrosEntrada.map((param, index) => (
                  <DraggableItem
                    key={param.id}
                    id={param.id}
                    index={index}
                    onDragStart={handleDragStart}
                    onDragEnter={(i) => handleDragEnter(i, metodo.parametrosEntrada, 'parametrosEntrada')}
                    onDragEnd={handleDragEnd}
                    onDelete={deleteParametroEntrada}
                  >
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Nome</label>
                        <input
                          type="text"
                          value={param.nome}
                          onChange={(e) => updateParametroEntrada(param.id, { nome: e.target.value })}
                          placeholder="cdNome"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Formato</label>
                        <input
                          type="text"
                          value={param.formato}
                          onChange={(e) => updateParametroEntrada(param.id, { formato: e.target.value })}
                          placeholder="char(16)"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Obrigatório</label>
                        <select
                          value={param.obrigatorio ? 'S' : 'N'}
                          onChange={(e) => updateParametroEntrada(param.id, { obrigatorio: e.target.value === 'S' })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                        >
                          <option value="S">S</option>
                          <option value="N">N</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Descrição</label>
                      <input
                        type="text"
                        value={param.descricao}
                        onChange={(e) => updateParametroEntrada(param.id, { descricao: e.target.value })}
                        placeholder="Descrição do parâmetro"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                      />
                    </div>
                  </DraggableItem>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'output' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Parâmetros de Saída</h3>
              <button
                onClick={addParametroSaida}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {metodo.parametrosSaida.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhum parâmetro adicionado</p>
            ) : (
              <div className="space-y-3">
                {metodo.parametrosSaida.map((param, index) => (
                  <DraggableItem
                    key={param.id}
                    id={param.id}
                    index={index}
                    onDragStart={handleDragStart}
                    onDragEnter={(i) => handleDragEnter(i, metodo.parametrosSaida, 'parametrosSaida')}
                    onDragEnd={handleDragEnd}
                    onDelete={deleteParametroSaida}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Nome</label>
                        <input
                          type="text"
                          value={param.nome}
                          onChange={(e) => updateParametroSaida(param.id, { nome: e.target.value })}
                          placeholder="cdRetorno"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Tipo / Tamanho</label>
                        <input
                          type="text"
                          value={param.tipo}
                          onChange={(e) => updateParametroSaida(param.id, { tipo: e.target.value })}
                          placeholder="char(16)"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Descrição</label>
                      <input
                        type="text"
                        value={param.descricao}
                        onChange={(e) => updateParametroSaida(param.id, { descricao: e.target.value })}
                        placeholder="Descrição do parâmetro"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                      />
                    </div>
                  </DraggableItem>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Validações</h3>
              <button
                onClick={addValidacao}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {metodo.validacoes.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhuma validação adicionada</p>
            ) : (
              <div className="space-y-3">
                {metodo.validacoes.map((val, index) => (
                  <DraggableItem
                    key={val.id}
                    id={val.id}
                    index={index}
                    onDragStart={handleDragStart}
                    onDragEnter={(i) => handleDragEnter(i, metodo.validacoes, 'validacoes')}
                    onDragEnd={handleDragEnd}
                    onDelete={deleteValidacao}
                  >
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nome do Campo</label>
                      <input
                        type="text"
                        value={val.nome}
                        onChange={(e) => updateValidacao(val.id, { nome: e.target.value })}
                        placeholder="cdNome"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                      />
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-semibold mb-1">Descrição da Validação</label>
                      <textarea
                        value={val.descricao}
                        onChange={(e) => updateValidacao(val.id, { descricao: e.target.value })}
                        placeholder="Se nulo ou vazio, retornar 2000..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                      />
                    </div>
                  </DraggableItem>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'description' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Descrição do Fluxo</h3>
            <textarea
              value={metodo.descricao.map((d) => d.conteudo).join('\n\n')}
              onChange={(e) => {
                const linhas = e.target.value.split('\n\n');
                updateMetodo(metodo.id, {
                  descricao: linhas.map((linha) => ({
                    id: crypto.randomUUID(),
                    tipo: 'mapeamento' as const,
                    conteudo: linha
                  }))
                });
              }}
              rows={20}
              placeholder="Descreva o fluxo do método...&#10;&#10;Fazer validações dos parâmetros de entrada.&#10;&#10;Montar os parâmetros de entrada no header..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 font-mono text-sm"
            />
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Exemplos</h3>
              <button
                onClick={addExemplo}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {metodo.exemplos.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhum exemplo adicionado</p>
            ) : (
              <div className="space-y-4">
                {metodo.exemplos.map((ex) => (
                  <div key={ex.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 relative group">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold mb-1">Tipo</label>
                        <select
                          value={ex.tipo}
                          onChange={(e) => updateExemplo(ex.id, { tipo: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                        >
                          <option value="header">Header</option>
                          <option value="body">Body (POST)</option>
                          <option value="query">Query Params (GET)</option>
                          <option value="retorno">Retorno</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Descrição (opcional)</label>
                      <input
                        type="text"
                        value={ex.descricao || ''}
                        onChange={(e) => updateExemplo(ex.id, { descricao: e.target.value })}
                        placeholder="Exemplo do retorno do Web Service quando..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Conteúdo</label>
                      <textarea
                        value={ex.conteudo}
                        onChange={(e) => updateExemplo(ex.id, { conteudo: e.target.value })}
                        placeholder={ex.tipo === 'body' || ex.tipo === 'retorno' ? '{\n  "campo": "valor"\n}' : 'Authorization: Bearer ...'}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 font-mono"
                      />
                    </div>
                    <button
                      onClick={() => deleteExemplo(ex.id)}
                      className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                    >
                      <span className="sr-only">Excluir</span>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
