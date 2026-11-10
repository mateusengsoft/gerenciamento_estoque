import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAquisicoesLoteIdIndex1794322079468 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter index aquisicoes_lote_id rename to idx_aquisicoes_lote_id`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter index idx_aquisicoes_lote_id rename to aquisicoes_lote_id`,
    );
  }
}
