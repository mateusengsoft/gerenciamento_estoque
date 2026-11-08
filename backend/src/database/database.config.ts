import type { DataSourceOptions } from 'typeorm';

export type EnvReader = (name: string) => string;

export function buildDatabaseOptions(readEnv: EnvReader): DataSourceOptions {
  return {
    type: 'postgres',
    host: readEnv('DB_HOST'),
    port: Number(readEnv('DB_PORT')),
    username: readEnv('DB_USERNAME'),
    password: readEnv('DB_PASSWORD'),
    database: readEnv('DB_DATABASE'),
    synchronize: false,
  };
}
