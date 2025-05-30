import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

// 定义卡片数据接口
interface CardData {
  cardId: number;
  content: string; // 卡片完整内容
  summary: string; // 卡片概要，从卡片内容中提取的前几个字符
  template: string;
  deckName: string;
}

/**
 * 编辑模式组件
 * @param card - 卡片数据
 * @returns 编辑模式组件
 */
const EditModeComponent = ({ card }: { card: CardData | null }) => {
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
    if (card.template === "正反面卡片") {
      if (card.deckName === "英语单词") {
        return {
          正面: `${card.content} (英语单词)`,
          背面: `释义：这是一个英语单词的释义
例句：This is an example sentence using the word ${card.content}.`,
        };
      } else if (card.deckName === "数学公式") {
        return {
          正面: `请说出以下数学概念的定义：${card.content}`,
          背面: `${card.content}的定义：
这是一个重要的数学概念，用于解决特定类型的问题。`,
        };
      } else {
        return {
          正面: `${card.content} (${card.deckName})`,
          背面: `这是关于${card.deckName}中${card.content}的详细解释。`,
        };
      }
    }
    // 选择题卡片模板
    else {
      if (card.deckName === "历史事件") {
        return {
          问题: `下列哪一项正确描述了${card.content}这一历史事件？`,
          选项: `选项A: ${card.content}发生于20世纪初
选项B: ${card.content}与工业革命有关
选项C: ${card.content}导致了重大社会变革`,
          答案: `选项C: ${card.content}导致了重大社会变革`,
          解析: `${card.content}是一个重要的历史转折点，它确实导致了社会结构的显著变化。`,
        };
      } else if (card.deckName === "编程概念") {
        return {
          问题: `在编程中，${card.content}的主要作用是什么？`,
          选项: `选项A: 提高代码执行效率
选项B: 简化复杂的数据结构
选项C: 实现代码复用`,
          答案: `选项A: 提高代码执行效率`,
          解析: `${card.content}通常用于优化算法，减少计算资源的消耗，从而提高程序的整体性能。`,
        };
      } else if (card.deckName === "地理知识") {
        return {
          问题: `关于${card.content}，下列说法正确的是：`,
          选项: `选项A: 位于北半球
选项B: 是世界上最大的大洲
选项C: 拥有多样的气候带`,
          答案: `选项C: 拥有多样的气候带`,
          解析: `${card.content}由于其广阔的地理范围，跨越了多个纬度，因此形成了从热带到寒带的多样气候带。`,
        };
      } else {
        return {
          问题: `关于${card.deckName}中的${card.content}，以下哪项是正确的？`,
          选项: `选项A: ${card.content}的第一个特性
选项B: ${card.content}的第二个特性
选项C: ${card.content}的第三个特性`,
          答案: `选项A: ${card.content}的第一个特性`,
          解析: `${card.content}的第一个特性是最基本也是最重要的，它定义了${card.content}在${card.deckName}领域中的核心价值。`,
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

export default EditModeComponent;
