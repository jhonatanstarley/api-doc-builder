export interface Documento {
  id: string;
  nomeRecurso: string;
  versao: Versao;
  descricaoGeral: {
    autenticacao: string;
    urlBase: string;
    regras: string;
  };
  metodos: Metodo[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface Versao {
  major: number;
  minor: number;
  patch: number;
  build: number;
  descricao?: string;
}

export interface HistoricoVersao {
  id: string;
  versao: Versao;
  documento: Documento;
  timestamp: string;
  autor?: string;
  descricao: string;
}

export interface Metodo {
  id: string;
  nome: string;
  objetivo: string;
  tipoHttp: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parametrosEntrada: ParametroEntrada[];
  validacoes: Validacao[];
  parametrosSaida: ParametroSaida[];
  descricao: BlocoDescricao[];
  tabelasAuxiliares: TabelaAuxiliar[];
  exemplos: Exemplo[];
}

export interface ParametroEntrada {
  id: string;
  nome: string;
  formato: string;
  obrigatorio: boolean;
  descricao: string;
}

export interface Validacao {
  id: string;
  nome: string;
  descricao: string;
}

export interface ParametroSaida {
  id: string;
  nome: string;
  tipo: string;
  descricao: string;
}

export interface BlocoDescricao {
  id: string;
  tipo:
    | 'header'
    | 'body'
    | 'query'
    | 'mapeamento'
    | 'endpoint'
    | 'retorno'
    | 'mapeamentoRetorno';
  conteudo: string;
}

export interface TabelaAuxiliar {
  id: string;
  titulo: string;
  valores: { codigo: string; nome: string; descricao: string }[];
}

export interface Exemplo {
  id: string;
  tipo: 'header' | 'body' | 'query' | 'retorno';
  descricao?: string;
  conteudo: string;
}
