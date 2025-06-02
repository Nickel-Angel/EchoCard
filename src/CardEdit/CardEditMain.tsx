import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";
import { useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import CardEditHeader, { FilterOptions, DeckOption } from "./CardEditHeader";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { CardData, filterCards } from "@/api/Card";
import { getAllTemplates } from "@/api/Template";
import { fetchDecks, DeckData } from "@/api/Deck";
import CircularProgress from "@mui/material/CircularProgress";
import CardPreview from "@/CardEdit/CardPreview";

// 定义卡片编辑专属的卡片数据视图接口
export interface CardDataEditView {
  cardId: number;
  content: string; // 卡片完整内容
  summary: string; // 卡片概要，从卡片内容中提取的前几个字符
  template: string;
  templateId: number;
  deckName: string;
  deckId: number;
  dueDate?: Date; // 预计复习时间
  templateFieldsContent: string[]; // 模板字段内容
}

function createCardDataEditView(
  cardId: number,
  content: string,
  templateId: number,
  template: string,
  deckId: number,
  deckName: string,
  dueDate?: Date,
  templateFieldsContent: string[] = []
): CardDataEditView {
  // 从卡片内容中提取概要
  const summary = extractSummary(content);
  return {
    cardId,
    content,
    summary,
    templateId,
    template,
    deckId,
    deckName,
    dueDate,
    templateFieldsContent,
  };
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
const getCardQuestion = (card: CardDataEditView): string => {
  // 如果没有模板字段内容，则返回卡片内容
  if (!card.templateFieldsContent || card.templateFieldsContent.length === 0) {
    return card.content;
  }

  return card.templateFieldsContent[0] || card.content;
};

// 卡片表格组件
const CardTable = ({
  rows,
  onCardSelect,
  isLoading,
}: {
  rows: CardDataEditView[];
  onCardSelect: (card: CardDataEditView) => void;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Typography variant="body1">没有找到符合条件的卡片</Typography>
      </Box>
    );
  }

  /**
   * 自定义日期格式化函数
   * @param date 要格式化的日期对象
   * @param formatStr 格式化字符串，例如 "yyyy-MM-dd"
   * @returns 格式化后的日期字符串
   */
  const formatDate = (date: Date, formatStr: string): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() 返回 0-11
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // 补零函数
    const padZero = (num: number): string => {
      return num < 10 ? `0${num}` : `${num}`;
    };

    // 替换格式化字符串中的占位符
    return formatStr
      .replace(/yyyy/g, `${year}`)
      .replace(/MM/g, padZero(month))
      .replace(/dd/g, padZero(day))
      .replace(/HH/g, padZero(hours))
      .replace(/mm/g, padZero(minutes))
      .replace(/ss/g, padZero(seconds));
  };

  // 格式化日期显示
  const formatDueDate = (date?: Date) => {
    if (!date) return "未设置";
    return formatDate(date, "yyyy-MM-dd");
  };

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
          {rows.map((row: CardDataEditView) => (
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
              <TableCell align="center">{formatDueDate(row.dueDate)}</TableCell>
              <TableCell align="center">{row.deckName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// 将后端卡片数据转换为前端卡片数据的函数
const convertBackendCardToFrontend = (
  backendCard: CardData,
  templateMap: Map<number, string>,
  deckMap: Map<number, DeckOption>
): CardDataEditView => {
  // 从模板字段内容中提取第一个字段作为卡片内容
  const content = backendCard.template_fields_content[0] || "";
  // 获取模板名称
  const template = templateMap.get(backendCard.template_id) || "未知模板";
  // 获取牌组信息
  const deck = deckMap.get(backendCard.deck_id);
  const deckName = deck ? deck.name : "未知牌组";
  const deckId = backendCard.deck_id;

  // 如果有due日期，转换为Date对象
  let dueDate: Date | undefined = undefined;
  if (backendCard.due) {
    dueDate = new Date(backendCard.due);
  }

  return createCardDataEditView(
    backendCard.card_id,
    content,
    backendCard.template_id,
    template,
    deckId,
    deckName,
    dueDate,
    backendCard.template_fields_content
  );
};

// 状态位过滤器映射
const statusBitMap: Record<string, number> = {
  未学习: 1, // 0001
  学习中: 2, // 0010
  待复习: 4, // 0100
};

function CardEditMain() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cards, setCards] = useState<CardDataEditView[]>([]);

  // 模板和牌组映射数据
  const [templateMap, setTemplateMap] = useState<Map<number, string>>(
    new Map()
  );
  const [deckMap, setDeckMap] = useState<Map<number, DeckOption>>(new Map());
  const [templates, setTemplates] = useState<{ id: number; name: string }[]>(
    []
  );
  const [decks, setDecks] = useState<DeckData[]>([]);

  // 选中的卡片状态 - 使用原始的 CardData 类型
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // 筛选条件状态
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    decks: [],
    statuses: [],
    templates: [],
  });

  // 从后端获取模板和牌组数据
  useEffect(() => {
    const fetchTemplatesAndDecks = async () => {
      setIsLoading(true);
      try {
        // 获取所有模板
        const templatesData = await getAllTemplates();
        setTemplates(templatesData);

        // 创建模板ID到模板名称的映射
        const templateMapData = new Map<number, string>();
        templatesData.forEach((template) => {
          templateMapData.set(template.id, template.name);
        });
        setTemplateMap(templateMapData);

        // 获取所有牌组
        const decksData = await fetchDecks();
        setDecks(decksData);

        // 创建牌组ID到牌组信息的映射
        const deckMapData = new Map<number, DeckOption>();
        decksData.forEach((deck) => {
          deckMapData.set(deck.deckId, {
            id: deck.deckId,
            name: deck.deckName,
          });
        });
        setDeckMap(deckMapData);
      } catch (error) {
        console.error("获取模板和牌组数据失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplatesAndDecks();
  }, []);

  // 从牌组数据中提取牌组选项
  const deckOptions: DeckOption[] = useMemo(() => {
    return decks.map((deck) => ({
      id: deck.deckId,
      name: deck.deckName,
    }));
  }, [decks]);

  // 从模板数据中提取模板选项
  const templateOptions: string[] = useMemo(() => {
    return templates.map((template) => template.name);
  }, [templates]);

  // 处理筛选条件变化
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
  };

  // 存储原始的后端卡片数据，用于在选择卡片时获取完整的 CardData
  const [backendCardsMap, setBackendCardsMap] = useState<Map<number, CardData>>(
    new Map()
  );

  // 根据筛选条件获取卡片
  useEffect(() => {
    const fetchFilteredCards = async () => {
      // 如果模板和牌组数据还未加载完成，则不进行筛选
      if (templates.length === 0 || decks.length === 0) {
        return;
      }

      setIsLoading(true);

      // 转换模板名称为模板ID
      const templateIds = filterOptions.templates
        .map((templateName) => {
          const template = templates.find((t) => t.name === templateName);
          return template ? template.id : -1;
        })
        .filter((id) => id !== -1);

      // 获取选中的牌组ID
      const deckIds = filterOptions.decks;

      // 计算状态位过滤器
      let statusBitFilter = 0;
      filterOptions.statuses.forEach((status) => {
        statusBitFilter |= statusBitMap[status] || 0;
      });

      // 如果没有选择任何筛选条件，则使用所有模板和牌组
      const finalTemplateIds =
        templateIds.length > 0 ? templateIds : templates.map((t) => t.id);
      const finalDeckIds =
        deckIds.length > 0 ? deckIds : decks.map((d) => d.deckId);
      const finalStatusBitFilter = statusBitFilter > 0 ? statusBitFilter : 7; // 7 = 0111，表示所有状态

      try {
        const backendCards = await filterCards(
          finalTemplateIds,
          finalDeckIds,
          finalStatusBitFilter
        );

        if (backendCards) {
          // 创建一个 Map 用于存储原始的后端卡片数据，以便在选择卡片时获取完整的 CardData
          const cardsMap = new Map<number, CardData>();
          backendCards.forEach((card) => {
            cardsMap.set(card.card_id, card);
          });
          setBackendCardsMap(cardsMap);

          // 将后端卡片数据转换为前端卡片数据（用于表格显示）
          const frontendCards = backendCards.map((card) =>
            convertBackendCardToFrontend(card, templateMap, deckMap)
          );
          setCards(frontendCards);
        } else {
          setBackendCardsMap(new Map());
          setCards([]);
        }
      } catch (error) {
        console.error("获取卡片失败:", error);
        setBackendCardsMap(new Map());
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredCards();
  }, [filterOptions, templates, decks, templateMap, deckMap]);

  // 跳转到添加卡片页面
  const handleAddCard = () => {
    navigate("/card-add");
  };

  // 处理卡片选择 - 使用原始的 CardData 对象
  const handleCardSelect = (card: CardDataEditView) => {
    // 从 backendCardsMap 中获取对应的原始 CardData 对象
    const backendCard = backendCardsMap.get(card.cardId);
    if (backendCard) {
      setSelectedCard(backendCard);
    }
  };

  // 处理卡片删除后的回调
  const handleCardDeleted = () => {
    // 清空选中的卡片
    setSelectedCard(null);
    // 重新获取卡片列表
    const fetchFilteredCards = async () => {
      // 如果模板和牌组数据还未加载完成，则不进行筛选
      if (templates.length === 0 || decks.length === 0) {
        return;
      }

      setIsLoading(true);

      // 转换模板名称为模板ID
      const templateIds = filterOptions.templates
        .map((templateName) => {
          const template = templates.find((t) => t.name === templateName);
          return template ? template.id : -1;
        })
        .filter((id) => id !== -1);

      // 获取选中的牌组ID
      const deckIds = filterOptions.decks;

      // 计算状态位过滤器
      let statusBitFilter = 0;
      filterOptions.statuses.forEach((status) => {
        statusBitFilter |= statusBitMap[status] || 0;
      });

      // 如果没有选择任何筛选条件，则使用所有模板和牌组
      const finalTemplateIds =
        templateIds.length > 0 ? templateIds : templates.map((t) => t.id);
      const finalDeckIds =
        deckIds.length > 0 ? deckIds : decks.map((d) => d.deckId);
      const finalStatusBitFilter = statusBitFilter > 0 ? statusBitFilter : 7; // 7 = 0111，表示所有状态

      try {
        const backendCards = await filterCards(
          finalTemplateIds,
          finalDeckIds,
          finalStatusBitFilter
        );

        if (backendCards) {
          // 创建一个 Map 用于存储原始的后端卡片数据，以便在选择卡片时获取完整的 CardData
          const cardsMap = new Map<number, CardData>();
          backendCards.forEach((card) => {
            cardsMap.set(card.card_id, card);
          });
          setBackendCardsMap(cardsMap);

          // 将后端卡片数据转换为前端卡片数据（用于表格显示）
          const frontendCards = backendCards.map((card) =>
            convertBackendCardToFrontend(card, templateMap, deckMap)
          );
          setCards(frontendCards);
        } else {
          setBackendCardsMap(new Map());
          setCards([]);
        }
      } catch (error) {
        console.error("获取卡片失败:", error);
        setBackendCardsMap(new Map());
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredCards();
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
          <CardTable
            rows={cards}
            onCardSelect={handleCardSelect}
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={7} sx={{ minHeight: "400px" }}>
          <CardPreview card={selectedCard} onCardDeleted={handleCardDeleted} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default CardEditMain;
