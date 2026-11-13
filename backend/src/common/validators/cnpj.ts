export function cnpjValido(cnpj: string): boolean {
  if (!/^\d{14}$/.test(cnpj)) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calcularDigito = (base: string, pesos: number[]): number => {
    let soma = 0;

    for (let i = 0; i < pesos.length; i++) {
      soma += Number(base[i]) * pesos[i];
    }

    const resto = soma % 11;

    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = calcularDigito(
    cnpj.substring(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  if (primeiroDigito !== Number(cnpj[12])) {
    return false;
  }

  const segundoDigito = calcularDigito(
    cnpj.substring(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return segundoDigito === Number(cnpj[13]);
}
