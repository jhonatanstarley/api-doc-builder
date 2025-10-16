# 📄 API Doc Builder - Gerador de Documentação Padrão

Aplicação web completa em **React + TypeScript** para criar, editar e exportar **documentações técnicas padronizadas** de APIs no modelo `[NomeRecurso]Rsrc`.

## 🚀 Funcionalidades

### ✨ Principais Recursos

- **📝 Editor Visual Completo**
  - Cabeçalho do documento (Nome, URL Base, Autenticação, Regras)
  - Gerenciamento de múltiplos métodos (GET, POST, PUT, DELETE)
  - Tabelas de Parâmetros de Entrada com validações automáticas
  - Tabelas de Parâmetros de Saída
  - Sistema de Validações personalizadas
  - Editor de Descrição com fluxo de mapeamento
  - Exemplos de Header, Body, Query Params e Retornos

- **💾 Persistência Automática**
  - Salvamento automático em LocalStorage
  - Recuperação de rascunhos ao reabrir
  - Estado preservado entre sessões

- **📤 Exportação Múltipla**
  - **PDF** com formatação Times New Roman 11pt
  - **Markdown** compatível com GitHub/GitLab
  - Layout padronizado conforme especificação

- **🎨 Interface Moderna**
  - Modo claro/escuro persistente
  - 3 painéis: Sidebar + Editor + Preview
  - Animações suaves
  - Responsivo e intuitivo

- **⚡ Performance**
  - Armazenamento otimizado com Zustand
  - Componentes React otimizados
  - Build rápido com Vite

## 📦 Tecnologias Utilizadas

| Categoria     | Tecnologia                    |
|---------------|-------------------------------|
| Framework     | React 18 + TypeScript         |
| Build         | Vite 5                        |
| Estilo        | TailwindCSS 3                 |
| Estado        | Zustand + Persist             |
| Armazenamento | LocalForage                   |
| Exportação    | jsPDF + html2canvas           |
| Ícones        | Lucide React                  |
| Animações     | Framer Motion                 |

## 🛠️ Instalação e Uso

### Pré-requisitos

- Node.js 18+ e npm/yarn/pnpm

### Passos

1. **Instalar dependências:**

\`\`\`bash
npm install
# ou
yarn install
# ou
pnpm install
\`\`\`

2. **Rodar em desenvolvimento:**

\`\`\`bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
\`\`\`

3. **Abrir no navegador:**

Acesse: `http://localhost:3000`

4. **Build para produção:**

\`\`\`bash
npm run build
# ou
yarn build
# ou
pnpm build
\`\`\`

## 📖 Como Usar

### 1. **Criar Documento**

1. Preencha o **Nome do Recurso** (ex: "Advise", "Pirelli")
2. Configure **URL Base** e **Regras Gerais**
3. Clique em **"+ Novo Método"** na sidebar

### 2. **Adicionar Métodos**

1. Defina **Nome** (ex: "cadastrarPesquisa")
2. Escolha o **Tipo HTTP** (GET, POST, PUT, DELETE)
3. Escreva o **Objetivo** do método

### 3. **Preencher Detalhes**

Use as **5 abas** para completar:

- **Parâmetros Entrada**: Nome, Formato, Obrigatório, Descrição
- **Parâmetros Saída**: Nome, Tipo, Descrição
- **Validações**: Nome do campo + regras de validação
- **Descrição**: Fluxo detalhado de mapeamento
- **Exemplos**: Header, Body, Query Params, Retornos

### 4. **Exportar**

- Clique em **"📄 Exportar PDF"** para baixar em PDF
- Clique em **"📝 MD"** para exportar em Markdown
- Use **"💾 Salvar Rascunho"** para persistir localmente

## 📂 Estrutura do Projeto

\`\`\`
api-doc-builder/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx           # Sidebar com lista de métodos
│   │   ├── HeaderSection.tsx     # Editor do cabeçalho
│   │   └── MethodSection.tsx     # Editor de métodos (tabs)
│   ├── store/
│   │   └── useDocStore.ts        # Zustand store com persist
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── utils/
│   │   └── pdfExporter.ts        # Funções de exportação
│   ├── App.tsx                   # App principal
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind + estilos globais
├── index.html                    # HTML root
├── package.json                  # Dependências
├── vite.config.ts                # Config Vite
├── tsconfig.json                 # Config TypeScript
├── tailwind.config.js            # Config Tailwind
└── README.md                     # Este arquivo
\`\`\`

## 🎯 Padrão de Nomenclatura

### Prefixos de Variáveis

\`\`\`
cd  = Código         (cdUniqueId, cdDocumento)
id  = Identificador  (idInstancia, idPesquisa)
nm  = Nome           (nmSituacao, nmSujeito)
qt  = Quantidade     (qtLimiteRetorno)
vl  = Valor          (vlCausa)
dt  = Data           (dtInclusao, dtDistribuicao)
tp  = Tipo           (tpSujeito)
in  = Indicador      (inCadastrarProc) - para booleanos
ds  = Descrição      (dsRetorno)
lis = Lista          (lisAbrangencias)
\`\`\`

### Tipos de Dados

\`\`\`
char(n)    = String com tamanho máximo n
int        = Número inteiro
long       = Número inteiro longo
bool       = Booleano (usar char(1) com S/N)
evalLista  = Lista/Array
DateTime   = Data e hora
\`\`\`

## 🔧 Customização

### Alterar Cores do Tema

Edite `tailwind.config.js`:

\`\`\`javascript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981'
    }
  }
}
\`\`\`

### Adicionar Novos Tipos de Blocos

Edite `src/types/index.ts` e adicione novos tipos em `BlocoDescricao['tipo']`.

## 🐛 Troubleshooting

**Problema:** Não salva automaticamente

**Solução:** Verifique permissões de LocalStorage no navegador

**Problema:** Exportação PDF não funciona

**Solução:** Instale `jspdf` e `html2canvas`:
\`\`\`bash
npm install jspdf html2canvas
\`\`\`

## 📝 Licença

MIT License - Livre para uso pessoal e comercial.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📧 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ usando React + TypeScript + Tailwind**
