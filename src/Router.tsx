import { BrowserRouter, Routes, Route } from 'react-router-dom';

export const Routers = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path={'/'} element={<div>Hello, world</div>}></Route>
			</Routes>
		</BrowserRouter>
	);
};
