import { ELECTRON_BRIDGE_NAME } from '@shared/constant';

export enum EnvEnum {
	Online = 'prod',
	Test = 'test',
	St = 'st',
	Local = 'local',
}

export const isTest = () => {
	// st 环境
	if (/\.test\./.test(window.location.host)) {
		return true;
	}
	return false;
};

export const isSt = () => {
	// st 环境
	if (/\.st\./.test(window.location.host)) {
		return true;
	}
	return false;
};

export const isLocal = () => {
	if (/127\.0\.0\.1|localhost/.test(window.location.host)) {
		return true;
	}

	return false;
};

export const getEnv = () => {
	// test 环境
	if (/127\.0\.0\.1|localhost|\.test\./.test(window.location.host)) {
		return EnvEnum.Test;
	}

	// st 环境
	if (/\.st\./.test(window.location.host)) {
		return EnvEnum.St;
	}

	// prod 环境
	return EnvEnum.Online;
};

export const isInIframe = () => {
	try {
		// 通过比较当前窗口和顶层窗口是否一致来判断
		return window !== top;
	} catch (e) {
		// 某些安全环境下可能禁止访问 top 对象，返回 true 作为保守判断
		return true;
	}
};

// 只有 PC 环境存在这个变量
export const isPc = Boolean(window[ELECTRON_BRIDGE_NAME]);
