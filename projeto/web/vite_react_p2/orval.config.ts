import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: 'http://localhost:3300/swagger/v1.json',
    output: {
      mode: 'tags-split',
      target: 'src/services/generated/api.ts',
      schemas: 'src/services/generated/models',
      client: 'axios',
      prettier: true,
      clean: true,
      override: {
        mutator: {
          path: './src/services/api-mutator.ts',
          name: 'apiClient',
        },
      },
    },
  },
});
