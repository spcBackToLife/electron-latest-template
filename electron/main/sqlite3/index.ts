import sq, { Database } from 'sqlite3';
import { ipcMain } from 'electron';
import { EVENT_NAME } from '@shared/constant';
import { IpcHandle } from '../utils/handleDecortor';
import { BaseIpcHander } from '../utils/BaseIpcHander';
const sq3 = sq.verbose();

export class Sqlite3 extends BaseIpcHander {
	private db: Database;
	constructor(filePath: string) {
		super();
		this.db = new sq3.Database(filePath);
		this.initTables();
	}
	initTables() {
		this.db.serialize(() => {
			// 创建表 - Example
			const sql = `
        CREATE TABLE IF NOT EXISTS tables (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
        )
      `;
			this.db.run(sql, (err) => {
				if (err) {
					console.error(err.message);
				} else {
					console.log('Table "docs" created or already exists.');
				}
			});
		});
	}

	@IpcHandle(EVENT_NAME.UploadFiles)
	async uploadFiles({
		id,
		fileContent,
		fileBuffer,
		fileName,
		oriFilePath,
	}: {
		id: number;
		fileContent?: string;
		fileBuffer?: ArrayBuffer;
		oriFilePath?: string;
		fileName: string;
	}): Promise<{
		fileName: string;
		filePath: string;
	}> {
		return Promise.resolve({
			fileName,
			filePath: '',
		});
	}
}

export const sqlite3 = new Sqlite3('agent.db');
