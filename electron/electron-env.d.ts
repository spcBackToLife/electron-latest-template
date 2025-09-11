/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
	interface ProcessEnv {
		VSCODE_DEBUG?: 'true';
		DIST_ELECTRON: string;
		DIST: string;
		/** /dist/ or /public/ */
		VITE_PUBLIC: string;
	}
}

// 定义窗口通信相关的接口
interface ResponseMessage {
	requestId: string;
	success: boolean;
	data?: any;
	error?: string;
}

declare global {
	interface Window {
		tn_editor_api: {
			getLocalImg: (path: string) => string;
			chooseFile: (options: OpenDialogOptions) => Promise<any>;
			uploadFiles: (params: {
				id: number;
				fileContent?: string;
				fileBuffer?: ArrayBuffer;
				fileName: string;
				oriFilePath?: string;
			}) => Promise<any>;
			getSettings: (key: any) => Promise<any>;
			getAllSettings: () => Promise<any>;
			updateSettings: (options: { key: string; value: any }) => Promise<any>;
			removeLoading: () => void;
			// 窗口通信相关方法
			getCurrentWindowId: () => string | null;
			registerPromiseMessageHandler: (
				type: string,
				handler: (data: any) => Promise<any>,
				options?: { when?: (data: any) => boolean }
			) => void;
			registerMessageHandler: (
				type: string,
				handler: (data: any) => void
			) => void;
			unregisterMessageHandler: (type: string) => void;
			sendMessageResponse: (response: ResponseMessage) => void;
			onWindowMessage: (
				callback: (type: string, data: any) => void
			) => () => void;

			getVenueConfig: (params: {
				venueId: number;
			}) => Promise<VenueJson | null>;
			updateVenueConfig: (params: {
				venueId: number;
				keyPath: string;
				value: any;
			}) => Promise<VenueJson | null>;
		};
	}
}

export {};
