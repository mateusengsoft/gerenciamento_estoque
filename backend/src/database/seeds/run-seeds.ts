import dataSource, { lerVariavel } from '../data-source.js';
import type { EntityManager } from 'typeorm';
import { readFileSync } from 'node:fs';
import bcrypt from 'bcrypt';
import { TipoUsuario } from '../../usuarios/tipo-usuario.enum.js';

interface EstadoIbge {
  CodigoUf: number;
  Nome: string;
  Uf: string;
}
interface MunicipioIbge {
  Codigo: number;
  Nome: string;
  Uf: string;
}

interface BairroIbge {
  Codigo: string;
  Nome: string;
}

const UNIDADES_MEDIDA = [
  { nome: 'Unidade', sigla: 'un' },
  { nome: 'Quilograma', sigla: 'kg' },
  { nome: 'Grama', sigla: 'g' },
  { nome: 'Litro', sigla: 'L' },
  { nome: 'Mililitro', sigla: 'mL' },
  { nome: 'Caixa', sigla: 'cx' },
  { nome: 'Pacote', sigla: 'pct' },
];

const CATEGORIAS = [
  'Laticínios',
  'Carnes',
  'Grãos e Cereais',
  'Bebidas',
  'Hortifrúti',
  'Padaria',
  'Congelados',
  'Mercearia',
];

const CORREDORES = ['A', 'B'];
const PRATELEIRAS = ['1', '2'];
const SECOES = ['1', '2'];

function lerJson<T>(arquivo: string): T[] {
  const conteudo = readFileSync(`src/database/seeds/data/${arquivo}`, 'utf-8');
  return JSON.parse(conteudo).data;
}

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

async function seedAdmin(manager: EntityManager): Promise<void> {
  const senha = lerVariavel('ADMIN_SENHA');
  const senhaHash = await bcrypt.hash(senha, 10);
  await manager.query(
    `
    insert into usuarios (login, senha_hash, nome, email, tipo, cpf, ativo)
    values ($1,$2,$3,$4,$5,$6,$7)
    on conflict do nothing`,
    [
      lerVariavel('ADMIN_LOGIN'),
      senhaHash,
      lerVariavel('ADMIN_NOME'),
      lerVariavel('ADMIN_EMAIL'),
      TipoUsuario.ADMINISTRADOR,
      lerVariavel('ADMIN_CPF'),
      true,
    ],
  );
}

async function seedEstados(
  manager: EntityManager,
  sistemaId: number,
): Promise<void> {
  await manager.query(
    `insert into paises (nome, sigla, usuario_id) values ($1, $2, $3) on conflict do nothing`,
    ['Brasil', 'BRA', sistemaId],
  );
  const [brasil] = await manager.query(
    `select id from paises where sigla = 'BRA'`,
  );

  const estados = lerJson<EstadoIbge>('estados.json');
  for (const estado of estados) {
    await manager.query(
      `insert into estados (codigo_uf, nome, uf, pais_id, usuario_id)
       values ($1, $2, $3, $4, $5)
       on conflict do nothing`,
      [estado.CodigoUf, estado.Nome, estado.Uf, brasil.id, sistemaId],
    );
  }
  console.log(`Estados: ${estados.length}`);
}

async function seedMunicipios(
  manager: EntityManager,
  sistemaId: number,
): Promise<void> {
  const linhas: { id: number; uf: string }[] = await manager.query(
    `select id, uf from estados`,
  );
  const estadoPorUf = new Map<string, number>(
    linhas.map((estado) => [estado.uf, estado.id]),
  );

  const municipios = lerJson<MunicipioIbge>('municipios.json');

  for (const municipio of municipios) {
    const estadoId = estadoPorUf.get(municipio.Uf);
    if (estadoId === undefined) {
      throw new Error(
        `Estado não encontrado para UF: ${municipio.Uf} (município ${municipio.Nome})`,
      );
    }
    await manager.query(
      `insert into municipios (codigo, nome, estado_id, usuario_id)
       values ($1, $2, $3, $4)
       on conflict do nothing`,
      [municipio.Codigo, municipio.Nome, estadoId, sistemaId],
    );
  }

  console.log(`Municipios: ${municipios.length}`);
}

async function seedBairros(
  manager: EntityManager,
  sistemaId: number,
): Promise<void> {
  const linhas: { id: number; codigo: number }[] = await manager.query(
    `select id, codigo from municipios`,
  );
  const municipioPorCodigo = new Map<number, number>(
    linhas.map((municipio) => [municipio.codigo, municipio.id]),
  );

  const bairros = lerJson<BairroIbge>('bairros.json');

  for (const bairro of bairros) {
    const codigoMunicipio = Number(bairro.Codigo.slice(0, 7));
    const municipioId = municipioPorCodigo.get(codigoMunicipio);
    if (municipioId === undefined) {
      throw new Error(
        `Municipio  ${bairro.Codigo} não encontrado para o  (bairro ${bairro.Nome}, codigo ${bairro.Codigo})`,
      );
    }
    const nome = bairro.Nome.slice(0, bairro.Nome.lastIndexOf(' - '));
    await manager.query(
      `insert into bairros (codigo, nome, municipio_id, usuario_id)
       values ($1, $2, $3, $4)
       on conflict do nothing`,
      [bairro.Codigo, nome, municipioId, sistemaId],
    );
  }

  console.log(`Bairros: ${bairros.length}`);
}

async function seedUnidadesMedida(
  manager: EntityManager,
  sistemaId: number,
): Promise<void> {
  for (const unidade of UNIDADES_MEDIDA) {
    await manager.query(
      `insert into unidades_medida (nome, sigla, usuario_id)
       values ($1, $2, $3)
       on conflict do nothing`,
      [unidade.nome, unidade.sigla, sistemaId],
    );
  }
  console.log(`Unidades de medida: ${UNIDADES_MEDIDA.length}`);
}

async function seedCategorias(
  manager: EntityManager,
  sistemaId: number,
): Promise<void> {
  for (const categoria of CATEGORIAS) {
    await manager.query(
      `insert into categorias (nome, usuario_id)
       values ($1, $2)
       on conflict do nothing`,
      [categoria, sistemaId],
    );
  }
  console.log(`Categorias: ${CATEGORIAS.length}`);
}

async function seedLocais(
  manager: EntityManager,
  sistemaId: number,
): Promise<void> {
  let contador = 0;
  for (const corredor of CORREDORES) {
    for (const prateleira of PRATELEIRAS) {
      for (const secao of SECOES) {
        await manager.query(
          `
                    insert into locais(corredor,prateleira,secao,usuario_id)
                    values($1,$2,$3,$4)
                    on conflict do nothing`,
          [corredor, prateleira, secao, sistemaId],
        );
        contador++;
      }
    }
  }
  console.log(`Locais: ${contador}`);
}
async function main() {
  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      const sistemaId = await seedSistema(manager);
      console.log(`Usuário SISTEMA: id ${sistemaId}`);
      await seedEstados(manager, sistemaId);
      await seedMunicipios(manager, sistemaId);
      await seedBairros(manager, sistemaId);
      await seedUnidadesMedida(manager, sistemaId);
      await seedCategorias(manager, sistemaId);
      await seedLocais(manager, sistemaId);
      await seedAdmin(manager);
    });
  } finally {
    await dataSource.destroy();
  }
}

await main();
