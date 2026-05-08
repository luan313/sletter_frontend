"use client";

import { useState } from "react";
import { apiFetch } from "@/utils/api";

interface Collection {
  id: string;
  name: string;
}

interface CollectionModalsProps {
  collection: Collection;
  showEdit: boolean;
  showDelete: boolean;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
  onRefresh: () => void;
  onDeleted?: () => void;
}

export function CollectionModals({
  collection,
  showEdit,
  showDelete,
  onCloseEdit,
  onCloseDelete,
  onRefresh,
  onDeleted
}: CollectionModalsProps) {
  const [editName, setEditName] = useState(collection.name);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim() === collection.name) {
      onCloseEdit();
      return;
    }
    
    setIsProcessing(true);
    try {
      await apiFetch(`/collections/${collection.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName.trim() }),
      });
      onCloseEdit();
      onRefresh();
    } catch (err: any) {
      alert("Erro ao editar coleção: " + (err.message || "Erro desconhecido"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await apiFetch(`/collections/${collection.id}`, {
        method: "DELETE",
      });
      onCloseDelete();
      if (onDeleted) onDeleted();
      else onRefresh();
    } catch (err: any) {
      alert("Erro ao deletar coleção: " + (err.message || "Erro desconhecido"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {showEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(52,78,65,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onCloseEdit(); }}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-scale" style={{ backgroundColor: '#fff' }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--pine-teal)' }}>Editar Coleção</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Altere o nome da sua coleção.</p>
            <form onSubmit={handleEdit} className="space-y-4">
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={50}
                placeholder="Nome da coleção" autoFocus required
                className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
                style={{ border: '1.5px solid var(--border)', color: 'var(--pine-teal)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--fern)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,129,87,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={onCloseEdit}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: 'var(--pine-teal)', color: 'var(--dust-grey)' }}>
                  {isProcessing ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(52,78,65,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onCloseDelete(); }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fade-in-scale" style={{ backgroundColor: '#fff' }}>
            <h2 className="text-xl font-bold mb-2 text-red-600">Deletar Coleção</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Tem certeza que deseja deletar "{collection.name}"? Esta ação não removerá os itens da sua biblioteca geral.</p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={onCloseDelete}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{ color: 'var(--text-muted)' }}>
                Cancelar
              </button>
              <button type="button" onClick={handleDelete} disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 disabled:opacity-50 cursor-pointer bg-red-600 text-white">
                {isProcessing ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
