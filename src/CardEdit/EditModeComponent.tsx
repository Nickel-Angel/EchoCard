import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { CardData, updateCardContent } from "@/api/Card";
import { Snackbar, Alert } from "@mui/material";
import { getTemplateFields, TemplateFieldData } from "@/api/Template";

/**
 * 编辑模式组件
 * @param card - 后端卡片数据 (CardData)
 * @returns 编辑模式组件
 */
const EditModeComponent = ({ card }: { card: CardData | null }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [templateFields, setTemplateFields] = useState<TemplateFieldData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 当卡片变化时，获取模板字段
    if (card) {
      setIsLoading(true);
      getTemplateFields(card.template_id)
        .then((fields) => {
          setTemplateFields(fields);
        })
        .catch((error) => {
          console.error("获取模板字段失败:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
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
        <p>请选择一张卡片进行编辑</p>
      </Box>
    );
  }

  // 根据卡片模板字段内容生成编辑字段
  const initialFieldValues = (() => {
    // 如果有模板字段内容，则使用它们
    if (
      card.template_fields_content &&
      Array.isArray(card.template_fields_content) &&
      card.template_fields_content.length > 0
    ) {
      const fieldValues: { [key: string]: string } = {};

      // 使用模板字段名称作为字段名
      card.template_fields_content.forEach((content, index) => {
        // 如果已加载模板字段信息，则使用实际字段名称
        const fieldName = templateFields[index]?.name || `字段${index + 1}`;
        fieldValues[fieldName] = content || "";
      });

      return fieldValues;
    }

    // 如果没有模板字段内容，则返回一个包含卡片ID的默认字段
    return {
      卡片ID: card.card_id.toString() || "",
    };
  })();

  const [fieldValues, setFieldValues] = useState(initialFieldValues);

  // 当模板字段加载完成后，更新字段值
  useEffect(() => {
    if (templateFields.length > 0 && card.template_fields_content) {
      const updatedFieldValues: { [key: string]: string } = {};
      
      card.template_fields_content.forEach((content, index) => {
        const fieldName = templateFields[index]?.name || `字段${index + 1}`;
        updatedFieldValues[fieldName] = content || "";
      });
      
      setFieldValues(updatedFieldValues);
    }
  }, [templateFields, card.template_fields_content]);

  // 处理字段值变化
  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // 保存修改
  const handleSave = async () => {
    try {
      // 将字段值对象转换回数组格式，保持原始顺序
      const updatedFields: string[] = [];
      
      // 使用模板字段的顺序来确保数据正确保存
      templateFields.forEach((field, index) => {
        // 查找字段名对应的值
        const value = fieldValues[field.name] || "";
        updatedFields[index] = value;
      });

      // 如果没有模板字段信息，则使用原始的方法
      if (templateFields.length === 0) {
        Object.keys(fieldValues).forEach((key) => {
          const index = parseInt(key.replace("字段", "")) - 1;
          if (!isNaN(index) && index >= 0) {
            updatedFields[index] = fieldValues[key];
          }
        });
      }

      // 确保数组没有空洞
      const updatedTemplateFields = updatedFields.map((field) => field || "");

      // 调用API保存修改
      const success = await updateCardContent(card.card_id, updatedTemplateFields);

      if (success) {
        setSnackbarMessage("保存成功！");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("保存失败，请重试");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    } catch (error) {
      console.error("保存卡片内容时出错:", error);
      setSnackbarMessage("保存失败，请重试");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditModeComponent;
