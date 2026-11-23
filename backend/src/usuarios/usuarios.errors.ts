export class BairroMunicipioInvalidoError extends Error {
  constructor() {
    super('O bairro não pertence ao município informado.');
    this.name = 'BairroMunicipioInvalidoError';
  }
}

export class RegistroDuplicadoError extends Error {
  constructor() {
    super('Login, e-mail ou CPF já cadastrado.');
    this.name = 'RegistroDuplicadoError';
  }
}

export class MunicipioInexistenteError extends Error {
  constructor() {
    super('Município informado não existe.');
    this.name = 'MunicipioInexistenteError';
  }
}

export class EmailDuplicadoError extends Error {
  constructor() {
    super('E-mail já cadastrado para outro usuário.');
    this.name = 'EmailDuplicadoError';
  }
}
