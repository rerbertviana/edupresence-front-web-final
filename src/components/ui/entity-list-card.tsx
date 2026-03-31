"use client";

import { ReactNode, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EntityListCardProps<T> {
  title: string;
  items?: T[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
  withSearch?: boolean;
  searchPlaceholder?: string;
  getSearchText?: (item: T) => string;
}

export function EntityListCard<T>({
  title,
  items,
  isLoading,
  isError,
  error,
  emptyMessage,
  renderItem,
  withSearch = false,
  searchPlaceholder = "Buscar...",
  getSearchText,
}: EntityListCardProps<T>) {
  const [search, setSearch] = useState("");

  const baseItems = useMemo(() => items ?? [], [items]);
  const hasBaseItems = baseItems.length > 0;

  const filteredItems = useMemo(() => {
    if (!withSearch || !search.trim()) {
      return baseItems;
    }

    const query = search.toLowerCase();

    return baseItems.filter((item) => {
      let text = "";

      if (getSearchText) {
        text = getSearchText(item);
      } else {
        const anyItem = item as any;
        text =
          anyItem?.name ??
          anyItem?.title ??
          JSON.stringify(anyItem ?? "", null, 0);
      }

      return String(text).toLowerCase().includes(query);
    });
  }, [baseItems, withSearch, search, getSearchText]);

  const hasFilteredItems = filteredItems.length > 0;

  const showEmptyBase = !isLoading && !isError && !hasBaseItems;
  const showEmptySearchResult =
    !isLoading &&
    !isError &&
    withSearch &&
    hasBaseItems &&
    !hasFilteredItems &&
    search.trim().length > 0;

  return (
    <Card className="p-4 h-full min-h-[210px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>

        {withSearch && hasBaseItems && !isLoading && !isError && (
          <div className="relative w-44">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-8 rounded-md bg-slate-900/80 pl-7 pr-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-800 focus:ring-white"
            />
          </div>
        )}
      </div>

      {isLoading && (
        <p className="mt-3 text-sm text-slate-400">Carregando...</p>
      )}

      {isError && (
        <p className="mt-3 text-sm text-red-400">
          {(error as any)?.message ?? "Erro ao carregar dados."}
        </p>
      )}

      {showEmptyBase && (
        <p className="pt-3 pb-3 text-sm text-slate-400">{emptyMessage}</p>
      )}

      {showEmptySearchResult && (
        <p className="mt-3 text-sm text-slate-400">
          Nenhum resultado encontrado para a busca.
        </p>
      )}

      {hasFilteredItems && (
        <div className="mt-3 flex-1 min-h-0 overflow-y-auto p-2">
          <ul className="space-y-3">
            {filteredItems.map((item) => renderItem(item))}
          </ul>
        </div>
      )}
    </Card>
  );
}
