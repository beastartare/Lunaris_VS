// ── Conversão de File para Base64 ─────────────────────────────────────────

export function fileToBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(arquivo);
    reader.onload = () => {
      const resultado = reader.result as string;
      resolve(resultado.split(",")[1]);
    };
    reader.onerror = reject;
  });
}

// ── Conversão de bytea hex → base64 ──────────────────────────────────────

export function byteaHexToBase64(hex: string): string {
  if (!hex) return "";

  const cleanHex = hex.startsWith("\\x")
    ? hex.slice(2)
    : hex;

  let base64 = "";

  for (let i = 0; i < cleanHex.length; i += 2) {
    base64 += String.fromCharCode(
      parseInt(cleanHex.substring(i, i + 2), 16)
    );
  }

  return base64;
}

/**
 * Retorna o src completo data URI para renderizar uma imagem bytea do banco.
 * Suporta tanto hex bytea quanto base64 puro.
 */
export function obterSrcImagem(imgItem: string): string {
  if (!imgItem) return "";
  // Se já é base64 puro (vindo do FileReader), usa direto
  if (!imgItem.startsWith("\\x") && !imgItem.match(/^[0-9a-fA-F]+$/)) {
    return `data:image/jpeg;base64,${imgItem}`;
  }
  return `data:image/jpeg;base64,${byteaHexToBase64(imgItem)}`;
}

// ── Formatação de data ────────────────────────────────────────────────────

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}
