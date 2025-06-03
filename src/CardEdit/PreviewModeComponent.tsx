import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CardData } from "@/api/Card";
import { loadTemplate, TemplateData } from "@/api/Template";
import { TemplateFactory } from "@/CardMemo/templates/TemplateFactory";
import { TemplateInterface } from "@/CardMemo/templates/TemplateInterface";

/**
 * 预览模式组件
 * @param card - 后端卡片数据 (CardData)
 * @returns 预览模式组件
 */
const PreviewModeComponent = ({ card }: { card: CardData | null }) => {
  const [_, setTemplateData] = useState<TemplateData | null>(null);
  const [templateInstance, setTemplateInstance] =
    useState<TemplateInterface | null>(null);
  const [parsedCardContent, setParsedCardContent] = useState<any>(null);

  // 当卡片变化时，加载模板并解析卡片内容
  useEffect(() => {
    const loadCardTemplate = async () => {
      if (!card) return;

      try {
        // 加载模板数据
        const template = await loadTemplate(card.template_id, setTemplateData);

        if (template) {
          // 使用模板工厂创建对应的模板实例
          const instance = await TemplateFactory.createTemplate(template);
          setTemplateInstance(instance);

          // 直接使用后端的 CardData 对象解析卡片内容
          const content = instance.parseCardContent(card, template);
          setParsedCardContent(content);
        }
      } catch (error) {
        console.error("加载模板失败:", error);
      }
    };

    loadCardTemplate();
  }, [card]);

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

  // 自定义的预览模式渲染函数，模拟学习模式的评分功能
  const renderPreviewCard = () => {
    if (!templateInstance || !parsedCardContent) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="body1">加载模板中...</Typography>
        </Box>
      );
    }

    // 创建一个简化版的 TemplateProps，用于预览模式
    const previewProps = {
      cardContent: parsedCardContent,
      emitCorrect: () => {}, // 预览模式不需要记录正确答案
    };

    // 使用模板实例渲染卡片
    return templateInstance.renderCard(previewProps);
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
      {renderPreviewCard()}
    </Box>
  );
};

export default PreviewModeComponent;
