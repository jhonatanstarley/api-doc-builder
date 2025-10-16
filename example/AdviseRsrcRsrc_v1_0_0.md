# AdviseRsrcRsrc

## Descrição

Authorization: Bearer Token

URL base: https://xpto.com.br

Todas as rotas exigem a presença de token de acesso no header "Authorization" no padrão Bearer (Authorization: Bearer <token>). Caso não seja informado, esteja expirado ou o usuário dono não possua a funcionalidade, a API retornará erro com status HTTP 401.

## Método cadastrarPesquisa

**Objetivo:**

Utilizado para cadastrar um CPF ou CNPJ para busca dos processos judiciais relacionados ao documento.

**Parâmetros de entrada**

| Nome | Formato | Obrigatório | Descrição |
|------|---------|-------------|------------|
| cdUniqueId | char(16) | S | Código único da requisição ou sessão |
| cdDocumento | char(14) | S | CPF ou CNPJ a ser pesquisado (com ou sem máscara) |
| qtLimiteRetorno | char(3) | N | Quantidade máxima de processos a retornar (padrão 150) |
| cdInstancia | char(1) | N | Identificador da instância: 1=1ª, 2=2ª, 3=3ª, 4=Todas (padrão 4) |
| inCadastrarProc | char(1) | N | Indica se os processos retornados devem ser automaticamente cadastrados para monitoramento. "S" ou "N" (padrão "N") |
| dtDistribuicao | char(10) | N | Data mínima de distribuição do processo (yyyy-mm-dd) |
| cdsuarioCli | char(16) | N | Identificador do usuário que está realizando a pesquisa |
| lisAbrangencias | evalLista | N | Lista de IDs de abrangências para filtrar os resultados da pesquisa |

**Validações**

| Nome | Descrição da Validação |
|------|------------------------|
| cdUniqueId | Se nulo ou vazio, retornar 2000 -- "O cdUniqueId do atendimento é obrigatório". Se cdUniqueId existir e tamanho > 16, 2001 -- "cdUniqueId não deve exceder 16 caracteres". Se cdUniqueId = 0, 2002 - "cdUniqueId não pode ser igual a 0". |
| cdDocumento | Se nulo ou vazio, retornar 2003 -- "Informe o CPF/CNPJ". Se cdDocumento existir e tamanho > 14, 2004 -- "CPF/CNPJ não deve exceder 14 caracteres". |
| qtLimiteRetorno | Se qtLimiteRetorno existir e tamanho > 3, 2005 -- "Limite de retorno não deve exceder 3 dígitos". Se qtLimiteRetorno > 150, 2006 -- "Limite máximo de 150 processos". |
| cdInstancia | Se cdInstancia existir e tamanho > 1, 2007 -- "Instância não deve exceder 1 caractere". Se cdInstancia != '1' e != '2' e != '3' e != '4', 2008 -- "Instância inválida. Valores aceitos: 1, 2, 3 ou 4". |
| inCadastrarProc | Se inCadastrarProc existir e tamanho > 1, 2009 -- "Indicativo de cadastramento não deve exceder 1 caractere". Se inCadastrarProc != 'S' e != 'N', 2010 -- "Indicativo de cadastramento deve ser 'S' ou 'N'". |
| dtDistribuicao | Se dtDistribuicao existir e tamanho > 10, 2011 -- "Data de distribuição não deve exceder 10 caracteres". |
| cdsuarioCli | Se cdsuarioCli existir e tamanho > 16, 2012 -- "ID do usuário não deve exceder 16 caracteres". Se cdsuarioCli = 0, 2013 -- "ID do usuário não pode ser igual a 0". |

**Parâmetros de saída**

| Nome | Tipo / Tamanho | Descrição |
|------|----------------|------------|
| cdPesquisa | char(128) | Identificador único da pesquisa criada |
| cdSituacao | char(4) | Código da situação da pesquisa |
| nmSituacao | char(64) | Descrição textual da situação |
| dtInclusao | char(20) | Data e hora de criação da pesquisa (yyyy-mm-ddThh:mm:ss) |
| cdRetorno | char(3) | Código de retorno HTTP |
| dsRetorno | char(128) | Mensagem de retorno |

**Descrição**

Descrição
Fazer validações dos parâmetros de entrada.
Montar os parâmetros de entrada no header com os seguintes campos:
Authorization
Valorar Authorization com "Bearer " concatenado com cdApiChave.
Montar os parâmetros no body com os seguintes campos em JSON:
documento
limiteRetorno
idInstancia
flCadastrarProcesso
dataDistribuicaoProcesso
idUsuarioCliente
abrangencias

Valorar documento com cdDocumento.
Se qtLimiteRetorno = vazio
    Valorar limiteRetorno com 150
senão
    Valorar limiteRetorno com qtLimiteRetorno
Fim-se

Se cdInstancia = vazio
    Valorar cdInstancia com 4
senão
    Valorar idInstancia com cdInstancia
Fim-se

Valorar flCadastrarProcesso com 'false' para inCadastrarProc = 'N' e com 'true' para inCadastrarProc = 'S'.

Se dtDistribuicao = vazio
    Não montar no body da requisição
senão
    Valorar dataDistribuicaoProcesso com dtDistribuicao
Fim-se

Se cdsuarioCli = vazio
    Não montar no body da requisição
senão
    Valorar idUsuarioCliente com cdsuarioCli
Fim-se

Se lisAbrangencias = vazio
    Não montar no body da requisição
senão
    Valorar abrangencias com lisAbrangencias
Fim-se

Chamar o endpoint de produção https://xpto.com.br/core/v1/descoberta-processos/cadastrar-pesquisa-pfpj
O protocolo é HTTP e método POST.

Receber o retorno que será JSON com os seguintes campos:
status
    codigo
    mensagem
itens
    idPesquisaProcessoPFPJ
    idSitPesquisaProcessoPFPJ
    nomeSitPesquisaProcessoPFPJ
    dataHoraInclusao

Valorar os campos de retorno da seguinte forma:
 - cdRetorno com status.codigo
 - dsRetorno com status.mensagem
 - cdPesquisa com itens.idPesquisaProcessoPFPJ
 - cdSituacao com itens.idSitPesquisaProcessoPFPJ
 - nmSituacao com itens.nomeSitPesquisaProcessoPFPJ
 - dtInclusao com itens.dataHoraInclusao

Exemplo dos parâmetros de entrada no header do Web Service:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Exemplo dos parâmetros no body da requisição do Web Service:
{
  "documento": "00000000000",
  "limiteRetorno": 5,
  "idInstancia": 4,
  "flCadastrarProcesso": false,
  "dataDistribuicaoProcesso": "2025-01-01"
}

Exemplo do retorno do Web Service:
{
  "status": {
    "codigo": 200,
    "mensagem": "Sucesso ao cadastrar pesquisa."
  },
  "itens": [
    {
      "idPesquisaProcessoPFPJ": 12345,
      "idSitPesquisaProcessoPFPJ": -1,
      "nomeSitPesquisaProcessoPFPJ": "Aguardando envio",
      "dataHoraInclusao": "2025-10-15T10:05:30"
    }
  ]
}

**Exemplo dos parâmetros no body da requisição do Web Service:**

```json
{
  "documento": "00000000000",
  "limiteRetorno": 5,
  "idInstancia": 4,
  "flCadastrarProcesso": false,
  "dataDistribuicaoProcesso": "2025-01-01"
}
```

**Exemplo dos parâmetros de entrada no header do Web Service:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

