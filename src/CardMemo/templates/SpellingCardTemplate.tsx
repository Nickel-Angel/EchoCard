import { CardData } from "@/api/Card";
import { TemplateData } from "@/api/Template";
import {
  TemplateInterface,
  TemplateProps,
} from "@/CardMemo/templates/TemplateInterface";
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import TranslateIcon from "@mui/icons-material/Translate";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

// 华丽的渐变卡片样式
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.light}15 0%, 
    ${theme.palette.secondary.light}15 50%, 
    ${theme.palette.primary.light}15 100%)`,
  border: `2px solid ${theme.palette.primary.light}30`,
  borderRadius: 16,
  boxShadow: `0 8px 32px ${theme.palette.primary.main}20`,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 40px ${theme.palette.primary.main}30`,
  },
}));

// 华丽的输入框样式
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    background: `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
    "& fieldset": {
      borderColor: theme.palette.primary.light,
      borderWidth: 2,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: 3,
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

// 华丽的按钮样式
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  borderRadius: 25,
  color: "white",
  fontWeight: 600,
  padding: "12px 32px",
  textTransform: "none",
  boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    transform: "translateY(-2px)",
    boxShadow: `0 6px 25px ${theme.palette.primary.main}50`,
  },
}));

// 答案显示区域样式
const AnswerBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.success.main}10)`,
  border: `2px solid ${theme.palette.success.light}`,
  borderRadius: 16,
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
  },
}));

function SpellingCard({
  cardContent,
  emitCorrect,
  ratingButtons,
}: TemplateProps) {
  const [userInput, setUserInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 当卡片内容变化时重置状态
  useEffect(() => {
    setUserInput("");
    setShowAnswer(false);
    setIsCorrect(false);
  }, [cardContent]);

  // 处理显示答案
  const handleShowAnswer = () => {
    const correct =
      userInput.toLowerCase().trim() ===
      cardContent.spelling.toLowerCase().trim();
    setIsCorrect(correct);
    setShowAnswer(true);
  };

  return (
    <GradientCard sx={{ width: "100%", maxWidth: 900, mx: "auto", my: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* 标题区域 */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <TranslateIcon sx={{ color: "primary.main", mr: 1, fontSize: 28 }} />
          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            单词拼写练习
          </Typography>
        </Box>

        {/* 中文释义和词性 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            {cardContent.meaning}
          </Typography>
          <Chip
            label={cardContent.partOfSpeech}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              borderRadius: 3,
              border: 2,
            }}
          />
        </Box>

        {/* 输入区域 */}
        <Box sx={{ mb: 4 }}>
          <StyledTextField
            fullWidth
            label="请输入英文单词"
            variant="outlined"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={showAnswer}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <SpellcheckIcon sx={{ color: "primary.main", mr: 1 }} />
              ),
            }}
          />
        </Box>

        {/* 答案显示区域 */}
        {showAnswer && (
          <AnswerBox>
            {/* 正确性指示 */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {isCorrect ? (
                <CheckCircleIcon
                  sx={{ color: "success.main", mr: 1, fontSize: 28 }}
                />
              ) : (
                <CancelIcon sx={{ color: "error.main", mr: 1, fontSize: 28 }} />
              )}
              <Typography
                variant="h6"
                sx={{
                  color: isCorrect ? "success.main" : "error.main",
                  fontWeight: 700,
                }}
              >
                {isCorrect ? "拼写正确！" : "拼写错误"}
              </Typography>
            </Box>

            {/* 正确拼写 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                正确拼写:
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 700,
                  color: "primary.main",
                  letterSpacing: 2,
                }}
              >
                {cardContent.spelling}
              </Typography>
            </Box>

            {/* 例句 */}
            {cardContent.example && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <FormatQuoteIcon sx={{ color: "primary.main", mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    例句:
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontStyle: "italic",
                    fontSize: "1.1rem",
                    lineHeight: 1.6,
                    pl: 2,
                    borderLeft: 3,
                    borderColor: "primary.light",
                  }}
                >
                  {cardContent.example}
                </Typography>
              </Box>
            )}
          </AnswerBox>
        )}
      </CardContent>

      <CardActions
        sx={{ flexDirection: "column", alignItems: "center", pb: 3 }}
      >
        {!showAnswer ? (
          <GradientButton
            onClick={handleShowAnswer}
            disabled={!userInput.trim()}
            startIcon={<SpellcheckIcon />}
          >
            显示正确答案
          </GradientButton>
        ) : (
          <Box sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {isCorrect
                  ? "拼写正确！请根据掌握程度进行评分"
                  : "拼写错误，请根据掌握程度进行评分"}
              </Typography>
            </Box>
            {ratingButtons}
          </Box>
        )}
      </CardActions>
    </GradientCard>
  );
}

/**
 * 单词拼写记忆卡片模板实现
 */
export class SpellingCardTemplate extends TemplateInterface {
  /**
   * 解析卡片内容
   * @param card 卡片数据
   * @param template 模板数据
   * @returns 解析后的卡片内容，包含中文释义、词性、正确拼写和例句
   */
  parseCardContent(card: CardData, template: TemplateData) {
    // 查找各个字段的索引
    const meaningIndex = template.template_fields.findIndex(
      (f) => f[0] === "中文释义"
    );
    const partOfSpeechIndex = template.template_fields.findIndex(
      (f) => f[0] === "词性"
    );
    const spellingIndex = template.template_fields.findIndex(
      (f) => f[0] === "英文拼写"
    );
    const exampleIndex = template.template_fields.findIndex(
      (f) => f[0] === "例句"
    );

    return {
      meaning:
        meaningIndex >= 0 && meaningIndex < card.template_fields_content.length
          ? card.template_fields_content[meaningIndex]
          : "",
      partOfSpeech:
        partOfSpeechIndex >= 0 &&
        partOfSpeechIndex < card.template_fields_content.length
          ? card.template_fields_content[partOfSpeechIndex]
          : "",
      spelling:
        spellingIndex >= 0 &&
        spellingIndex < card.template_fields_content.length
          ? card.template_fields_content[spellingIndex]
          : "",
      example:
        exampleIndex >= 0 && exampleIndex < card.template_fields_content.length
          ? card.template_fields_content[exampleIndex]
          : "",
    };
  }

  /**
   * 渲染卡片组件
   * @param props 模板属性
   * @returns JSX元素
   */
  renderCard(props: TemplateProps): JSX.Element {
    return (
      <SpellingCard
        cardContent={props.cardContent}
        emitCorrect={props.emitCorrect}
        ratingButtons={props.ratingButtons}
      />
    );
  }
}
