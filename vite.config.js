import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// Dev Containers: bind so the forwarded port is reachable from the host
		...(process.env.DEVCONTAINER === '1' ? { host: true } : {})
	}
});
