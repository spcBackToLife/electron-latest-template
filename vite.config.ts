import { rmSync } from 'node:fs';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	// 只在 electron 模式下清理 dist-electron
	if (mode !== 'web') {
		rmSync('dist-electron', { recursive: true, force: true });
	}

	const isServe = command === 'serve';
	const isBuild = command === 'build';
	const sourcemap = isServe || !!process.env.VSCODE_DEBUG;
	const isWebMode = mode === 'web';

	const PUBLIC_PATH = process.env.PUBLIC_PATH;
	const publicPath = isWebMode ? { base: PUBLIC_PATH } : {};

	// 基础配置
	const baseConfig = {
		...publicPath,
		resolve: {
			alias: {
				'@': path.join(__dirname, 'src'),
				'@shared': path.resolve(__dirname, 'shared'),
			},
		},
		build: {
			outDir: isWebMode ? 'build' : 'dist',
			rollupOptions: {
				plugins: [rollupNodePolyFill()],
				external: ['electron', 'better-sqlite3'],
			},
		},
		optimizeDeps: {
			esbuildOptions: {
				// Node.js global to browser globalThis
				define: {
					global: 'globalThis',
				},
			},
		},
		server: {
			port: 3004,
			proxy: {},
		},
		define: {
			global: 'globalThis',
		},
		clearScreen: false,
	};

	// 基础插件
	const basePlugins = [
		react({
			babel: {
				plugins: [
					['@babel/plugin-proposal-decorators', { legacy: true }],
					['@babel/plugin-proposal-class-properties', { loose: true }],
				],
			},
		}),
		monacoEditorPlugin({
			languageWorkers: ['typescript', 'html', 'css'],
		}),
		NodeGlobalsPolyfillPlugin({
			buffer: true,
			process: true,
		}),
		NodeModulesPolyfillPlugin(),
	];

	// Electron 插件配置
	const electronPlugins = [
		electron([
			{
				// Main-Process entry file of the Electron App.
				entry: 'electron/main/index.ts',
				onstart(options) {
					if (process.env.VSCODE_DEBUG) {
						console.log(
							/* For `.vscode/.debug.script.mjs` */ '[startup] Electron App'
						);
					} else {
						options.startup();
					}
				},
				vite: {
					resolve: {
						alias: {
							'@shared': path.resolve(__dirname, 'shared'),
						},
					},
					build: {
						sourcemap,
						minify: isBuild,
						outDir: 'dist-electron/main',
						rollupOptions: {
							external: Object.keys(
								'dependencies' in pkg ? pkg.dependencies : {}
							),
						},
					},
				},
			},
			{
				entry: 'electron/preload/index.ts',
				onstart(options) {
					// Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
					// instead of restarting the entire Electron App.
					options.reload();
				},
				vite: {
					resolve: {
						alias: {
							'@shared': path.resolve(__dirname, 'shared'),
						},
					},
					build: {
						sourcemap: sourcemap ? 'inline' : undefined, // #332
						minify: isBuild,
						outDir: 'dist-electron/preload',
						rollupOptions: {
							external: Object.keys(
								'dependencies' in pkg ? pkg.dependencies : {}
							),
						},
					},
				},
			},
		]),
		// Use Node.js API in the Renderer-process
		renderer(),
	];

	return {
		...baseConfig,

		plugins: isWebMode ? basePlugins : [...basePlugins, ...electronPlugins],
	};
});
