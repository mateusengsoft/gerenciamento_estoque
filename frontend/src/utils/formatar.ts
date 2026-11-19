// R$ 5,99. Valores vazios (perda e vencimento não têm preço) viram um traço.
export function formatarPreco(valor: string | number | null): string {
  if (valor === null) {
    return '—'
  }
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// 3.000 vira 3, e 2.500 vira 2,5.
export function formatarQuantidade(valor: string | number): string {
  return Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}

// Datas sem hora, como o vencimento: '2026-12-05' vira 05/12/2026.
export function formatarData(valor: string | null): string {
  if (!valor) {
    return '—'
  }
  const [ano, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${ano}`
}

// Datas com hora, como a da movimentação: o texto ISO com Z vira 15/11/2026 00:00, no horário do Brasil.
export function formatarDataHora(valor: string): string {
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function hojeLocal(): string {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}
