export const toJson = (defaultValue: any, str?: string) => {
	if (!str) {
		return defaultValue;
	}
	try {
		return JSON.parse(str);
	} catch (error) {
		console.error('JSON Parse Error:', error);
		return defaultValue;
	}
};
