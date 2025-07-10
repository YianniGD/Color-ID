import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // The following line is no longer needed if you're not using environment variables from .env for API keys.
    // const env = loadEnv(mode, '.', '');
    return {
      // The 'define' block for API keys has been removed or commented out.
      /*
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      */
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
