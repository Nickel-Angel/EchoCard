import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import PreviewModeComponent from "@/CardEdit/PreviewModeComponent";
import EditModeComponent from "@/CardEdit/EditModeComponent";
import { CardData, deleteCard } from "@/api/Card";

// 卡片预览组件（包含模式切换）
// 直接使用后端的 CardData 类型，简化数据传递
const CardPreview = ({
  card,
  onCardDeleted,
}: {
  card: CardData | null;
  onCardDeleted?: () => void;
}) => {
  // 预览模式状态：preview - 预览模式，edit - 编辑模式
  const [previewMode, setPreviewMode] = useState<"preview" | "edit">("preview");
  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // 删除操作加载状态
  const [isDeleting, setIsDeleting] = useState(false);

  // 处理删除卡片
  const handleDeleteCard = async () => {
    if (!card) return;

    setIsDeleting(true);
    try {
      const success = await deleteCard(card.card_id);
      if (success) {
        setDeleteDialogOpen(false);
        // 调用回调函数通知父组件卡片已删除
        onCardDeleted?.();
      } else {
        console.error("删除卡片失败");
      }
    } catch (error) {
      console.error("删除卡片时发生错误:", error);
    } finally {
      setIsDeleting(false);
    }
  };

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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">
          {previewMode === "preview" ? "预览模式" : "编辑模式"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() =>
              setPreviewMode(previewMode === "preview" ? "edit" : "preview")
            }
          >
            切换到{previewMode === "preview" ? "编辑" : "预览"}模式
          </Button>
          <IconButton
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            title="删除卡片"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {previewMode === "preview" ? (
        <PreviewModeComponent card={card} />
      ) : (
        <EditModeComponent card={card} />
      )}

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">确认删除卡片</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            您确定要删除这张卡片吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            取消
          </Button>
          <Button
            onClick={handleDeleteCard}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "删除中..." : "确认删除"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CardPreview;
