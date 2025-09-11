import '@/views/aiChat/components/CodeOfSemi';
import { Suspense, useEffect } from 'react';

import { Routers } from './Router';
import { renderApi } from './renderApis';

export const App = () => {
	useEffect(() => {
		renderApi.removeLoading();
	}, []);

	return (
		<Suspense>
			<Routers />
		</Suspense>
	);
};
