import { wrapResponse } from './wrapperResp';
import { ELECTRON_BRIDGE_NAME } from '@shared/constant';
import { BaseRenderApi, ResponseMessage } from './interface';
import { AppSettings } from '@shared/interface';
import { isPc } from '@/common/utils/env';
import { RequestResult } from '@/common/utils/axios';

class PCRenderApi extends BaseRenderApi {
	@wrapResponse()
	updateSettings(params: { key: string; value: any }): Promise<any> {
		return this.getPreloadApi().updateSettings(params);
	}
	@wrapResponse()
	async chooseFile(
		options: Electron.Renderer.OpenDialogOptions
	): Promise<RequestResult<string[]>> {
		const res = await this.getPreloadApi().chooseFile(options);
		return res;
	}
	getLocalImg(path: string): string {
		return `local-resource://${path}`;
		// return this.getPreloadApi().getLocalImg(path)
	}
	@wrapResponse()
	uploadFiles(params: {
		id: number;
		fileContent?: string;
		fileBuffer?: ArrayBuffer;
		oriFilePath?: string;
		fileName: string;
	}): Promise<RequestResult<{ fileName: string; filePath: string }>> {
		return this.getPreloadApi().uploadFiles(params);
	}

	@wrapResponse()
	async getSettings<K extends keyof AppSettings>(
		key: K
	): Promise<RequestResult<AppSettings[K]>> {
		const res = await this.getPreloadApi().getSettings(key);
		return res;
	}

	@wrapResponse()
	async getAllSettings() {
		console.log('1232121321312213:');
		const res = await this.getPreloadApi().getAllSettings();
		console.log('1232121321312213:', res);
		return res;
	}

	// 窗口通信相关方法
	getCurrentWindowId(): string | null {
		return this.getPreloadApi().getCurrentWindowId();
	}

	registerPromiseMessageHandler(
		type: string,
		handler: (data: any) => Promise<any>,
		options?: { when?: (data: any) => boolean }
	): void {
		this.getPreloadApi().registerPromiseMessageHandler(type, handler, options);
	}

	registerMessageHandler(type: string, handler: (data: any) => void): void {
		this.getPreloadApi().registerMessageHandler(type, handler);
	}

	unregisterMessageHandler(type: string): void {
		this.getPreloadApi().unregisterMessageHandler(type);
	}

	sendMessageResponse(response: ResponseMessage): void {
		this.getPreloadApi().sendMessageResponse(response);
	}

	onWindowMessage(callback: (type: string, data: any) => void): () => void {
		return this.getPreloadApi().onWindowMessage(callback);
	}

	getPreloadApi() {
		return window[ELECTRON_BRIDGE_NAME];
	}

	removeLoading(): void {
		if (!isPc) {
			return;
		}
		this.getPreloadApi().removeLoading();
	}
}

class WebRenderApi extends BaseRenderApi {
	updateSettings(params: { key: string; value: any }): Promise<any> {
		return Promise.resolve();
	}
	async chooseFile(
		options: Electron.Renderer.OpenDialogOptions
	): Promise<RequestResult<string[]>> {
		return Promise.resolve({
			data: [],
			success: true,
			status: 200,
		});
	}
	getLocalImg(path: string): string {
		return path;
	}
	uploadFiles(params: {
		id: number;
		fileContent?: string;
		fileBuffer?: ArrayBuffer;
		oriFilePath?: string;
		success: true;
		fileName: string;
	}): Promise<RequestResult<{ fileName: string; filePath: string }>> {
		return Promise.resolve({
			data: {
				fileName: '',
				filePath: '',
				success: true,
			},
			success: true,
			status: 200,
		});
	}

	getAllSettings() {
		console.log('getAllSettings 222');
		return Promise.resolve({} as RequestResult<AppSettings>);
	}

	getSettings<K extends keyof AppSettings>(
		key: K
	): Promise<RequestResult<AppSettings[K]>> {
		return Promise.resolve({} as any);
	}

	// 窗口通信相关方法的模拟实现
	getCurrentWindowId(): string | null {
		return null; // Web环境没有窗口ID
	}

	registerMessageHandler(type: string, handler: (data: any) => void): void {
		console.log(`Web环境模拟注册消息处理器: ${type}`);
		// Web环境不做实际操作
	}

	registerPromiseMessageHandler(
		type: string,
		handler: (data: any) => Promise<any>,
		options?: { when?: (data: any) => boolean }
	): void {
		console.log(`Web环境模拟注册消息处理器: ${type}`);
		// Web环境不做实际操作
	}

	unregisterMessageHandler(type: string): void {
		console.log(`Web环境模拟注销消息处理器: ${type}`);
		// Web环境不做实际操作
	}

	sendMessageResponse(response: ResponseMessage): void {
		console.log('Web环境模拟发送消息响应:', response);
		// Web环境不做实际操作
	}

	onWindowMessage(callback: (type: string, data: any) => void): () => void {
		console.log('Web环境模拟监听窗口消息');
		// 返回一个空函数作为取消监听的方法
		return () => {
			console.log('Web环境模拟取消监听窗口消息');
		};
	}

	getPreloadApi() {
		return window[ELECTRON_BRIDGE_NAME];
	}
}

export const renderApi = isPc ? new PCRenderApi() : new WebRenderApi();
