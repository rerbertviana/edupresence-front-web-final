"use client";

import * as React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type DeleteConfirmDialogProps = {
  open: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  entityLabel?: string;
  entityName?: React.ReactNode;
  description?: React.ReactNode;
};

export function DeleteConfirmDialog({
  open,
  loading = false,
  onConfirm,
  onCancel,
  entityLabel,
  entityName,
  description,
}: DeleteConfirmDialogProps) {
  const defaultDescription = (
    <>
      Tem certeza que deseja excluir {entityLabel ?? "este item"}
      {entityName ? (
        <span className="font-semibold text-red-300"> &quot;{entityName}&quot;</span>
      ) : null}
      ? <span className="font-semibold">Essa ação não poderá ser desfeita.</span>
    </>
  );

  return (
    <ConfirmDialog
      open={open}
      title="Confirmar exclusão"
      description={description ?? defaultDescription}
      confirmLabel={loading ? "Excluindo..." : "Excluir"}
      cancelLabel="Cancelar"
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
