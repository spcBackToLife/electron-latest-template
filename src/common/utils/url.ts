import { EnvEnum, getEnv } from './env';

export const getQueryString = (name: string) => {
	const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	const r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return decodeURIComponent(r[2]);
	}
	return null;
};

export const getQueryNumber = (name: string) => {
	const num = getQueryString(name);
	if (num === null || num === undefined) {
		return null;
	}
	return Number(num);
};

export const getBizLine = () => {
	return getQueryNumber('bizLine');
};
