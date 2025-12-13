import { AsyncLocalStorage } from 'node:async_hooks';
import type { KVNamespace } from '@cloudflare/workers-types';

export const platformStorage = new AsyncLocalStorage<App.Platform>();

export function getKVBinding(): KVNamespace | null {
	const platform = platformStorage.getStore();
	if (!platform || !platform.env || !platform.env.eventData) {
		return null;
	}
	return platform.env.eventData;
}
