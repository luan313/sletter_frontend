import Link from "next/link";

// Dados falsos para visualizar o layout
const colecoesMock = [
  {
    id: 1,
    nome: "Filmes Favoritos de 2023",
    totalObras: 12,
    obras: [
      { id: 101, titulo: "Oppenheimer", cor: "bg-orange-900" },
      { id: 102, titulo: "Barbie", cor: "bg-pink-500" },
      { id: 103, titulo: "Homem-Aranha", cor: "bg-red-600" },
      { id: 104, titulo: "Assassinos da Lua das Flores", cor: "bg-zinc-800" },
      { id: 105, titulo: "John Wick 4", cor: "bg-amber-600" },
    ],
  },
  {
    id: 2,
    nome: "Jogos para Platinar",
    totalObras: 8,
    obras: [
      { id: 201, titulo: "Elden Ring", cor: "bg-yellow-700" },
      { id: 202, titulo: "God of War", cor: "bg-blue-800" },
      { id: 203, titulo: "Hollow Knight", cor: "bg-indigo-900" },
      // Coleção com menos de 5 obras
    ],
  }
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Minhas Coleções</h1>
        <p className="text-zinc-600 text-sm mt-1">Organize e acesse rapidamente seus catálogos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colecoesMock.map((colecao) => {
          // Pegamos apenas as 5 primeiras obras
          const obrasExibidas = colecao.obras.slice(0, 5);
          const resto = colecao.totalObras - obrasExibidas.length;

          return (
            <div key={colecao.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              
              {/* Cabeçalho do Card */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-zinc-900">{colecao.nome}</h2>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
                  {colecao.totalObras} itens
                </span>
              </div>

              {/* Grid de Capas das Obras */}
              <div className="grid grid-cols-6 gap-2">
                {obrasExibidas.map((obra) => (
                  <div 
                    key={obra.id} 
                    className={`aspect-[2/3] w-full rounded-md shadow-sm ${obra.cor} flex items-center justify-center p-1`}
                    title={obra.titulo}
                  >
                    {/* Placeholder para a capa: a primeira letra do título */}
                    <span className="text-white text-xs font-bold opacity-50">
                      {obra.titulo.charAt(0)}
                    </span>
                  </div>
                ))}

                {/* Botão de Ver Mais (6º espaço) */}
                {resto > 0 ? (
                  <Link 
                    href={`/colecao/${colecao.id}`}
                    className="aspect-[2/3] w-full rounded-md border border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center hover:bg-zinc-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-zinc-600">+{resto}</span>
                  </Link>
                ) : (
                  // Botão genérico de Ver Mais se a coleção tiver 5 ou menos itens
                  <Link 
                    href={`/colecao/${colecao.id}`}
                    className="aspect-[2/3] w-full rounded-md border border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center hover:bg-zinc-100 transition-colors"
                  >
                    <span className="text-[10px] font-medium text-zinc-600 text-center uppercase tracking-wide">Abrir</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}