export function cpfValido(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) {
    return false;
  }
  const digitosString = cpf.split('');
  const digitosNumber = digitosString.map(Number);

  if (new Set(cpf).size === 1) {
    return false;
  }

  if (!digitoVerificadorConfere(digitosNumber, 10)) {
    return false;
  }

  if (!digitoVerificadorConfere(digitosNumber, 11)) {
    return false;
  }

  return true;
}

function digitoVerificadorConfere(
  digitosNumber: number[],
  pesoInicial: number,
): boolean {
  let i: number = 0;
  let soma: number = 0;
  let peso: number = pesoInicial;
  while (peso >= 2) {
    soma += digitosNumber[i] * peso;
    --peso;
    i++;
  }
  let digitoVerificacao: number = (soma * 10) % 11;

  if (digitoVerificacao === 10) {
    digitoVerificacao = 0;
  }

  return digitoVerificacao === digitosNumber[pesoInicial - 1];
}
