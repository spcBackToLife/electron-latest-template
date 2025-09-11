import { RequestResult } from '@/common/utils/axios';
import { AppSettings } from '@shared/interface';
import { OpenDialogOptions } from 'electron/renderer';

// 定义响应消息接口
export interface ResponseMessage {
	requestId: string;
	success: boolean;
	data?: any;
	error?: string;
}

export abstract class BaseRenderApi {
	abstract getLocalImg(path: string): string;
	abstract updateSettings(params: { key: string; value: any }): Promise<any>;
	abstract chooseFile(
		options: OpenDialogOptions
	): Promise<RequestResult<string[]>>;
	removeLoading(): void {}
	abstract uploadFiles(params: {
		id: number;
		fileContent?: string;
		fileBuffer?: ArrayBuffer;
		oriFilePath?: string;
		fileName: string;
	}): Promise<
		RequestResult<{
			fileName: string;
			filePath: string;
		}>
	>;

	abstract getSettings<K extends keyof AppSettings>(
		key: K
	): Promise<RequestResult<AppSettings[K]>>;
	abstract getAllSettings(): Promise<RequestResult<AppSettings>>;

	// 窗口通信相关方法
	abstract getCurrentWindowId(): string | null;
	abstract registerPromiseMessageHandler(
		type: string,
		handler: (data: any) => Promise<any>,
		options?: { when?: (data: any) => boolean }
	): void;
	abstract registerMessageHandler(
		type: string,
		handler: (data: any) => void
	): void;
	abstract unregisterMessageHandler(type: string): void;
	abstract sendMessageResponse(response: ResponseMessage): void;
	abstract onWindowMessage(
		callback: (type: string, data: any) => void
	): () => void;
}
