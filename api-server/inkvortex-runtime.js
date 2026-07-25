'use strict';

const http = require('http');
const fs = require('fs');
const { execFileSync, spawn } = require('child_process');
const path = require('path');

function arg(name, fallback = '') {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const action = process.argv[2] || '';
const port = Number(arg('port', '8787'));
const expectedVersion = String(arg('version', '7.7'));
const timeoutMs = Math.max(5000, Number(arg('timeout', '35000')));
const serverDir = __dirname;
const serverFile = path.join(serverDir, 'server.js');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStatus(timeout = 1800) {
  return new Promise(resolve => {
    const stamp = Date.now();
    const request = http.get({
      hostname: '127.0.0.1',
      port,
      path: `/api/status?runtime=${stamp}`,
      timeout,
      headers: {
        'Cache-Control': 'no-cache, no-store',
        Pragma: 'no-cache'
      }
    }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve(null); }
      });
    });
    request.on('timeout', () => request.destroy());
    request.on('error', () => resolve(null));
  });
}

function windowsListenerPids() {
  const pids = new Set();
  try {
    const output = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], {
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    const pattern = new RegExp(`^\s*TCP\s+[^\s]*:${port}\s+[^\s]+\s+LISTENING\s+(\d+)\s*$`, 'i');
    for (const line of output.split(/\r?\n/)) {
      const match = line.match(pattern);
      if (match) pids.add(Number(match[1]));
    }
  } catch {}
  if (!pids.size) {
    try {
      const command = `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`;
      const output = execFileSync('powershell.exe', ['-NoProfile', '-Command', command], {
        encoding: 'utf8',
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'ignore']
      });
      for (const line of output.split(/\r?\n/)) {
        const pid = Number(line.trim());
        if (Number.isInteger(pid) && pid > 0) pids.add(pid);
      }
    } catch {}
  }
  return [...pids].filter(pid => Number.isInteger(pid) && pid > 0 && pid !== process.pid);
}

function listenerPids() {
  if (process.platform === 'win32') return windowsListenerPids();
  try {
    const portHex = port.toString(16).toUpperCase().padStart(4, '0');
    const inodes = new Set();
    for (const table of ['/proc/net/tcp', '/proc/net/tcp6']) {
      if (!fs.existsSync(table)) continue;
      const lines = fs.readFileSync(table, 'utf8').trim().split(/\r?\n/).slice(1);
      for (const line of lines) {
        const columns = line.trim().split(/\s+/);
        const local = columns[1] || '';
        const state = columns[3] || '';
        const inode = columns[9] || '';
        const localPort = local.split(':')[1] || '';
        if (state === '0A' && localPort.toUpperCase() === portHex && inode) inodes.add(inode);
      }
    }
    if (!inodes.size) return [];
    const pids = new Set();
    for (const entry of fs.readdirSync('/proc')) {
      if (!/^\d+$/.test(entry) || Number(entry) === process.pid) continue;
      const fdDir = `/proc/${entry}/fd`;
      let fds = [];
      try { fds = fs.readdirSync(fdDir); } catch { continue; }
      for (const fd of fds) {
        let target = '';
        try { target = fs.readlinkSync(`${fdDir}/${fd}`); } catch { continue; }
        const match = target.match(/^socket:\[(\d+)\]$/);
        if (match && inodes.has(match[1])) { pids.add(Number(entry)); break; }
      }
    }
    return [...pids];
  } catch {
    return [];
  }
}

function windowsParentPid(pid) {
  try {
    const command = `(Get-CimInstance Win32_Process -Filter \"ProcessId=${pid}\").ParentProcessId`;
    const output = execFileSync('powershell.exe', ['-NoProfile', '-Command', command], {
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    const value = Number(output.split(/\r?\n/).pop());
    return Number.isInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function windowsProcessLooksLikeLauncher(pid) {
  try {
    const command = `(Get-CimInstance Win32_Process -Filter \"ProcessId=${pid}\").CommandLine`;
    const output = execFileSync('powershell.exe', ['-NoProfile', '-Command', command], {
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    return /(iniciar-central|inkvortex|server\.js)/i.test(output);
  } catch {
    return false;
  }
}

function killPidTree(pid) {
  if (process.platform === 'win32') {
    let target = pid;
    const parent = windowsParentPid(pid);
    if (parent && windowsProcessLooksLikeLauncher(parent)) target = parent;
    try {
      execFileSync('taskkill.exe', ['/PID', String(target), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore'
      });
      return true;
    } catch {
      try {
        execFileSync('taskkill.exe', ['/PID', String(pid), '/F'], {
          windowsHide: true,
          stdio: 'ignore'
        });
        return true;
      } catch {
        return false;
      }
    }
  }
  try { process.kill(pid, 'SIGTERM'); return true; }
  catch { return false; }
}

async function stopOld() {
  const status = await getStatus();
  const pids = new Set(listenerPids());
  const reportedPid = Number(status && status.processId);
  if (Number.isInteger(reportedPid) && reportedPid > 0 && reportedPid !== process.pid) pids.add(reportedPid);

  if (!status && !pids.size) {
    console.log(`Porta ${port} livre.`);
    return;
  }
  if (!status || !status.studioVersion) {
    throw new Error(`A porta ${port} esta ocupada por outro programa, nao identificado como InkVortex.`);
  }
  if (!pids.size) {
    throw new Error(`InkVortex ${status.studioVersion} respondeu na porta ${port}, mas o processo local nao pôde ser identificado com segurança.`);
  }

  console.log(`InkVortex ${status.studioVersion} encontrado na porta ${port}. Encerrando para carregar ${expectedVersion}...`);
  let killed = false;
  for (const pid of pids) killed = killPidTree(pid) || killed;
  if (!killed) throw new Error(`A instancia InkVortex ${status.studioVersion} foi identificada, mas nao pôde ser encerrada.`);

  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    await sleep(250);
    const liveStatus = await getStatus(500);
    if (!liveStatus && !listenerPids().length) {
      console.log(`Porta ${port} liberada.`);
      return;
    }
  }
  throw new Error(`A instancia antiga nao liberou a porta ${port}. Feche a janela antiga da Central e tente novamente.`);
}

async function waitReady() {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = null;
  while (Date.now() < deadline) {
    lastStatus = await getStatus();
    if (lastStatus && String(lastStatus.studioVersion) === expectedVersion && lastStatus.ok === true && lastStatus.hasKey === true) {
      console.log(`InkVortex ${expectedVersion} pronto. API: ${lastStatus.provider}. Chaves: ${lastStatus.keyCount}.`);
      return lastStatus;
    }
    await sleep(500);
  }
  if (lastStatus && lastStatus.studioVersion) {
    throw new Error(`A porta respondeu com InkVortex ${lastStatus.studioVersion}, mas era esperada a versao ${expectedVersion}.`);
  }
  throw new Error(`A API InkVortex ${expectedVersion} nao ficou pronta em ${Math.round(timeoutMs / 1000)} segundos.`);
}

function startServerDetached() {
  const logPath = path.join(serverDir, 'inkvortex-runtime.log');
  const logFd = fs.openSync(logPath, 'a');
  fs.writeSync(logFd, `\n[${new Date().toISOString()}] Iniciando InkVortex ${expectedVersion} na porta ${port}\n`);
  const child = spawn(process.execPath, [serverFile], {
    cwd: serverDir,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    windowsHide: true
  });
  child.unref();
  return { child, logPath };
}

function openBrowser() {
  const url = `http://localhost:${port}/central-inkvortex-operacional.html?v=${encodeURIComponent(expectedVersion)}&fresh=${Date.now()}`;
  if (process.platform === 'win32') {
    spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  } else if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
  } else {
    spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
  }
}

async function main() {
  if (action === 'stop-old') {
    await stopOld();
    return;
  }
  if (action === 'launch') {
    const runtime = startServerDetached();
    try {
      await waitReady();
    } catch (error) {
      killPidTree(runtime.child.pid);
      throw new Error(`${error.message} Consulte ${runtime.logPath}.`);
    }
    openBrowser();
    console.log(`Central InkVortex ${expectedVersion} aberta com a instancia correta.`);
    console.log(`Log local: ${runtime.logPath}`);
    return;
  }
  if (action === 'wait-ready') {
    await waitReady();
    return;
  }
  throw new Error('Acao invalida. Use stop-old, launch ou wait-ready.');
}

main().catch(error => {
  console.error(`ERRO: ${error.message || error}`);
  process.exitCode = 1;
});
