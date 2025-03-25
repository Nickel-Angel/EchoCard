import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import { SelectChangeEvent } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";

export interface DeckDataItem {
  deckIndex: number;
  name: string;
  tolearn: number;
  learning: number;
  toreview: number;
}

export interface ForecastDataItem {
  date: string;
  type: string;
  missed?: number;
  forecast?: number;
}

export interface reviewDataItem {
  date: string;
  reviewed: number;
}

interface StatisticHeaderProps {
  decks: DeckDataItem[];
  selectedDeckId: number;
  handleDeckChange: (e: SelectChangeEvent<number>) => void;
}

function StatisticHeader({
  decks,
  selectedDeckId,
  handleDeckChange,
}: StatisticHeaderProps) {
  return (
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
  );
}

function StatisticFooter() {
  const navigate = useNavigate();
  return (
    <>
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
      <Box sx={{ height: 80 }} />
    </>
  );
}

interface NoDataMessageProps {
  message?: string;
}

function NoDataMessage({ message = "没有数据" }: NoDataMessageProps) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export { StatisticHeader, StatisticFooter, NoDataMessage };
