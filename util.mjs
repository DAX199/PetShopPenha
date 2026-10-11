/** Funções auxiliares usadas pelo build e pelo modelo da página (sem dependências). */
import fs from 'node:fs';
import path from 'node:path';

/** Escapa texto para uso seguro em HTML (conteúdo e atributos). */
export function esc(valor) {
  return String(valor ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

/** camelCase -> kebab-case (turquesaClaro -> turquesa-claro). */
export const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

/** Link de conversa do WhatsApp com mensagem pronta (formato oficial wa.me). */
export function linkWhatsApp(numero, mensagem = '') {
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Endereço em uma linha, nos formatos usados pelo site. */
export function formatarEndereco(e) {
  const rua = `${e.logradouro}, ${e.numero}${e.complemento ? `, ${e.complemento}` : ''}`;
  return {
    rua,
    bairroCidade: `${e.bairro}, ${e.cidade} — ${e.uf}`,
    completo: `${rua}, ${e.bairro}, ${e.cidade} — ${e.uf}, CEP ${e.cep}`,
    // Para busca no mapa: sem o complemento (o Google localiza pelo número da rua).
    busca: `${e.logradouro}, ${e.numero} - ${e.bairro}, ${e.cidade} - ${e.uf}, ${e.cep}`,
  };
}

/** Lê largura/altura de um JPEG (marcador SOF), sem bibliotecas. */
export function dimensoesJpeg(arquivo) {
  const buf = fs.readFileSync(arquivo);
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error(`Não é um JPEG válido: ${arquivo}`);
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const m = buf[i + 1];
    if (m === 0xff) {
      i++;
      continue;
    }
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) {
      i += 2;
      continue;
    }
    const tamanho = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { altura: buf.readUInt16BE(i + 5), largura: buf.readUInt16BE(i + 7) };
    }
    i += 2 + tamanho;
  }
  throw new Error(`Não foi possível ler as dimensões de ${arquivo}`);
}

/**
 * Descobre as versões otimizadas de uma foto em src/assets/fotos/
 * (arquivos "<nome>-<largura>.<avif|webp|jpg>") e as dimensões reais.
 */
export function versoesDaFoto(pastaFotos, nome) {
  const re = new RegExp(`^${nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)\\.(avif|webp|jpg)$`);
  const porFormato = { avif: [], webp: [], jpg: [] };
  for (const f of fs.readdirSync(pastaFotos)) {
    const m = f.match(re);
    if (m) porFormato[m[2]].push(Number(m[1]));
  }
  for (const k of Object.keys(porFormato)) porFormato[k].sort((a, b) => a - b);
  if (!porFormato.jpg.length) {
    throw new Error(
      `Foto "${nome}" não encontrada em src/assets/fotos/ (esperado: ${nome}-<largura>.jpg). ` +
        'Rode `npm run fotos` ou confira o nome em site.config.mjs.',
    );
  }
  const maior = porFormato.jpg.at(-1);
  const { largura, altura } = dimensoesJpeg(path.join(pastaFotos, `${nome}-${maior}.jpg`));
  return { porFormato, largura, altura };
}
