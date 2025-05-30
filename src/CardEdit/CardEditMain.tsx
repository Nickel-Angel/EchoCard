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
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import CardEditHeader, { FilterOptions, DeckOption } from "./CardEditHeader";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";

// 定义卡片数据接口
interface CardData {
  cardId: number;
  content: string; // 卡片完整内容
  summary: string; // 卡片概要，从卡片内容中提取的前几个字符
  template: string;
  deckName: string;
}

function createCardData(
  cardId: number,
  content: string,
  template: string,
  deckName: string
): CardData {
  // 从卡片内容中提取概要
  const summary = extractSummary(content);
  return { cardId, content, summary, template, deckName };
}

// 从卡片内容中提取概要的辅助函数
const extractSummary = (content: string, maxLength: number = 30): string => {
  if (!content) return "";
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};

// 截断文本并添加省略号的辅助函数
const truncateText = (text: string, maxLength: number = 30): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// 获取卡片的题目描述
const getCardQuestion = (card: CardData): string => {
  // 根据卡片模板类型获取对应的题目内容
  if (card.template === "文本卡片") {
    // 对于文本卡片，使用正面内容
    if (card.deckName === "英语单词") {
      return `What is the meaning of "${card.content}"?`;
    } else if (card.deckName === "数学公式") {
      return `请说出以下数学概念的定义：${card.content}`;
    } else {
      return `${card.content} (${card.deckName})`;
    }
  } else {
    // 对于选择题卡片，使用问题内容
    if (card.deckName === "历史事件") {
      return `关于${card.content}，下列哪一项描述是正确的？`;
    } else if (card.deckName === "编程概念") {
      return `在编程中，${card.content}的主要作用是什么？`;
    } else if (card.deckName === "地理知识") {
      return `关于${card.content}，下列说法正确的是：`;
    } else {
      return `关于${card.deckName}中的${card.content}，以下哪项是正确的？`;
    }
  }
};

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
            <TableCell>卡片内容</TableCell>
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
                {truncateText(getCardQuestion(row))}
              </TableCell>
              <TableCell align="center">{row.template}</TableCell>
              <TableCell align="center">{row.deckName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// 导入拆分后的组件
import PreviewModeComponent from "./PreviewModeComponent";
import EditModeComponent from "./EditModeComponent";

// 卡片预览组件（包含模式切换）
const CardPreview = ({ card }: { card: CardData | null }) => {
  // 预览模式状态：preview - 预览模式，edit - 编辑模式
  const [previewMode, setPreviewMode] = useState<"preview" | "edit">("preview");

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
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">
          {previewMode === "preview" ? "预览模式" : "编辑模式"}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() =>
            setPreviewMode(previewMode === "preview" ? "edit" : "preview")
          }
        >
          切换到{previewMode === "preview" ? "编辑" : "预览"}模式
        </Button>
      </Box>

      {previewMode === "preview" ? (
        <PreviewModeComponent card={card} />
      ) : (
        <EditModeComponent card={card} />
      )}
    </Box>
  );
};

function CardEditMain() {
  const navigate = useNavigate();

  // TODO: 从后端获取卡片数据
  const allCards: CardData[] = [
    createCardData(1, "Abandon - to leave someone or something permanently", "文本卡片", "英语单词"),
    createCardData(2, "第二次世界大战是1939年至1945年间发生的全球性军事冲突", "选择题卡片", "历史事件"),
    createCardData(3, "微积分基本定理阐述了微分和积分之间的关系，是微积分学中最重要的定理之一", "文本卡片", "数学公式"),
    createCardData(4, "闭包是指一个函数和对其周围状态（词法环境）的引用捆绑在一起形成的组合", "选择题卡片", "编程概念"),
    createCardData(5, "非洲大陆板块是地球上第二大大陆板块，面积约3020万平方公里", "选择题卡片", "地理知识"),
  ];

  // 跳转到添加卡片页面
  const handleAddCard = () => {
    navigate("/card-add");
  };

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
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minWidth: 320,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <CardEditHeader
          deckOptions={deckOptions}
          templateOptions={templateOptions}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/template-add")}
            sx={{ ml: 2, borderRadius: 2, minWidth: 120 }}
          >
            添加模板
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddCard}
            sx={{ ml: 2, borderRadius: 2, minWidth: 120 }}
          >
            添加卡片
          </Button>
        </Box>
      </Box>
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
