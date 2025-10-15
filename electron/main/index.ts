/* eslint-disable no-param-reassign */
import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron';
import { release } from 'node:os';
import path, { join } from 'node:path';
import { update } from './update';
import './sqlite3';
import './settings';
import './winManager';
import { winManager } from './winManager';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
	? join(process.env.DIST_ELECTRON, '../public')
	: process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');
console.log('111url:', url);

async function createWindow() {
	// 使用winManager创建主窗口
	win = winManager.createWindow('main', {
		title: 'Main window',
		icon: join(process.env.VITE_PUBLIC || '', 'favicon.ico'),
		width: 1200,
		height: 800,
		webPreferences: {
			preload,
			// Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
			// Consider using contextBridge.exposeInMainWorld
			// Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
			nodeIntegration: true,
			// webSecurity: true,
			// 注册 api
			contextIsolation: true,
		},
		url: url || undefined, // 如果有开发服务器URL，则使用它
	});

	if (url) {
		// Open devTool if the app is not packaged
		win.webContents.openDevTools();
	}

	// Test actively push message to the Electron-Renderer
	win.webContents.on('did-finish-load', () => {
		win?.webContents.send('main-process-message', new Date().toLocaleString());
	});

	protocol.registerFileProtocol('local-resource', (request, callback) => {
		const url = request.url.replace('local-resource://', '');
		// const decodedUrl = decodeURI(url);
		try {
			return callback(path.join(url));
		} catch (error) {
			console.error('ERROR:', error);
		}
	});

	// Make all links open with the browser, not with the application
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith('https:')) shell.openExternal(url);
		return { action: 'deny' };
	});

	// Apply electron-updater
	update(win);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	win = null;
	if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
	if (win) {
		// Focus on the main window if the user tried to open another
		if (win.isMinimized()) win.restore();
		win.focus();
	}
});

app.on('activate', () => {
	const allWindows = BrowserWindow.getAllWindows();
	if (allWindows.length) {
		allWindows[0].focus();
	} else {
		createWindow();
	}
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
	// 使用winManager创建子窗口
	const childWindow = winManager.createWindow(`child-${Date.now()}`, {
		webPreferences: {
			preload,
			nodeIntegration: true,
			contextIsolation: false,
		},
		url: process.env.VITE_DEV_SERVER_URL ? `${url}#${arg}` : undefined,
		hash: arg, // 如果不是开发模式，这个参数会被用于loadFile的hash参数
	});

	// 如果不是开发模式，则加载本地HTML文件
	if (!process.env.VITE_DEV_SERVER_URL) {
		childWindow.loadFile(indexHtml, { hash: arg });
	}

	return childWindow.id;
});
