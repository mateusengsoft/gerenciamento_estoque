import { TipoMovimentacao } from './tipo-movimentacao.enum.js';
import { MotivoMovimentacao } from './motivo-movimentacao.enum.js';

export interface MovimentacaoHistorico {
  id: number;
  tipo: TipoMovimentacao;
  motivo: MotivoMovimentacao | null;
  quantidade: string;
  valorUnitario: string | null;
  dataMovimentacao: Date;
  observacao: string | null;
  produtoId: number;
  produtoNome: string;
  loteId: number;
  codigoLote: string;
  usuarioNome: string;
  localOrigemId: number | null;
  localDestinoId: number | null;
}