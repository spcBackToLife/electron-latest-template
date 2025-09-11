import { ipcMain } from 'electron';

export function IpcHandle(eventName: string) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		if (!target.constructor._ipcHandles) {
			target.constructor._ipcHandles = [];
		}
		target.constructor._ipcHandles.push({
			eventName,
			method: descriptor.value,
		});
	};
}

/**
 * 装饰器：在被装饰的方法执行之前根据 venueId 初始化 AI 客户端
 * 适用于需要确保 AI 客户端已初始化的方法
 * 要求被装饰的方法的第一个参数是一个包含 venueId 的对象
 */
export function WithInitClient() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			// 检查第一个参数是否包含 venueId
			if (
				args.length > 0 &&
				args[0] &&
				typeof args[0] === 'object' &&
				'venueId' in args[0]
			) {
				const venueId = args[0].venueId;

				// 确保指定 venueId 的 AI 客户端已初始化
				if (this.initClient && typeof this.initClient === 'function') {
					await this.initClient({ venueId });
				}
			} else {
				throw new Error('方法的第一个参数必须包含 venueId');
			}

			// 调用原始方法
			return originalMethod.apply(this, args);
		};

		return descriptor;
	};
}
