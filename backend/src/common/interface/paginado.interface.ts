export interface Paginado<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
}
