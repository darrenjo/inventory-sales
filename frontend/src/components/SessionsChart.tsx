import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { LineChart } from "@mui/x-charts/LineChart";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function SessionsChart() {
  const theme = useTheme();
  const [xAxisData, setXAxisData] = React.useState<string[]>([]);
  const [seriesData, setSeriesData] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/sales/category-summary`, {
          params: { range: "monthly" },
        });

        const { data } = res.data;

        // Group by category
        const grouped: Record<string, Record<string, number>> = {};
        const dateSet = new Set<string>();

        data.forEach((item: any) => {
          const month = new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
          dateSet.add(month);
          if (!grouped[item.category]) grouped[item.category] = {};
          grouped[item.category][month] = Number(item.total_sales);
        });

        const dates = Array.from(dateSet).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        const builtSeries = Object.entries(grouped).map(
          ([category, values], i) => ({
            id: category,
            label: category,
            showMark: false,
            curve: "linear",
            stack: "total",
            area: true,
            stackOrder: "ascending",
            data: dates.map((date) => values[date] || 0),
          })
        );

        setXAxisData(dates);
        setSeriesData(builtSeries);
      } catch (error) {
        console.error("Error fetching session chart data:", error);
      }
    };

    fetchData();
  }, []);

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Sessions
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: "center", sm: "flex-start" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {/* Optionally total the values if needed */}
              {seriesData.length > 0
                ? seriesData
                    .map((s) =>
                      s.data.reduce((a: number, b: number) => a + b, 0)
                    )
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()
                : "0"}
            </Typography>
            <Chip size="small" color="success" label="+35%" />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Sales per category for recent months
          </Typography>
        </Stack>

        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: "point",
              data: xAxisData,
            },
          ]}
          series={seriesData}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          sx={{
            "& .MuiAreaElement-series-organic": {
              fill: "url('#organic')",
            },
            "& .MuiAreaElement-series-referral": {
              fill: "url('#referral')",
            },
            "& .MuiAreaElement-series-direct": {
              fill: "url('#direct')",
            },
          }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        >
          <AreaGradient color={theme.palette.primary.dark} id="organic" />
          <AreaGradient color={theme.palette.primary.main} id="referral" />
          <AreaGradient color={theme.palette.primary.light} id="direct" />
        </LineChart>
      </CardContent>
    </Card>
  );
}
