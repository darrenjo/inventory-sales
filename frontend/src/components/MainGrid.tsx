import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import StatCard, { StatCardProps } from "./StatCard";
import Copyright from "../internals/components/Copyright";
import axios from "axios";
import SessionsChart from "./SessionsChart";

const API_URL = import.meta.env.VITE_API_URL;

export default function MainGrid() {
  const [statData, setStatData] = useState<StatCardProps[]>([]);

  useEffect(() => {
    const fetchSalesSummary = async () => {
      try {
        const response = await axios.get(`${API_URL}/sales/summary`, {
          params: { range: "daily" },
        });

        const salesData = response.data.data;

        const valuesOnly = salesData.map((entry: any) =>
          Number(entry.total_sales)
        );
        const lastEntry = salesData[salesData.length - 1];

        const newCard: StatCardProps = {
          title: "Daily Sales",
          value: `Rp. ${parseInt(lastEntry.total_sales).toLocaleString()}`,
          interval: "Today",
          trend: "up", // You can add real comparison logic here
          data: valuesOnly,
        };

        setStatData([newCard]);
      } catch (error) {
        console.error("Failed to fetch sales summary:", error);
      }
    };

    fetchSalesSummary();
  }, []);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {statData.map((card, index) => (
          <Grid key={index} item xs={12} sm={6} lg={3}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <SessionsChart />
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
