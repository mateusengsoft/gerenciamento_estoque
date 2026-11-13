import { describe, expect, it } from 'vitest';
import { cnpjValido } from './cnpj.js';

describe('cnpjValido', () => {
  it('aceita um CNPJ válido', () => {
    expect(cnpjValido('11222333000181')).toBe(true);
  });

  it('Aceita um CNPJ válido que começa com zeros', () => {
    expect(cnpjValido('00000000000272')).toBe(true);
  });

  it('recusa CNPJ com o segundo dígito verificador errado', () => {
    expect(cnpjValido('59984047000181')).toBe(false);
  });

  it('recusa CNPJ com o primeiro dígito verificador errado', () => {
    expect(cnpjValido('52998224712525')).toBe(false);
  });

  it('recusa CNPJ com todos os dígitos iguais', () => {
    expect(cnpjValido('11111111111111')).toBe(false);
  });

  it('recusa CNPJ com menos de 14 dígitos', () => {
    expect(cnpjValido('1234567890')).toBe(false);
  });
});
