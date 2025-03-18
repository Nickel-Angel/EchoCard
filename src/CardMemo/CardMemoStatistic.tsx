import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DeckDataItem {
  deckIndex: number;
  name: string;
  tolearn: number;
  learning: number;
  toreview: number;
}

interface ForecastDataItem {
  date: string;
  type: string;
  missed?: number;
  forecast?: number;
}

interface reviewDataItem {
  date: string;
  reviewed: number;
}

// 模拟牌组数据 - 实际应用中应从后端获取
const generateDecks = (): DeckDataItem[] => [
  { deckIndex: 0, name: "全部", tolearn: 0, learning: 0, toreview: 0 },
  {
    deckIndex: 1,
    name: "Frozen yoghurt",
    tolearn: 159,
    learning: 6,
    toreview: 24,
  },
  {
    deckIndex: 2,
    name: "Ice cream sandwich",
    tolearn: 237,
    learning: 9,
    toreview: 37,
  },
  { deckIndex: 3, name: "Eclair", tolearn: 262, learning: 16, toreview: 24 },
  { deckIndex: 4, name: "Cupcake", tolearn: 305, learning: 3, toreview: 67 },
  {
    deckIndex: 5,
    name: "Gingerbread",
    tolearn: 356,
    learning: 16,
    toreview: 49,
  },
];

// 模拟数据 - 实际应用中应从后端获取
const generateForecastData = (): ForecastDataItem[] => {
  const today = new Date();
  const data = [];

  // 过去7天的数据
  for (let i = 7; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      missed: Math.floor(Math.random() * 10),
      type: "past",
    });
  }

  // 今天和未来7天的数据
  for (let i = 0; i < 8; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      forecast: Math.floor(Math.random() * 20 + 5),
      type: i === 0 ? "today" : "future",
    });
  }

  return data;
};

const generateStatusData = () => [
  { name: "未学习", value: 1, color: "#8884d8" },
  { name: "学习中", value: 1, color: "#82ca9d" },
  { name: "已掌握", value: 1, color: "#ffc658" },
  { name: "待复习", value: 1, color: "#ff8042" },
];

const generateReviewData = (): reviewDataItem[] => {
  const today = new Date();
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      reviewed: Math.floor(Math.random() * 30 + 10),
    });
  }

  return data;
};

function CardMemoStatistic() {
  const [decks] = useState(generateDecks());
  const [selectedDeckId, setSelectedDeckId] = useState(0); // 默认选择"全部"
  const [forecastData, setForecastData] = useState(generateForecastData());
  const [statusData, setStatusData] = useState(generateStatusData());
  const [reviewData, setReviewData] = useState(generateReviewData());
  const navigate = useNavigate();

  const handleDeckChange = (e: SelectChangeEvent<number>) => {
    if (e.target.value === null) {
      console.log("牌组数据为空");
      return;
    }
    setSelectedDeckId(Number(e.target.value));
    // TODO: 根据选择的牌组ID从后端获取相应的统计数据
    // 这里使用模拟数据进行演示
    if (e.target.value === 0) {
      // 全部牌组数据
      setForecastData(generateForecastData());
      setStatusData(generateStatusData());
      setReviewData(generateReviewData());
    } else {
      // 特定牌组数据 - 这里简单修改一下数据以示区别
      const multiplier = Number(e.target.value) * 0.2 + 0.5;
      setForecastData(
        generateForecastData().map((item) => ({
          ...item,
          missed: item.missed ? Math.floor(item.missed * multiplier) : 0,
          forecast: item.forecast ? Math.floor(item.forecast * multiplier) : 0,
        }))
      );
      setStatusData(
        generateStatusData().map((item) => ({
          ...item,
          value: Math.floor(item.value * multiplier),
        }))
      );
      setReviewData(
        generateReviewData().map((item) => ({
          ...item,
          reviewed: Math.floor(item.reviewed * multiplier),
        }))
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
      {/* 固定在顶部的导航栏 */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          backgroundColor: "background.paper",
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography variant="h5" component="h1">
          学习统计
        </Typography>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="deck-select-label">选择牌组</InputLabel>
          <Select
            labelId="deck-select-label"
            id="deck-select"
            value={selectedDeckId}
            label="选择牌组"
            onChange={handleDeckChange}
            size="small"
          >
            {decks.map((deck) => (
              <MenuItem
                key={deck.deckIndex}
                value={deck.deckIndex}
                sx={deck.deckIndex === 0 ? { fontWeight: "bold" } : {}}
              >
                {deck.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* 复习预测图表 */}
          <Grid size={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  复习卡片数量预测
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  显示过去未复习的卡片和未来需要复习的卡片数量
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={forecastData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="missed"
                        name="未复习"
                        fill="#ff8042"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="forecast"
                        name="待复习"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 卡片状态饼图 */}
          <Grid size={12}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  卡片学习状态分布
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  各学习状态卡片占比
                </Typography>
                <Box
                  sx={{
                    height: 300,
                    display: "flex",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        activeShape={false}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}张`, "数量"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 每日复习条形图 */}
          <Grid size={12}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  近期复习情况
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  过去7天每日复习卡片数量
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reviewData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="reviewed"
                        name="已复习"
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* 固定在底部的导航栏 */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: "background.paper",
          py: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1200,
            px: 4,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              navigate("/");
            }}
            sx={{ minWidth: 120 }}
          >
            返回主页
          </Button>
        </Box>
      </Box>

      {/* 添加底部空间，防止内容被底部导航栏遮挡 */}
      <Box sx={{ height: 80 }} />
    </Box>
  );
}

export default CardMemoStatistic;
