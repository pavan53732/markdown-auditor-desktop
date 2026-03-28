const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

let mainWindow;

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
ipcMain.handle('api:call', async (event, { baseURL, apiKey, model, systemPrompt, userMessage }) => {
  try {
    const client = new OpenAI({
      apiKey: apiKey || 'no-key-needed',
      baseURL: baseURL
    });

    const response = await client.chat.completions.create({
      model: model,
      max_tokens: 8000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    const raw = response.choices[0]?.message?.content || '';
    return { success: true, raw };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});