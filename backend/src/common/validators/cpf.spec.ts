import { describe, expect, it } from 'vitest';
import { cpfValido } from './cpf.js';

describe('cpfValido', () => {
  it('aceita um CPF válido', () => {
    expect(cpfValido('52998224725')).toBe(true);
  });

  it('aceita um CPF válido cujo primeiro dígito verificador é 0', () => {
    expect(cpfValido('39053344705')).toBe(true);
  });

  it('aceita um CPF válido que começa com zeros', () => {
    expect(cpfValido('00000000191')).toBe(true);
  });

  it('recusa CPF com o segundo dígito verificador errado', () => {
    expect(cpfValido('52998224724')).toBe(false);
  });

  it('recusa CPF com o primeiro dígito verificador errado', () => {
    expect(cpfValido('52998224715')).toBe(false);
  });

  it('recusa CPF com todos os dígitos iguais', () => {
    expect(cpfValido('11111111111')).toBe(false);
  });

  it('recusa o CPF reservado do usuário SISTEMA', () => {
    expect(cpfValido('00000000000')).toBe(false);
  });

  it('recusa CPF com menos de 11 dígitos', () => {
    expect(cpfValido('1234567890')).toBe(false);
  });
});
