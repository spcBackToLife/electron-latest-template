export const ELECTRON_BRIDGE_NAME = 'electron_app_api';
export enum EVENT_NAME {
	GetSettings = 'get-settings',
	GetAllSettings = 'get-all-settings',
	UpdateSettings = 'update-settings',
	DeleteSettings = 'delete-settings',
	UploadFiles = 'upload-files',
	ChooseFile = 'choose-file',
	// 窗口管理器相关事件
	WindowMessageRequest = 'window-message-request',
	WindowMessageResponse = 'window-message-response',
	WindowMessage = 'window-message',
	WindowId = 'window-id',
}
