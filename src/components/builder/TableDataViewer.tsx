import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, ChevronDown, ChevronRight, Columns, Rows } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAppColumns, createAppColumn, deleteAppColumn,
  getAppRows, createAppRow, deleteAppRow,
  type AppColumn, type AppRow,
} from "@/services/projectService";

const COLUMN_TYPES = ["text", "number", "boolean", "date"] as const;

interface TableDataViewerProps {
  tableId: string;
  tableName: string;
}

export function TableDataViewer({ tableId, tableName }: TableDataViewerProps) {
  const [columns, setColumns] = useState<AppColumn[]>([]);
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  // New column form
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState<string>("text");
  const [addingCol, setAddingCol] = useState(false);

  // New row form
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});
  const [addingRow, setAddingRow] = useState(false);

  // Sections
  const [showCols, setShowCols] = useState(true);
  const [showRows, setShowRows] = useState(true);

  useEffect(() => {
    loadData();
  }, [tableId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cols, rws] = await Promise.all([getAppColumns(tableId), getAppRows(tableId)]);
      setColumns(cols);
      setRows(rws);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async () => {
    if (!newColName.trim()) return;
    setAddingCol(true);
    try {
      const col = await createAppColumn(tableId, newColName.trim(), newColType);
      setColumns(prev => [...prev, col]);
      setNewColName("");
      setNewColType("text");
    } catch (e) {
      console.error(e);
    } finally {
      setAddingCol(false);
    }
  };

  const handleDeleteColumn = async (colId: string) => {
    try {
      await deleteAppColumn(colId);
      setColumns(prev => prev.filter(c => c.id !== colId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRow = async () => {
    if (columns.length === 0) return;
    setAddingRow(true);
    try {
      const data: Record<string, unknown> = {};
      columns.forEach(col => {
        const val = newRowData[col.name] || "";
        if (col.column_type === "number") data[col.name] = val ? Number(val) : null;
        else if (col.column_type === "boolean") data[col.name] = val === "true";
        else data[col.name] = val || null;
      });
      const row = await createAppRow(tableId, data);
      setRows(prev => [...prev, row]);
      setNewRowData({});
    } catch (e) {
      console.error(e);
    } finally {
      setAddingRow(false);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    try {
      await deleteAppRow(rowId);
      setRows(prev => prev.filter(r => r.id !== rowId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {/* Columns Section */}
      <div>
        <button
          onClick={() => setShowCols(!showCols)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          {showCols ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <Columns className="h-3 w-3" />
          Columnas ({columns.length})
        </button>

        {showCols && (
          <div className="space-y-1.5 pl-2">
            {columns.map(col => (
              <div key={col.id} className="flex items-center justify-between rounded-md border border-border bg-background px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground">{col.name}</span>
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">{col.column_type}</span>
                  {col.is_required && <span className="text-[10px] text-destructive">*</span>}
                </div>
                <button onClick={() => handleDeleteColumn(col.id)} className="rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Add column form */}
            <div className="flex gap-1.5 items-center">
              <input
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                placeholder="nombre"
                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-brain/60"
                onKeyDown={e => e.key === "Enter" && handleAddColumn()}
              />
              <select
                value={newColType}
                onChange={e => setNewColType(e.target.value)}
                className="rounded-md border border-border bg-background px-1.5 py-1 text-xs text-foreground focus:outline-none"
              >
                {COLUMN_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={handleAddColumn}
                disabled={addingCol || !newColName.trim()}
                className="rounded-md bg-brain p-1 text-brain-foreground hover:bg-brain/90 transition-colors disabled:opacity-50"
              >
                {addingCol ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rows Section */}
      <div>
        <button
          onClick={() => setShowRows(!showRows)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          {showRows ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <Rows className="h-3 w-3" />
          Datos ({rows.length})
        </button>

        {showRows && (
          <div className="space-y-2 pl-2">
            {columns.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Agrega columnas primero para ver datos</p>
            ) : (
              <>
                {/* Data table */}
                {rows.length > 0 && (
                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-surface-2">
                          {columns.map(col => (
                            <th key={col.id} className="px-2 py-1.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                              {col.name}
                            </th>
                          ))}
                          <th className="w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(row => (
                          <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                            {columns.map(col => (
                              <td key={col.id} className="px-2 py-1.5 text-foreground whitespace-nowrap max-w-[150px] truncate">
                                {String(row.data?.[col.name] ?? "")}
                              </td>
                            ))}
                            <td className="px-1">
                              <button onClick={() => handleDeleteRow(row.id)} className="rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add row form */}
                <div className="space-y-1.5 rounded-md border border-dashed border-border p-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Nueva fila</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {columns.map(col => (
                      <div key={col.id}>
                        <label className="text-[10px] text-muted-foreground">{col.name}</label>
                        {col.column_type === "boolean" ? (
                          <select
                            value={newRowData[col.name] || ""}
                            onChange={e => setNewRowData(prev => ({ ...prev, [col.name]: e.target.value }))}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                          >
                            <option value="">--</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                          </select>
                        ) : (
                          <input
                            type={col.column_type === "number" ? "number" : col.column_type === "date" ? "date" : "text"}
                            value={newRowData[col.name] || ""}
                            onChange={e => setNewRowData(prev => ({ ...prev, [col.name]: e.target.value }))}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-brain/60"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAddRow}
                    disabled={addingRow}
                    className="flex items-center gap-1 rounded-md bg-brain px-2.5 py-1 text-xs font-medium text-brain-foreground hover:bg-brain/90 transition-colors disabled:opacity-50"
                  >
                    {addingRow ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                    Agregar fila
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
