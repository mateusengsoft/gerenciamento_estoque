import dataSource from '../data-source.js';
import type { EntityManager } from 'typeorm';

async function seedSistema(manager: EntityManager): Promise<number> {
  await manager.query(`
    insert into usuarios (login, senha_hash, nome, email, tipo, cpf, ativo)
    values ('sistema', '!', 'Sistema', 'sistema@localhost', 'OPERADOR_ESTOQUE', '00000000000', false)
    on conflict do nothing
  `);

  const [sistema] = await manager.query(
    `select id from usuarios where login = 'sistema'`,
  );
  return sistema.id;
}

async function main() {
  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      const sistemaId = await seedSistema(manager);
      console.log(`Usuário SISTEMA: id ${sistemaId}`);
    });
  } finally {
    await dataSource.destroy();
  }
}

await main();
