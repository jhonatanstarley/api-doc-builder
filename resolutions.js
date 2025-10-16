// resolutions.js - API Doc Builder
// Starley Interface © 2025
// ARQUIVO OPCIONAL - Já integrado no main.js usando screen do Electron

const { exec } = require('child_process');
const os = require('os');

/**
 * Função para verificar a resolução da tela via comandos do sistema
 * NOTA: Esta versão é mais pesada e pode falhar em alguns sistemas
 * A versão usando screen.getPrimaryDisplay() do Electron é mais confiável
 */
function getScreenResolution() {
    return new Promise((resolve, reject) => {
        const platform = os.platform();
        let command = '';

        if (platform === 'win32') {
            // Comando PowerShell para obter a resolução da tela no Windows
            command = 'powershell "(Get-WmiObject -Class Win32_VideoController).VideoModeDescription"';
        } else if (platform === 'linux') {
            // Comando para obter a resolução da tela no Linux
            command = 'xrandr | grep -oP "\\d{3,}x\\d{3,}"';
        } else if (platform === 'darwin') {
            // Comando para obter a resolução da tela no macOS
            command = 'system_profiler SPDisplaysDataType | grep Resolution';
        } else {
            reject('Sistema operacional não suportado.');
            return;
        }

        // Executa o comando
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Erro ao executar o comando: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Erro do comando: ${stderr}`);
                return;
            }

            // Parseia o resultado para obter altura e largura
            const resolution = parseResolution(stdout);
            resolve(resolution);
        });
    });
}

/**
 * Função para parsear o resultado e extrair altura e largura
 */
function parseResolution(output) {
    const matches = output.match(/(\d+)\s*x\s*(\d+)/);
    if (matches && matches.length === 3) {
        return {
            width: parseInt(matches[1]),
            height: parseInt(matches[2])
        };
    } else {
        throw new Error('Formato de saída não reconhecido');
    }
}

// Teste (descomente para testar)
/*
getScreenResolution()
    .then(resolution => console.log('Resolução:', resolution))
    .catch(error => console.error('Erro:', error));
*/

module.exports = { getScreenResolution };