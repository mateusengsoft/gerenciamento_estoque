import { DataSource } from 'typeorm';
import { buildDatabaseOptions } from './database.config.js';

process.loadEnvFile();

export const lerVariavel = (name: string): string => {
  const valor = process.env[name];
  if (!valor) {
    throw new Error(`Variável de ambiente ${name} não definida`);
  }
  return valor;
};

export default new DataSource({
  ...buildDatabaseOptions(lerVariavel),
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
});
