const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const CacheService = require('./cacheService');
const HistoryService = require('./historyService');
const {
  MAX_ANALYSIS_OUTPUT_ATTEMPTS,
  computeAdaptiveAnalysisMaxTokens,
  expandAnalysisTokenBudget,
  reduceAnalysisTokenBudget,
  isOutputBudgetError
} = require('./apiRequestPolicy');

let mainWindow;
let cacheService;
let historyService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'Markdown Intelligence Auditor',
    backgroundColor: '#111827',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

function getConfigPath() {
  return path.join(
    app.getPath('appData'),
    'MarkdownAuditor',
    'config.json'
  );
}

function getCachePath() {
  return path.join(
    app.getPath('appData'),
    'MarkdownAuditor',
    'analysis_cache.json'
  );
}

function getHistoryDir() {
  return path.join(
    app.getPath('appData'),
    'MarkdownAuditor',
    'history'
  );
}

// CONFIG READ
ipcMain.handle('config:read', async () => {
  try {
    const data = fs.readFileSync(getConfigPath(), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
});

// CONFIG WRITE
ipcMain.handle('config:write', async (event, data) => {
  const dir = path.join(app.getPath('appData'), 'MarkdownAuditor');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getConfigPath(), JSON.stringify(data, null, 2), 'utf-8');
  return { success: true };
});

// CACHE READ
ipcMain.handle('cache:read', async () => {
  return cacheService.read();
});

// CACHE WRITE
ipcMain.handle('cache:write', async (event, data) => {
  return cacheService.write(data);
});

// CACHE CLEAR
ipcMain.handle('cache:clear', async () => {
  return cacheService.clear();
});

// CACHE STATS
ipcMain.handle('cache:stats', async () => {
  return cacheService.getStats();
});

// HISTORY LIST
ipcMain.handle('history:list', async () => {
  return historyService.list();
});

// HISTORY READ
ipcMain.handle('history:read', async (event, id) => {
  return historyService.readSession(id);
});

// HISTORY ADD
ipcMain.handle('history:add', async (event, { metadata, session }) => {
  return historyService.add(metadata, session);
});

// HISTORY DELETE
ipcMain.handle('history:delete', async (event, id) => {
  return historyService.delete(id);
});

// HISTORY CLEAR
ipcMain.handle('history:clear', async () => {
  return historyService.clear();
});

// HISTORY UPDATE
ipcMain.handle('history:update', async (event, { id, updates }) => {
  return historyService.update(id, updates);
});

// HISTORY PRUNE
ipcMain.handle('history:prune', async (event, maxEntries) => {
  return historyService.prune(maxEntries);
});

// AI VALIDATION (lightweight test call)
ipcMain.handle('api:validate', async (event, { baseURL, apiKey, model }) => {
  try {
    const client = new OpenAI({
      apiKey: apiKey || 'no-key-needed',
      baseURL: baseURL
    });

    const response = await client.chat.completions.create({
      model: model,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Reply with the single word: OK' }]
    });

    const text = response.choices[0]?.message?.content || '';
    return { success: true, message: `Connected · responded: "${text.trim()}"` };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// AI ANALYSIS CALL (full audit)
ipcMain.handle('api:call', async (event, { baseURL, apiKey, model, systemPrompt, userMessage, timeout, retries }) => {
  try {
    const client = new OpenAI({
      apiKey: apiKey || 'no-key-needed',
      baseURL: baseURL,
      timeout: (timeout || 60) * 1000,
      maxRetries: retries || 2
    });

    let outputTokenBudget = computeAdaptiveAnalysisMaxTokens({ systemPrompt, userMessage });
    const seenBudgets = new Set();
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_ANALYSIS_OUTPUT_ATTEMPTS; attempt += 1) {
      seenBudgets.add(outputTokenBudget);

      try {
        const response = await client.chat.completions.create({
          model: model,
          max_tokens: outputTokenBudget,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ]
        });

        const choice = response.choices[0] || {};
        const raw = choice.message?.content || '';
        const finishReason = choice.finish_reason || '';
        const expandedBudget = expandAnalysisTokenBudget(outputTokenBudget);

        if (
          finishReason === 'length' &&
          expandedBudget > outputTokenBudget &&
          !seenBudgets.has(expandedBudget)
        ) {
          outputTokenBudget = expandedBudget;
          continue;
        }

        return { success: true, raw, finishReason, outputTokenBudget };
      } catch (err) {
        lastError = err;
        if (isOutputBudgetError(err)) {
          const reducedBudget = reduceAnalysisTokenBudget(outputTokenBudget);
          if (reducedBudget < outputTokenBudget && !seenBudgets.has(reducedBudget)) {
            outputTokenBudget = reducedBudget;
            continue;
          }
        }
        break;
      }
    }

    return { success: false, error: lastError?.message || 'Analysis request failed' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

app.whenReady().then(() => {
  cacheService = new CacheService(getCachePath());
  historyService = new HistoryService(getHistoryDir());
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
