import Store from 'electron-store';
import { IpcHandle } from '../utils/handleDecortor';
import { EVENT_NAME } from '@shared/constant';
import { AppSettings } from '@shared/interface';
import { dialog, ipcMain, OpenDialogOptions } from 'electron';
import { BaseIpcHander } from '../utils/BaseIpcHander';
console.log('StoreStore:', Store);

export class SettingsManager extends BaseIpcHander {
	private store: Store<AppSettings>;
	constructor() {
		super();
		this.store = new Store<AppSettings>({
			name: 'app-settings',
			defaults: {
				workspace: '',
			},
		});

		console.log('coreTools:', this.store.get('coreTools'));
	}

	public getWorkspace(): string {
		return this.store.get('workspace');
	}

	@IpcHandle(EVENT_NAME.GetAllSettings)
	public getAllSettings(): AppSettings {
		// 返回所有配置
		return this.store.store;
	}

	@IpcHandle(EVENT_NAME.GetSettings)
	public getSettings(key: string): any {
		return this.store.get(key);
	}
	@IpcHandle(EVENT_NAME.UpdateSettings)
	public updateSettings({ key, value }: { key: string; value: any }): void {
		console.log('updateSettings:', key, value);
		return this.store.set(key, value);
	}
	@IpcHandle(EVENT_NAME.DeleteSettings)
	public deleteSettings(key: keyof AppSettings): void {
		return this.store.delete(key);
	}

	@IpcHandle(EVENT_NAME.ChooseFile)
	public async chooseFile(options: OpenDialogOptions): Promise<string[]> {
		const result = await dialog.showOpenDialog({
			...options,
		});
		return result.filePaths;
	}
}

export const settingsManager = new SettingsManager();
