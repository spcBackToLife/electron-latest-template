import { BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { EVENT_NAME } from '@shared/constant';

interface WindowOptions {
	width?: number;
	height?: number;
	title?: string;
	url?: string;
	preload?: string;
	webPreferences?: Electron.WebPreferences;
	[key: string]: any;
}

interface MessagePayload {
	type: string;
	data: any;
}

interface RequestMessage {
	requestId: string;
	type: string;
	data: any;
}

interface ResponseMessage {
	requestId: string;
	success: boolean;
	data?: any;
	error?: string;
}

type MessageCallback = (response: ResponseMessage) => void;

export class WindowManager {
	private windows: Map<string, BrowserWindow> = new Map();
	private pendingRequests: Map<
		string,
		{
			resolve: (value: any) => void;
			reject: (reason: any) => void;
			timeout: NodeJS.Timeout;
		}
	> = new Map();

	constructor() {
		// 监听渲染进程的响应消息
		ipcMain.on(
			EVENT_NAME.WindowMessageResponse,
			(_, response: ResponseMessage) => {
				this.handleMessageResponse(response);
			}
		);
	}

	/**
	 * 创建一个新窗口
	 * @param id 窗口ID
	 * @param options 窗口选项
	 * @returns 创建的窗口实例
	 */
	createWindow(id: string, options: WindowOptions): BrowserWindow {
		if (this.windows.has(id)) {
			const existingWindow = this.windows.get(id);
			if (existingWindow && !existingWindow.isDestroyed()) {
				existingWindow.focus();
				return existingWindow;
			}
		}

		const defaultPreload = join(__dirname, '../../preload/index.js');

		const windowOptions = {
			width: options.width || 800,
			height: options.height || 600,
			title: options.title || 'New Window',
			show: false,
			webPreferences: {
				preload: options.preload || defaultPreload,
				nodeIntegration: false,
				contextIsolation: true,
				...options.webPreferences,
			},
			...options,
		};

		const window = new BrowserWindow(windowOptions);

		// 加载URL或HTML文件
		if (options.url) {
			window.loadURL(options.url);
		} else {
			const indexHtml = join(process.env.DIST || '', 'index.html');
			window.loadFile(indexHtml);
		}

		// 窗口准备好后显示并发送窗口ID
		window.once('ready-to-show', () => {
			window.show();
			// 发送窗口ID给渲染进程
			window.webContents.send(EVENT_NAME.WindowId, { windowId: id });
		});

		// 窗口关闭时从管理器中移除
		window.on('closed', () => {
			this.windows.delete(id);
		});

		this.windows.set(id, window);
		return window;
	}

	/**
	 * 获取窗口实例
	 * @param id 窗口ID
	 * @returns 窗口实例或undefined
	 */
	getWindow(id: string): BrowserWindow | undefined {
		return this.windows.get(id);
	}

	/**
	 * 向指定窗口发送消息
	 * @param windowId 窗口ID
	 * @param message 消息内容
	 * @returns 是否发送成功
	 */
	sendMessage(windowId: string, message: MessagePayload): boolean {
		const window = this.getWindow(windowId);
		if (!window || window.isDestroyed()) {
			return false;
		}

		window.webContents.send(EVENT_NAME.WindowMessage, message);
		return true;
	}

	/**
	 * 向指定窗口发送消息并等待响应
	 * @param windowId 窗口ID
	 * @param type 消息类型
	 * @param data 消息数据
	 * @param timeoutMinutes 超时时间（分钟）
	 * @returns Promise，解析为响应数据
	 */
	async sendMessageAndWaitForResponse(
		windowId: string,
		type: string,
		data: any,
		timeoutMinutes: number = 30
	): Promise<any> {
		const window = this.getWindow(windowId);
		if (!window || window.isDestroyed()) {
			throw new Error(`Window with id ${windowId} not found or destroyed`);
		}

		const requestId = randomUUID();
		const requestMessage: RequestMessage = {
			requestId,
			type,
			data,
		};

		return new Promise((resolve, reject) => {
			// 设置超时
			const timeout = setTimeout(() => {
				if (this.pendingRequests.has(requestId)) {
					this.pendingRequests.delete(requestId);
					reject(
						new Error(`Request timed out after ${timeoutMinutes} minutes`)
					);
				}
			}, timeoutMinutes * 60 * 1000);

			// 存储请求信息
			this.pendingRequests.set(requestId, { resolve, reject, timeout });

			// 发送消息到渲染进程
			window.webContents.send(EVENT_NAME.WindowMessageRequest, requestMessage);
		});
	}

	/**
	 * 处理来自渲染进程的响应消息
	 * @param response 响应消息
	 */
	private handleMessageResponse(response: ResponseMessage): void {
		const { requestId, success, data, error } = response;

		const pendingRequest = this.pendingRequests.get(requestId);
		if (!pendingRequest) {
			return;
		}

		const { resolve, reject, timeout } = pendingRequest;

		// 清除超时定时器
		clearTimeout(timeout);

		// 从待处理请求中移除
		this.pendingRequests.delete(requestId);

		// 根据响应结果解析或拒绝Promise
		if (success) {
			resolve(data);
		} else {
			reject(new Error(error || 'Unknown error'));
		}
	}

	/**
	 * 关闭指定窗口
	 * @param id 窗口ID
	 * @returns 是否成功关闭
	 */
	closeWindow(id: string): boolean {
		const window = this.getWindow(id);
		if (!window || window.isDestroyed()) {
			return false;
		}

		window.close();
		return true;
	}

	/**
	 * 关闭所有窗口
	 */
	closeAllWindows(): void {
		for (const [id, window] of this.windows.entries()) {
			if (!window.isDestroyed()) {
				window.close();
			}
		}
		this.windows.clear();
	}
}

// 创建单例
export const winManager = new WindowManager();
