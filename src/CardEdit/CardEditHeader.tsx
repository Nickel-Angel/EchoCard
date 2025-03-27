import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import { SelectChangeEvent } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

// 定义牌组数据接口
export interface DeckOption {
  id: number;
  name: string;
}

// 定义学习状态选项
export type LearningStatus = "未学习" | "学习中" | "待复习";

// 定义筛选条件接口
export interface FilterOptions {
  decks: number[];
  statuses: LearningStatus[];
  templates: string[];
}

interface CardEditHeaderProps {
  deckOptions: DeckOption[];
  templateOptions: string[];
  filterOptions: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// 学习状态选项
const statusOptions: LearningStatus[] = ["未学习", "学习中", "待复习"];

function CardEditHeader({
  deckOptions,
  templateOptions,
  filterOptions,
  onFilterChange,
}: CardEditHeaderProps) {
  const navigate = useNavigate();

  // 处理牌组选择变化
  const handleDeckChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value as number[];
    onFilterChange({
      ...filterOptions,
      decks: value,
    });
  };

  // 处理学习状态选择变化
  const handleStatusChange = (event: SelectChangeEvent<LearningStatus[]>) => {
    const value = event.target.value as LearningStatus[];
    onFilterChange({
      ...filterOptions,
      statuses: value,
    });
  };

  // 处理卡片模板选择变化
  const handleTemplateChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    onFilterChange({
      ...filterOptions,
      templates: value,
    });
  };

  return (
    <Box
      sx={{
        py: 2,
        mb: 2,
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
        gap: 2,
      }}
    >
      <Typography variant="h5" component="h1">
        卡片编辑
      </Typography>

      <Button onClick={() => navigate("/template-add")}>添加模板</Button>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          width: { xs: "100%", md: "auto" },
        }}
      >
        {/* 牌组筛选 */}
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="deck-select-label">所属牌组</InputLabel>
          <Select
            labelId="deck-select-label"
            id="deck-select"
            multiple
            value={filterOptions.decks}
            onChange={handleDeckChange}
            input={<OutlinedInput label="所属牌组" />}
            renderValue={(selected: number[]) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => {
                  const deck = deckOptions.find((d) => d.id === value);
                  return (
                    <Chip
                      key={value}
                      label={deck ? deck.name : "未知"}
                      size="small"
                    />
                  );
                })}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {deckOptions.map((deck) => (
              <MenuItem key={deck.id} value={deck.id}>
                <Checkbox checked={filterOptions.decks.indexOf(deck.id) > -1} />
                <ListItemText primary={deck.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 学习状态筛选 */}
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="status-select-label">学习状态</InputLabel>
          <Select
            labelId="status-select-label"
            id="status-select"
            multiple
            value={filterOptions.statuses}
            onChange={handleStatusChange}
            input={<OutlinedInput label="学习状态" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                <Checkbox
                  checked={filterOptions.statuses.indexOf(status) > -1}
                />
                <ListItemText primary={status} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 卡片模板筛选 */}
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="template-select-label">卡片模板</InputLabel>
          <Select
            labelId="template-select-label"
            id="template-select"
            multiple
            value={filterOptions.templates}
            onChange={handleTemplateChange}
            input={<OutlinedInput label="卡片模板" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {templateOptions.map((template) => (
              <MenuItem key={template} value={template}>
                <Checkbox
                  checked={filterOptions.templates.indexOf(template) > -1}
                />
                <ListItemText primary={template} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

export default CardEditHeader;
