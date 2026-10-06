import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Estado partilhado entre testes: cada teste começa com localStorage vazio
// (o WeddingStorageService faz seed automático quando precisa).
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});
