// utils/pdfExporter.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Documento } from '../types';

/**
 * Exporta um documento no formato PDF
 */
export const exportToPDF = (documento: Documento) => {
  const doc = new jsPDF();
  let y = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 2 * margin;

  // ====== Função auxiliar para adicionar texto ======
  const addText = (text: string, fontSize: number, isBold: boolean = false, indent: number = 0) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(fontSize);
    doc.setFont('times', isBold ? 'bold' : 'normal');

    const lines = doc.splitTextToSize(text, maxWidth - indent);
    lines.forEach((line: string) => {
      doc.text(line, margin + indent, y);
      y += 7;
    });
  };

  // ====== Função auxiliar para criar tabelas ======
  const addTable = (headers: string[], rows: any[][], fontSize: number = 10) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // ✅ Nova forma compatível com ESM: autoTable(doc, { ... })
    autoTable(doc, {
      startY: y,
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [217, 217, 217],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
      },
      margin: { left: margin, right: margin },
    });

    // Atualiza posição Y após tabela
    const lastTable = (doc as any).lastAutoTable;
    if (lastTable?.finalY) y = lastTable.finalY + 10;
  };

  // ====== Cabeçalho ======
  addText(`${documento.nomeRecurso}Rsrc`, 16, true);
  y += 2;
  addText(
    `Versão: v${documento.versao.major}.${documento.versao.minor}.${documento.versao.patch}.${documento.versao.build}`,
    10
  );
  y += 5;

  // ====== Descrição geral ======
  addText('Descrição:', 12, true);
  addText(documento.descricaoGeral.autenticacao, 11);
  addText(`URL base: ${documento.descricaoGeral.urlBase}`, 11);
  addText(documento.descricaoGeral.regras, 11);
  y += 10;

  // ====== Métodos ======
  documento.metodos.forEach((metodo) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    addText(`Método ${metodo.nome}`, 12, true);
    y += 3;

    addText('Objetivo:', 11, true);
    addText(metodo.objetivo, 11);
    y += 5;

    // ----- Parâmetros de Entrada -----
    if (metodo.parametrosEntrada.length > 0) {
      addText('Parâmetros de entrada', 11, true);
      y += 3;

      const headers = ['Nome', 'Formato', 'Obrigatório', 'Descrição'];
      const rows = metodo.parametrosEntrada.map((p) => [
        p.nome,
        p.formato,
        p.obrigatorio ? 'S' : 'N',
        p.descricao,
      ]);

      addTable(headers, rows);
    }

    // ----- Validações -----
    if (metodo.validacoes.length > 0) {
      addText('Validações', 11, true);
      y += 3;

      const headers = ['Nome', 'Descrição da Validação'];
      const rows = metodo.validacoes.map((v) => [v.nome, v.descricao]);
      addTable(headers, rows, 9);
    }

    // ----- Parâmetros de Saída -----
    if (metodo.parametrosSaida.length > 0) {
      addText('Parâmetros de saída', 11, true);
      y += 3;

      const headers = ['Nome', 'Tipo / Tamanho', 'Descrição'];
      const rows = metodo.parametrosSaida.map((p) => [p.nome, p.tipo, p.descricao]);
      addTable(headers, rows);
    }

    // ----- Descrição detalhada -----
    if (metodo.descricao.length > 0) {
      addText('Descrição', 11, true);
      metodo.descricao.forEach((bloco) => {
        const lines = bloco.conteudo.split('\n');
        lines.forEach((line) => {
          const spaces = line.match(/^\s*/)?.[0].length || 0;
          const indent = Math.floor(spaces / 4) * 10;
          addText(line.trim(), 10, false, indent);
        });
      });
      y += 5;
    }

    // ----- Exemplos -----
    if (metodo.exemplos.length > 0) {
      metodo.exemplos.forEach((exemplo) => {
        if (exemplo.descricao) addText(exemplo.descricao, 11, true);

        let conteudo = exemplo.conteudo;
        if (
          (exemplo.tipo === 'body' || exemplo.tipo === 'retorno') &&
          conteudo.trim().startsWith('{')
        ) {
          try {
            const parsed = JSON.parse(conteudo);
            conteudo = JSON.stringify(parsed, null, 2);
          } catch {
            // Ignora erro de parse
          }
        }

        addText(conteudo, 9, false, 5);
        y += 5;
      });
    }

    y += 10;
  });

  // ====== Salva PDF ======
  doc.save(`${documento.nomeRecurso}Rsrc_v1_0_0.pdf`);
};

/**
 * Exporta o documento em formato Markdown (.md)
 */
export const exportToMarkdown = (documento: Documento): string => {
  let md = `# ${documento.nomeRecurso}Rsrc\n\n`;
  md += `## Descrição\n\n`;
  md += `${documento.descricaoGeral.autenticacao}\n\n`;
  md += `URL base: ${documento.descricaoGeral.urlBase}\n\n`;
  md += `${documento.descricaoGeral.regras}\n\n`;

  documento.metodos.forEach((metodo) => {
    md += `## Método ${metodo.nome}\n\n`;
    md += `**Objetivo:**\n\n${metodo.objetivo}\n\n`;

    if (metodo.parametrosEntrada.length > 0) {
      md += `**Parâmetros de entrada**\n\n`;
      md += `| Nome | Formato | Obrigatório | Descrição |\n`;
      md += `|------|---------|-------------|------------|\n`;
      metodo.parametrosEntrada.forEach((param) => {
        md += `| ${param.nome} | ${param.formato} | ${param.obrigatorio ? 'S' : 'N'} | ${param.descricao} |\n`;
      });
      md += `\n`;
    }

    if (metodo.validacoes.length > 0) {
      md += `**Validações**\n\n`;
      md += `| Nome | Descrição da Validação |\n`;
      md += `|------|------------------------|\n`;
      metodo.validacoes.forEach((val) => {
        md += `| ${val.nome} | ${val.descricao.replace(/\n/g, ' ')} |\n`;
      });
      md += `\n`;
    }

    if (metodo.parametrosSaida.length > 0) {
      md += `**Parâmetros de saída**\n\n`;
      md += `| Nome | Tipo / Tamanho | Descrição |\n`;
      md += `|------|----------------|------------|\n`;
      metodo.parametrosSaida.forEach((param) => {
        md += `| ${param.nome} | ${param.tipo} | ${param.descricao} |\n`;
      });
      md += `\n`;
    }

    if (metodo.descricao.length > 0) {
      md += `**Descrição**\n\n`;
      metodo.descricao.forEach((bloco) => {
        md += `${bloco.conteudo}\n\n`;
      });
    }

    if (metodo.exemplos.length > 0) {
      metodo.exemplos.forEach((exemplo) => {
        if (exemplo.descricao) md += `**${exemplo.descricao}**\n\n`;

        if (exemplo.tipo === 'body' || exemplo.tipo === 'retorno') {
          md += `\`\`\`json\n${exemplo.conteudo}\n\`\`\`\n\n`;
        } else {
          md += `\`\`\`\n${exemplo.conteudo}\n\`\`\`\n\n`;
        }
      });
    }
  });

  return md;
};
