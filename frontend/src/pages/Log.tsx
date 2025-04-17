import { useEffect, useState } from "react";
import { Box, Tab, Tabs, Typography, Divider } from "@mui/material";
import LogTable from "../components/LogTable";
import axios from "axios";

const logLevels = ["info", "error", "warn", "req", "debug"];

const API_URL = import.meta.env.VITE_API_URL;

const Logs = () => {
  const [level, setLevel] = useState("info");
  const [logs, setLogs] = useState([]);
  const [logCounts, setLogCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = async (selectedLevel: string) => {
    try {
      const res = await axios.get(`${API_URL}/logs/${selectedLevel}`);

      // Filter data yang level-nya sesuai dengan tab yang dipilih
      const filtered = res.data
        .filter((log: any) => log.level === selectedLevel)
        .sort((a: any, b: any) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeB - timeA;
        }); // Sorting: terbaru di atas

      setLogs(filtered);
    } catch (err) {
      console.error("Failed to fetch Logs:", err);
    }
  };

  useEffect(() => {
    const fetchLogCounts = async () => {
      try {
        const results = await Promise.all(
          logLevels.map((lvl) => axios.get(`${API_URL}/logs/${lvl}`))
        );
        const counts: Record<string, number> = {};
        results.forEach((res, idx) => {
          // Optional: filter by level lagi kalau file-nya campur
          const data = res.data.filter(
            (log: any) => log.level === logLevels[idx]
          );
          counts[logLevels[idx]] = data.length;
        });
        setLogCounts(counts);
      } catch (err) {
        console.error("Failed to fetch log counts:", err);
      }
    };

    fetchLogCounts();
  }, []);

  useEffect(() => {
    fetchLogs(level);
  }, [level]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Log Viewer
      </Typography>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 3 }} />

      <Tabs value={level} onChange={(_, newVal) => setLevel(newVal)}>
        {logLevels.map((lvl) => (
          <Tab
            key={lvl}
            label={`${lvl.toUpperCase()} (${logCounts[lvl] ?? "..."})`}
            value={lvl}
          />
        ))}
      </Tabs>

      <Box mt={2}>
        <Box mt={2} mb={2}>
          <input
            type="text"
            placeholder="Search in messages..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              padding: "8px",
              width: "100%",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
        </Box>
        <LogTable
          logs={logs.filter((log: any) =>
            log.message.toLowerCase().includes(searchQuery.toLowerCase())
          )}
        />
      </Box>
    </Box>
  );
};

export default Logs;
