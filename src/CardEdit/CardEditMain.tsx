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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

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
      return `${card.sortField} (英语单词)`;
    } else if (card.deckName === "数学公式") {
      return `请说出以下数学概念的定义：${card.sortField}`;
    } else {
      return `${card.sortField} (${card.deckName})`;
    }
  } else {
    // 对于选择题卡片，使用问题内容
    if (card.deckName === "历史事件") {
      return `下列哪一项正确描述了${card.sortField}这一历史事件？`;
    } else if (card.deckName === "编程概念") {
      return `在编程中，${card.sortField}的主要作用是什么？`;
    } else if (card.deckName === "地理知识") {
      return `关于${card.sortField}，下列说法正确的是：`;
    } else {
      return `关于${card.deckName}中的${card.sortField}，以下哪项是正确的？`;
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
            <TableCell>题目描述</TableCell>
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
              <TableCell align="center">{row.reviewTime}</TableCell>
              <TableCell align="center">{row.deckName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// 学习模式预览组件
const StudyModePreview = ({ card }: { card: CardData | null }) => {
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

  // 根据卡片所属牌组和模板类型生成相应内容
  const cardContent = (() => {
    // 文本卡片模板
    if (card.template === "文本卡片") {
      if (card.deckName === "英语单词") {
        return {
          front: `${card.sortField} (英语单词)`,
          back: `释义：这是一个英语单词的释义\n例句：This is an example sentence using the word ${card.sortField}.`,
        };
      } else if (card.deckName === "数学公式") {
        return {
          front: `请说出以下数学概念的定义：${card.sortField}`,
          back: `${card.sortField}的定义：\n这是一个重要的数学概念，用于解决特定类型的问题。`,
        };
      } else {
        return {
          front: `${card.sortField} (${card.deckName})`,
          back: `这是关于${card.deckName}中${card.sortField}的详细解释。`,
        };
      }
    }
    // 选择题卡片模板
    else {
      if (card.deckName === "历史事件") {
        return {
          question: `下列哪一项正确描述了${card.sortField}这一历史事件？`,
          options: `选项A: ${card.sortField}发生于20世纪初\n选项B: ${card.sortField}与工业革命有关\n选项C: ${card.sortField}导致了重大社会变革`,
          answer: "选项C: ${card.sortField}导致了重大社会变革",
          explanation: `${card.sortField}是一个重要的历史转折点，它确实导致了社会结构的显著变化。`,
        };
      } else if (card.deckName === "编程概念") {
        return {
          question: `在编程中，${card.sortField}的主要作用是什么？`,
          options: `选项A: 提高代码执行效率\n选项B: 简化复杂的数据结构\n选项C: 实现代码复用`,
          answer: "选项A: 提高代码执行效率",
          explanation: `${card.sortField}通常用于优化算法，减少计算资源的消耗，从而提高程序的整体性能。`,
        };
      } else if (card.deckName === "地理知识") {
        return {
          question: `关于${card.sortField}，下列说法正确的是：`,
          options: `选项A: 位于北半球\n选项B: 是世界上最大的大洲\n选项C: 拥有多样的气候带`,
          answer: "选项C: 拥有多样的气候带",
          explanation: `${card.sortField}由于其广阔的地理范围，跨越了多个纬度，因此形成了从热带到寒带的多样气候带。`,
        };
      } else {
        return {
          question: `关于${card.deckName}中的${card.sortField}，以下哪项是正确的？`,
          options: `选项A: ${card.sortField}的第一个特性\n选项B: ${card.sortField}的第二个特性\n选项C: ${card.sortField}的第三个特性`,
          answer: "选项A: ${card.sortField}的第一个特性",
          explanation: `${card.sortField}的第一个特性是最基本也是最重要的，它定义了${card.sortField}在${card.deckName}领域中的核心价值。`,
        };
      }
    }
  })();

  const [showBack, setShowBack] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 处理选项点击（仅用于选择题卡片）
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setShowBack(true);
  };

  // 处理显示背面（仅用于文本卡片）
  const handleToggleContent = () => {
    setShowBack(!showBack);
  };

  return (
    <Box
      sx={{
        height: "95%",
        bgcolor: "background.paper",
        borderRadius: 1,
        p: 2,
        boxShadow: 1,
        overflow: "auto",
      }}
    >
      <Card>
        <CardContent>
          {card.template === "文本卡片" ? (
            // 文本卡片模板
            <>
              <Typography
                variant="h5"
                component="div"
                gutterBottom
                sx={{ whiteSpace: "pre-line" }} // 保留换行符
              >
                {cardContent.front}
              </Typography>
              {showBack && (
                <Box
                  sx={{ my: 2, borderTop: 1, borderColor: "divider", pt: 2 }}
                >
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ whiteSpace: "pre-line" }} // 保留换行符
                  >
                    {cardContent.back}
                  </Typography>
                </Box>
              )}
              {!showBack && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleToggleContent}
                    fullWidth
                  >
                    显示背面
                  </Button>
                </Box>
              )}
            </>
          ) : (
            // 选择题卡片模板
            <>
              {/* 问题始终显示 */}
              <Typography variant="h5" component="div" gutterBottom>
                {cardContent.question}
              </Typography>

              {/* 选项始终显示，但可以点击 */}
              <Box sx={{ mb: 2 }}>
                {cardContent.options
                  .split("\n")
                  .map((option: string, index: number) => {
                    return (
                      <Button
                        key={index}
                        variant={
                          selectedOption === option ? "contained" : "outlined"
                        }
                        color={
                          selectedOption === option ? "primary" : "inherit"
                        }
                        onClick={() => handleOptionClick(option)}
                        sx={{
                          display: "block",
                          textAlign: "left",
                          width: "100%",
                          mb: 1,
                          textTransform: "none",
                        }}
                      >
                        <Typography variant="body1" component="div">
                          {option}
                        </Typography>
                      </Button>
                    );
                  })}
              </Box>

              {/* 答案和解析仅在显示背面时显示 */}
              {showBack && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    答案: {cardContent.answer}
                  </Typography>
                  {cardContent.explanation && (
                    <Typography variant="body1">
                      <strong>解析:</strong> {cardContent.explanation}
                    </Typography>
                  )}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// 编辑模式预览组件
const EditModePreview = ({ card }: { card: CardData | null }) => {
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
        <p>请选择一张卡片进行编辑</p>
      </Box>
    );
  }

  // 根据卡片所属牌组和模板类型生成相应的编辑字段
  const initialFieldValues = (() => {
    // 文本卡片模板
    if (card.template === "文本卡片") {
      if (card.deckName === "英语单词") {
        return {
          正面: `${card.sortField} (英语单词)`,
          背面: `释义：这是一个英语单词的释义\n例句：This is an example sentence using the word ${card.sortField}.`,
        };
      } else if (card.deckName === "数学公式") {
        return {
          正面: `请说出以下数学概念的定义：${card.sortField}`,
          背面: `${card.sortField}的定义：\n这是一个重要的数学概念，用于解决特定类型的问题。`,
        };
      } else {
        return {
          正面: `${card.sortField} (${card.deckName})`,
          背面: `这是关于${card.deckName}中${card.sortField}的详细解释。`,
        };
      }
    }
    // 选择题卡片模板
    else {
      if (card.deckName === "历史事件") {
        return {
          问题: `下列哪一项正确描述了${card.sortField}这一历史事件？`,
          选项: `选项A: ${card.sortField}发生于20世纪初\n选项B: ${card.sortField}与工业革命有关\n选项C: ${card.sortField}导致了重大社会变革`,
          答案: `选项C: ${card.sortField}导致了重大社会变革`,
          解析: `${card.sortField}是一个重要的历史转折点，它确实导致了社会结构的显著变化。`,
        };
      } else if (card.deckName === "编程概念") {
        return {
          问题: `在编程中，${card.sortField}的主要作用是什么？`,
          选项: `选项A: 提高代码执行效率\n选项B: 简化复杂的数据结构\n选项C: 实现代码复用`,
          答案: `选项A: 提高代码执行效率`,
          解析: `${card.sortField}通常用于优化算法，减少计算资源的消耗，从而提高程序的整体性能。`,
        };
      } else if (card.deckName === "地理知识") {
        return {
          问题: `关于${card.sortField}，下列说法正确的是：`,
          选项: `选项A: 位于北半球\n选项B: 是世界上最大的大洲\n选项C: 拥有多样的气候带`,
          答案: `选项C: 拥有多样的气候带`,
          解析: `${card.sortField}由于其广阔的地理范围，跨越了多个纬度，因此形成了从热带到寒带的多样气候带。`,
        };
      } else {
        return {
          问题: `关于${card.deckName}中的${card.sortField}，以下哪项是正确的？`,
          选项: `选项A: ${card.sortField}的第一个特性\n选项B: ${card.sortField}的第二个特性\n选项C: ${card.sortField}的第三个特性`,
          答案: `选项A: ${card.sortField}的第一个特性`,
          解析: `${card.sortField}的第一个特性是最基本也是最重要的，它定义了${card.sortField}在${card.deckName}领域中的核心价值。`,
        };
      }
    }
  })();

  const [fieldValues, setFieldValues] = useState(initialFieldValues);

  // 处理字段值变化
  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // 保存修改
  const handleSave = () => {
    alert("保存成功！在实际应用中，这里会调用API保存修改");
  };

  return (
    <Box
      sx={{
        height: "95%",
        bgcolor: "background.paper",
        borderRadius: 1,
        p: 2,
        boxShadow: 1,
        overflow: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        编辑卡片
      </Typography>
      <Box component="form" sx={{ mt: 2 }}>
        {Object.entries(fieldValues).map(([fieldName, value]) => (
          <TextField
            key={fieldName}
            label={fieldName}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            multiline={fieldName === "选项" || fieldName === "解析"}
            rows={fieldName === "选项" || fieldName === "解析" ? 4 : 1}
            fullWidth
            margin="normal"
            variant="outlined"
          />
        ))}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ mt: 2 }}
        >
          保存修改
        </Button>
      </Box>
    </Box>
  );
};

// 卡片预览组件（包含模式切换）
const CardPreview = ({ card }: { card: CardData | null }) => {
  // 预览模式状态：study - 学习模式，edit - 编辑模式
  const [previewMode, setPreviewMode] = useState<"study" | "edit">("study");

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
          {previewMode === "study" ? "预览模式" : "编辑模式"}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() =>
            setPreviewMode(previewMode === "study" ? "edit" : "study")
          }
        >
          切换到{previewMode === "study" ? "编辑" : "预览"}模式
        </Button>
      </Box>

      {previewMode === "study" ? (
        <StudyModePreview card={card} />
      ) : (
        <EditModePreview card={card} />
      )}
    </Box>
  );
};

function CardEditMain() {
  const navigate = useNavigate();

  // TODO: 从后端获取卡片数据
  const allCards: CardData[] = [
    createCardData(1, "A001", "文本卡片", "2023-06-15", "英语单词"),
    createCardData(2, "B002", "选择题卡片", "2023-06-16", "历史事件"),
    createCardData(3, "C003", "文本卡片", "2023-06-17", "数学公式"),
    createCardData(4, "D004", "选择题卡片", "2023-06-18", "编程概念"),
    createCardData(5, "非洲", "选择题卡片", "2023-06-19", "地理知识"),
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
