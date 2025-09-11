import { contextBridge, ipcRenderer, nativeImage } from 'electron';
import { removeLoadingApi } from './loading';
import { ELECTRON_BRIDGE_NAME, EVENT_NAME } from '@shared/constant';
import { AppSettings } from '@shared/interface';
import { OpenDialogOptions } from 'electron/renderer';

// 定义请求消息接口
interface RequestMessage {
	requestId: string;
	type: string;
	data: any;
}

// 定义响应消息接口
interface ResponseMessage {
	requestId: string;
	success: boolean;
	data?: any;
	error?: string;
}

// 存储当前窗口ID
let currentWindowId: string | null = sessionStorage.getItem('windowId') || null;

// 监听窗口ID消息
ipcRenderer.on(EVENT_NAME.WindowId, (_, data) => {
	currentWindowId = data.windowId;
	sessionStorage.setItem('windowId', currentWindowId); // 存入 sessionStorage
	console.log('[window ID] Received window ID:', currentWindowId);
});

// 存储消息处理器-双向消息，需要等待返回的
const promiseMessageHandlers: Map<
	string,
	{
		when: (data: any) => boolean;
		handler: (data: any) => Promise<any>;
	}
> = new Map();

// 单向消息，主进程给渲染进程发，渲染进程监听
const messageHandlers: Map<string, (data: any) => void> = new Map();

ipcRenderer.on(EVENT_NAME.WindowMessage, (_, message: RequestMessage) => {
	const { type, data } = message;

	const handler = messageHandlers.get(type);
	if (handler) {
		handler(data);
	}
});

// 监听来自主进程的消息请求
ipcRenderer.on(
	EVENT_NAME.WindowMessageRequest,
	async (_, message: RequestMessage) => {
		const { requestId, type, data } = message;

		try {
			// 查找对应类型的消息处理器
			const handler = promiseMessageHandlers.get(type);
			console.log('messageHandlers1111', type, handler);
			if (!handler) {
				// 如果没有找到处理器，返回错误
				ipcRenderer.send(EVENT_NAME.WindowMessageResponse, {
					requestId,
					success: false,
					error: `No handler registered for message type: ${type}`,
				});
				return;
			}
			if (handler && handler.when && !handler.when(data)) {
				console.log('【工具确认】 不匹配：', data);
				return;
			}

			console.log('【工具确认】 匹配：', data, handler.handler);
			// 调用处理器处理消息
			const result = await handler.handler(data);

			// 发送成功响应
			ipcRenderer.send(EVENT_NAME.WindowMessageResponse, {
				requestId,
				success: true,
				data: result,
			});
		} catch (error) {
			// 发送错误响应
			ipcRenderer.send(EVENT_NAME.WindowMessageResponse, {
				requestId,
				success: false,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}
);

contextBridge.exposeInMainWorld(ELECTRON_BRIDGE_NAME, {
	getLocalImg: (path: string) => {
		console.log('what happend:', nativeImage.createFromPath(path).toDataURL());
		return nativeImage.createFromPath(path).toDataURL();
	},
	removeLoading: removeLoadingApi,
	uploadFiles: (params: {
		id: number;
		fileContent: string;
		fileName: string;
	}) => ipcRenderer.invoke(EVENT_NAME.UploadFiles, params),
	getSettings: (key: keyof AppSettings) =>
		ipcRenderer.invoke(EVENT_NAME.GetSettings, key),
	getAllSettings: () => ipcRenderer.invoke(EVENT_NAME.GetAllSettings),
	updateSettings: (params: { key: keyof AppSettings; value: any }) =>
		ipcRenderer.invoke(EVENT_NAME.UpdateSettings, params),
	deleteSettings: (key: keyof AppSettings) =>
		ipcRenderer.invoke(EVENT_NAME.DeleteSettings, key),
	chooseFile: (options: OpenDialogOptions) =>
		ipcRenderer.invoke(EVENT_NAME.ChooseFile, options),

	getCurrentWindowId: () => currentWindowId,
	registerMessageHandler: (type: string, handler: (data: any) => void) => {
		messageHandlers.set(type, handler);
	},

	registerPromiseMessageHandler: (
		type: string,
		handler: (data: any) => Promise<any>,
		options?: { when?: (data: any) => boolean }
	) => {
		promiseMessageHandlers.set(type, {
			handler,
			when: options?.when || (() => true),
		});
	},
	unregisterMessageHandler: (type: string) => {
		promiseMessageHandlers.delete(type);
		messageHandlers.delete(type);
	},
	sendMessageResponse: (response: ResponseMessage) => {
		ipcRenderer.send(EVENT_NAME.WindowMessageResponse, response);
	},
	// 普通消息监听
	onWindowMessage: (callback: (type: string, data: any) => void) => {
		const listener = (_: any, message: { type: string; data: any }) => {
			callback(message.type, message.data);
		};
		ipcRenderer.on(EVENT_NAME.WindowMessage, listener);
		return () => {
			ipcRenderer.removeListener(EVENT_NAME.WindowMessage, listener);
		};
	},
});
