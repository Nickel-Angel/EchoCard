import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";
import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import CardEditHeader, { FilterOptions, DeckOption } from "./CardEditHeader";

// 定义卡片数据接口
interface CardData {
  cardId: number;
  sortField: string;
  template: string;
  reviewTime: string;
  deckName: string;
}

function createCardData(
  cardId: number,
  sortField: string,
  template: string,
  reviewTime: string,
  deckName: string
): CardData {
  return { cardId, sortField, template, reviewTime, deckName };
}

// 卡片表格组件
const CardTable = ({
  rows,
  onCardSelect,
}: {
  rows: CardData[];
  onCardSelect: (card: CardData) => void;
}) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 500 }} size="small" aria-label="card table">
        <TableHead>
          <TableRow>
            <TableCell>排序字段</TableCell>
            <TableCell align="center">卡片模板</TableCell>
            <TableCell align="center">预计复习时间</TableCell>
            <TableCell align="center">所属牌组</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row: CardData) => (
            <TableRow
              key={row.cardId}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                cursor: "pointer",
              }}
              onClick={() => onCardSelect(row)}
              hover
            >
              <TableCell component="th" scope="row">
                {row.sortField}
              </TableCell>
              <TableCell align="center">{row.template}</TableCell>
              <TableCell align="center">{row.reviewTime}</TableCell>
              <TableCell align="center">{row.deckName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// 卡片预览组件
const CardPreview = ({ card }: { card: CardData | null }) => {
  if (!card) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.paper",
          borderRadius: 1,
          p: 2,
          boxShadow: 1,
        }}
      >
        <p>请选择一张卡片进行预览</p>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "95%",
        bgcolor: "background.paper",
        borderRadius: 1,
        p: 2,
        boxShadow: 1,
      }}
    >
      <h3>卡片预览</h3>
      <p>
        <strong>排序字段:</strong> {card.sortField}
      </p>
      <p>
        <strong>卡片模板:</strong> {card.template}
      </p>
      <p>
        <strong>预计复习时间:</strong> {card.reviewTime}
      </p>
      <p>
        <strong>所属牌组:</strong> {card.deckName}
      </p>
      {/* 这里可以根据实际需求添加更多卡片内容的预览 */}
    </Box>
  );
};

function CardEditMain() {
  // TODO: 从后端获取卡片数据
  const allCards: CardData[] = [
    createCardData(1, "A001", "基础模板", "2023-06-15", "英语单词"),
    createCardData(2, "B002", "图文模板", "2023-06-16", "历史事件"),
    createCardData(3, "C003", "问答模板", "2023-06-17", "数学公式"),
    createCardData(4, "D004", "填空模板", "2023-06-18", "编程概念"),
    createCardData(5, "E005", "多选模板", "2023-06-19", "地理知识"),
  ];

  // 选中的卡片状态
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // 筛选条件状态
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    decks: [],
    statuses: [],
    templates: [],
  });

  // 从卡片数据中提取牌组选项
  const deckOptions: DeckOption[] = useMemo(() => {
    const uniqueDecks = new Set(allCards.map((card) => card.deckName));
    return Array.from(uniqueDecks).map((name, index) => ({
      id: index + 1,
      name,
    }));
  }, [allCards]);

  // 从卡片数据中提取模板选项
  const templateOptions: string[] = useMemo(() => {
    const uniqueTemplates = new Set(allCards.map((card) => card.template));
    return Array.from(uniqueTemplates);
  }, [allCards]);

  // 处理筛选条件变化
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
  };

  // 根据筛选条件过滤卡片
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      // 如果没有选择任何筛选条件，则显示所有卡片
      const deckMatch =
        filterOptions.decks.length === 0 ||
        filterOptions.decks.some(
          (deckId) => deckOptions[deckId - 1]?.name === card.deckName
        );

      const templateMatch =
        filterOptions.templates.length === 0 ||
        filterOptions.templates.includes(card.template);

      // 注意：这里简化处理了学习状态筛选，实际应用中应根据卡片的真实学习状态进行筛选
      // 这里假设所有卡片都是"未学习"状态
      const statusMatch =
        filterOptions.statuses.length === 0 ||
        filterOptions.statuses.includes("未学习");

      return deckMatch && templateMatch && statusMatch;
    });
  }, [allCards, filterOptions, deckOptions]);

  // 处理卡片选择
  const handleCardSelect = (card: CardData) => {
    setSelectedCard(card);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardEditHeader
        deckOptions={deckOptions}
        templateOptions={templateOptions}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
      />
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid size={5} sx={{ md: 7 }}>
          <CardTable rows={filteredCards} onCardSelect={handleCardSelect} />
        </Grid>
        <Grid size={7} sx={{ minHeight: "400px" }}>
          <CardPreview card={selectedCard} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default CardEditMain;
