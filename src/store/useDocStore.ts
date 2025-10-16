import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Documento, Metodo, Versao, HistoricoVersao } from '../types';

interface DocStore {
  documento: Documento | null;
  metodoAtual: string | null;
  darkMode: boolean;
  historico: HistoricoVersao[];
  
  // Actions
  setDocumento: (doc: Documento) => void;
  updateDocumento: (updates: Partial<Documento>) => void;
  addMetodo: (metodo: Metodo) => void;
  updateMetodo: (id: string, updates: Partial<Metodo>) => void;
  deleteMetodo: (id: string) => void;
  setMetodoAtual: (id: string | null) => void;
  toggleDarkMode: () => void;
  resetDocumento: () => void;
  
  // Versioning
  salvarVersao: (descricao: string, tipo: 'major' | 'minor' | 'patch') => void;
  restaurarVersao: (historicoId: string) => void;
  limparHistorico: () => void;
  formatarVersao: (versao: Versao) => string;
}

const criarVersaoInicial = (): Versao => ({
  major: 1,
  minor: 0,
  patch: 0,
  build: Date.now()
});

const criarDocumentoVazio = (): Documento => ({
  id: crypto.randomUUID(),
  nomeRecurso: '',
  versao: criarVersaoInicial(),
  descricaoGeral: {
    autenticacao: 'Authorization: Bearer Token',
    urlBase: '',
    regras: 'Todas as rotas exigem a presença de token de acesso no header "Authorization" no padrão Bearer (Authorization: Bearer <token>). Caso não seja informado, esteja expirado ou o usuário dono não possua a funcionalidade, a API retornará erro com status HTTP 401.'
  },
  metodos: [],
  criadoEm: new Date().toISOString(),
  atualizadoEm: new Date().toISOString()
});

const incrementarVersao = (versao: Versao, tipo: 'major' | 'minor' | 'patch'): Versao => {
  switch (tipo) {
    case 'major':
      return {
        major: versao.major + 1,
        minor: 0,
        patch: 0,
        build: Date.now()
      };
    case 'minor':
      return {
        major: versao.major,
        minor: versao.minor + 1,
        patch: 0,
        build: Date.now()
      };
    case 'patch':
      return {
        major: versao.major,
        minor: versao.minor,
        patch: versao.patch + 1,
        build: Date.now()
      };
  }
};

export const useDocStore = create<DocStore>()(
  persist(
    (set, get) => ({
      documento: criarDocumentoVazio(),
      metodoAtual: null,
      darkMode: false,
      historico: [],

      setDocumento: (doc) => set({ documento: doc }),

      updateDocumento: (updates) =>
        set((state) => ({
          documento: state.documento
            ? {
                ...state.documento,
                ...updates,
                atualizadoEm: new Date().toISOString(),
                versao: {
                  ...state.documento.versao,
                  build: Date.now()
                }
              }
            : null
        })),

      addMetodo: (metodo) =>
        set((state) => ({
          documento: state.documento
            ? {
                ...state.documento,
                metodos: [...state.documento.metodos, metodo],
                atualizadoEm: new Date().toISOString(),
                versao: {
                  ...state.documento.versao,
                  build: Date.now()
                }
              }
            : null,
          metodoAtual: metodo.id
        })),

      updateMetodo: (id, updates) =>
        set((state) => ({
          documento: state.documento
            ? {
                ...state.documento,
                metodos: state.documento.metodos.map((m) =>
                  m.id === id ? { ...m, ...updates } : m
                ),
                atualizadoEm: new Date().toISOString(),
                versao: {
                  ...state.documento.versao,
                  build: Date.now()
                }
              }
            : null
        })),

      deleteMetodo: (id) =>
        set((state) => ({
          documento: state.documento
            ? {
                ...state.documento,
                metodos: state.documento.metodos.filter((m) => m.id !== id),
                atualizadoEm: new Date().toISOString(),
                versao: {
                  ...state.documento.versao,
                  build: Date.now()
                }
              }
            : null,
          metodoAtual: state.metodoAtual === id ? null : state.metodoAtual
        })),

      setMetodoAtual: (id) => set({ metodoAtual: id }),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      resetDocumento: () => set({ documento: criarDocumentoVazio(), metodoAtual: null }),

      // Versionamento
      salvarVersao: (descricao, tipo) => {
        const state = get();
        if (!state.documento) return;

        const novaVersao = incrementarVersao(state.documento.versao, tipo);
        
        const historicoItem: HistoricoVersao = {
          id: crypto.randomUUID(),
          versao: { ...state.documento.versao },
          documento: JSON.parse(JSON.stringify(state.documento)),
          timestamp: new Date().toISOString(),
          descricao
        };

        set((state) => ({
          historico: [historicoItem, ...state.historico].slice(0, 50), // Mantém últimas 50 versões
          documento: state.documento
            ? {
                ...state.documento,
                versao: novaVersao,
                atualizadoEm: new Date().toISOString()
              }
            : null
        }));
      },

      restaurarVersao: (historicoId) => {
        const state = get();
        const versao = state.historico.find((h) => h.id === historicoId);
        
        if (versao) {
          // Salvar versão atual antes de restaurar
          if (state.documento) {
            const backupItem: HistoricoVersao = {
              id: crypto.randomUUID(),
              versao: { ...state.documento.versao },
              documento: JSON.parse(JSON.stringify(state.documento)),
              timestamp: new Date().toISOString(),
              descricao: 'Backup automático antes de restaurar'
            };

            set({
              documento: {
                ...versao.documento,
                id: state.documento.id,
                atualizadoEm: new Date().toISOString()
              },
              historico: [backupItem, ...state.historico].slice(0, 50),
              metodoAtual: null
            });
          }
        }
      },

      limparHistorico: () => set({ historico: [] }),

      formatarVersao: (versao) => {
        if (!versao) return 'v?.?.?.?';
          return `v${versao.major}.${versao.minor}.${versao.patch}.${versao.build}`;
      }
    }),
    {
      name: 'api-doc-storage'
    }
  )
);
