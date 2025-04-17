import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
}

const LogTable = ({ logs }: { logs: LogEntry[] }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Timestamp</strong>
            </TableCell>
            <TableCell>
              <strong>Level</strong>
            </TableCell>
            <TableCell>
              <strong>Message</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow
              key={index}
                sx={{
                  bgcolor:
                    log.level === "error"
                      ? "#4a040f"
                      : log.level === "warn"
                      ? "#575003"
                      : log.level === "req"
                      ? "#04094a"
                      : undefined,
                }}
            >
              <TableCell>{log.timestamp}</TableCell>
              <TableCell>{log.level.toUpperCase()}</TableCell>
              <TableCell>{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LogTable;
