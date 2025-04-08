import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from "@mui/material";
import React from "react";

interface Column {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
}

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface GenericTableProps<T> {
  data: T[];
  columns: Column[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  renderRow: (item: T) => React.ReactNode;
}

const GenericTable = <T,>({
  data,
  columns,
  sortConfig,
  onSort,
  renderRow,
}: GenericTableProps<T>) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align={col.align || "left"}
                sx={{
                  fontWeight: sortConfig.key === col.key ? "bold" : "normal",
                  color:
                    sortConfig.key === col.key ? "primary.main" : "inherit",
                }}
              >
                <TableSortLabel
                  active={sortConfig.key === col.key}
                  direction={sortConfig.direction}
                  onClick={() => onSort(col.key)}
                >
                  {col.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                No data found 😢
              </TableCell>
            </TableRow>
          ) : (
            data.map(renderRow)
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GenericTable;
