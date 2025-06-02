import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PreviewModeComponent from "@/CardEdit/PreviewModeComponent";
import EditModeComponent from "@/CardEdit/EditModeComponent";
import { CardData } from "@/api/Card";

// 卡片预览组件（包含模式切换）
// 直接使用后端的 CardData 类型，简化数据传递
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

export default CardPreview;
