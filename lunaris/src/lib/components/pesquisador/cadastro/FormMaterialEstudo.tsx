import { useState } from "react";
import { supabase } from "../../../supabase";

export default function FormMaterialEstudo() {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [descricao, setDescricao] = useState("");

  const [arquivo, setArquivo] = useState<File | null>(null);

  const [tipoArquivo, setTipoArquivo] = useState("");

  const converterParaBase64 = (arquivo: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(arquivo);

      reader.onload = () => {
        const resultado = reader.result as string;

        resolve(resultado.split(",")[1]);
      };

      reader.onerror = reject;
    });
  };

  const selecionarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setArquivo(file);

    if (!file) return;

    const extensao = file.name.split(".").pop() || "";

    setTipoArquivo(extensao.toUpperCase());
  };

  const salvarMaterial = async () => {
    try {
      if (!arquivo) {
        alert("Selecione um arquivo.");
        return;
      }

      const arquivoBase64 = await converterParaBase64(arquivo);

      const { error } = await supabase.from("materialestudo").insert({
        idusuario: 2,

        titulo,

        autor,

        descricao,

        tipo_arquivo: tipoArquivo,

        data_lancamento: new Date().toISOString(),

        arquivo: arquivoBase64,
      });

      if (error) throw error;

      alert("Material cadastrado com sucesso!");

      setTitulo("");
      setAutor("");
      setDescricao("");
      setArquivo(null);
      setTipoArquivo("");
    } catch (err) {
      console.error(err);

      alert("Erro ao cadastrar material.");
    }
  };

  return (
    <div className="max-w-3xl">
      {" "}
      <h2 className="mb-6 text-3xl font-bold">Cadastro de Material </h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <input
          type="text"
          placeholder="Autor"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <div className="rounded-xl bg-[#3b1544] p-4">
          <p className="mb-3 font-semibold">Arquivo</p>

          <input type="file" onChange={selecionarArquivo} className="w-full" />

          {arquivo && (
            <div className="mt-3 text-sm text-gray-300">
              <p>Nome: {arquivo.name}</p>

              <p>Tipo: {tipoArquivo}</p>

              <p>Tamanho: {(arquivo.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        <button
          onClick={salvarMaterial}
          className="rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold"
        >
          Salvar Material
        </button>
      </div>
    </div>
  );
}
