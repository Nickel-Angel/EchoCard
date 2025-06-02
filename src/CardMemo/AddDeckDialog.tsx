import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { createDeck } from "@/api/Deck";

interface AddDeckDialogProps {
  open: boolean;
  onClose: () => void;
  onDeckAdded: () => void;
}

/**
 * 添加卡组对话框组件
 * @param open - 对话框是否打开
 * @param onClose - 关闭对话框的回调函数
 * @param onDeckAdded - 卡组添加成功后的回调函数
 */
const AddDeckDialog: React.FC<AddDeckDialogProps> = ({
  open,
  onClose,
  onDeckAdded,
}) => {
  const [deckName, setDeckName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理对话框关闭
  const handleClose = () => {
    if (!isSubmitting) {
      setDeckName("");
      setError(null);
      onClose();
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    if (!deckName.trim()) {
      setError("请输入卡组名称");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await createDeck(deckName.trim());
      if (success) {
        setDeckName("");
        onDeckAdded();
        onClose();
      } else {
        setError("创建卡组失败，请重试");
      }
    } catch (error) {
      console.error("创建卡组时发生错误:", error);
      setError("创建卡组时发生错误，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理回车键提交
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="add-deck-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="add-deck-dialog-title">添加新卡组</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="卡组名称"
          type="text"
          fullWidth
          variant="outlined"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSubmitting}
          error={!!error}
          helperText={error}
          sx={{ mt: 2 }}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !deckName.trim()}
        >
          {isSubmitting ? "创建中..." : "创建"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDeckDialog;
