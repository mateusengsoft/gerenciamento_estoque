export class BairroMunicipioInvalidoError extends Error {
  constructor() {
    super('O bairro não pertence ao município informado.');
    this.name = 'BairroMunicipioInvalidoError';
  }
}

export class RegistroDuplicadoError extends Error {
  constructor() {
    super('CNPJ ou e-mail já cadastrado.');
    this.name = 'RegistroDuplicadoError';
  }
}

export class RelacionamentoInexistenteError extends Error {
  constructor() {
    super('Um dos registros relacionados não existe.');
    this.name = 'RelacionamentoInexistenteError';
  }
}