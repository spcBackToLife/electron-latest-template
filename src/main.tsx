import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { getEnv, EnvEnum } from './common/utils/env';
import { App } from './App';

const isTest = getEnv() === EnvEnum.Test;

console.log('front env is test:', isTest);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
