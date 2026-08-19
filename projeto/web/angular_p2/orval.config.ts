import { defineConfig } from 'orval';

export default defineConfig({
  pizzaria: {
    input: {
      target: 'http://localhost:3300/swagger/v1.json',
    },
    output: {
      client: 'angular',
      mode: 'tags-split',

      target: 'src/api/generated/pizzaria.ts',
      schemas: 'src/api/generated/models',

      clean: true,

      override: {
        angular: {
          provideIn: 'root',
          retrievalClient: 'httpClient',
        },
      },
    },
  },
});
