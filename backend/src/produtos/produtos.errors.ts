export class CodigoDuplicadoError extends Error {
  constructor() {
    super('Código de produto já cadastrado.');
    this.name = 'CodigoDuplicadoError';
  }
}

export class ReferenciaInexistenteError extends Error {
  constructor() {
    super('Categoria, unidade de medida ou local informado não existe.');
    this.name = 'ReferenciaInexistenteError';
  }
}

export class CategoriaInexistenteError extends Error {
  constructor() {
    super('Categoria informada não existe.');
    this.name = 'CategoriaInexistenteError';
  }
}
