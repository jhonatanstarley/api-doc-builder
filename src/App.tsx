import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HeaderSection } from './components/HeaderSection';
import { MethodSection } from './components/MethodSection';
import { useDocStore } from './store/useDocStore';
import { exportToPDF, exportToMarkdown } from './utils/pdfExporter';
import { FileDown, FileText } from 'lucide-react';

function App() {
  const { documento, metodoAtual, darkMode } = useDocStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleExportPDF = () => {
    if (documento) {
      exportToPDF(documento);
    }
  };

  const handleExportMarkdown = () => {
    if (documento) {
      const md = exportToMarkdown(documento);
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documento.nomeRecurso}Rsrc_v1_0_0.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white'}`}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-gray-800">
          <h1 className="text-xl font-bold">
            {metodoAtual ? 'Editar Método' : 'Cabeçalho do Documento'}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Exportar Markdown"
            >
              <FileText className="w-4 h-4" />
              MD
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Exportar PDF"
            >
              <FileDown className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
            {metodoAtual ? <MethodSection /> : <HeaderSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
