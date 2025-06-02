import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { addTemplate } from "@/api/Template";

interface TemplateField {
  id: number;
  name: string;
  isFront: boolean;
}

function TemplateAdd() {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState("");
  const [fields, setFields] = useState<TemplateField[]>([
    { id: 1, name: "正面", isFront: true },
    { id: 2, name: "反面", isFront: false },
  ]);
  const [nextFieldId, setNextFieldId] = useState(3);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 添加字段
  const addField = () => {
    const newField: TemplateField = {
      id: nextFieldId,
      name: "",
      isFront: false,
    };
    setFields([...fields, newField]);
    setNextFieldId(nextFieldId + 1);
  };

  // 删除字段
  const removeField = (id: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((field) => field.id !== id));
    }
  };

  // 更新字段名称
  const updateFieldName = (id: number, name: string) => {
    setFields(
      fields.map((field) => (field.id === id ? { ...field, name } : field))
    );
  };

  // 更新字段类型
  const updateFieldType = (id: number, isFront: boolean) => {
    setFields(
      fields.map((field) => (field.id === id ? { ...field, isFront } : field))
    );
  };

  // 处理文件上传
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 处理文件选择
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 检查文件类型
      if (!file.name.endsWith(".tsx")) {
        setSnackbar({
          open: true,
          message: "请选择 .tsx 文件",
          severity: "error",
        });
        return;
      }

      setUploadedFile(file);

      // 自动提取类名（假设文件名就是类名）
      const nameWithoutExt = file.name.replace(".tsx", "");
      setClassName(nameWithoutExt);
    } catch (error) {
      console.error("文件处理失败:", error);
      setSnackbar({
        open: true,
        message: "文件处理失败",
        severity: "error",
      });
    }
  };

  // 验证表单
  const validateForm = () => {
    if (!templateName.trim()) {
      setSnackbar({
        open: true,
        message: "请输入模板名称",
        severity: "error",
      });
      return false;
    }

    if (fields.some((field) => !field.name.trim())) {
      setSnackbar({
        open: true,
        message: "请填写所有字段名称",
        severity: "error",
      });
      return false;
    }

    if (!uploadedFile) {
      setSnackbar({
        open: true,
        message: "请上传模板文件",
        severity: "error",
      });
      return false;
    }

    if (!className.trim()) {
      setSnackbar({
        open: true,
        message: "请输入类名",
        severity: "error",
      });
      return false;
    }

    return true;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. 获取文件内容
      const fileName = uploadedFile!.name;
      const fileContent = await uploadedFile!.text();

      // 注意：由于浏览器安全限制，无法直接写入本地文件系统
      // 文件内容将通过 API 传递给后端处理

      // 2. 准备字段数据
      const templateFields: [string, boolean][] = fields.map((field) => [
        field.name,
        field.isFront,
      ]);

      // 3. 调用API添加模板（包含文件内容）
      const importPath = `@/CardMemo/templates/${fileName.replace(".tsx", "")}`;
      const result = await addTemplate(
        templateName,
        templateFields,
        className,
        importPath,
        fileContent // 传递文件内容给后端
      );

      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message,
          severity: "success",
        });
        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: result.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("添加模板失败:", error);
      setSnackbar({
        open: true,
        message: `添加模板失败: ${error}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // 返回上一页
  const handleBack = () => {
    navigate(-1);
  };

  // 重置表单
  const resetForm = () => {
    setTemplateName("");
    setFields([
      { id: 1, name: "正面", isFront: true },
      { id: 2, name: "反面", isFront: false },
    ]);
    setNextFieldId(3);
    setUploadedFile(null);
    setClassName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minWidth: 320,
        width: "100%",
      }}
    >
      {/* 标题栏 */}
      <Box
        sx={{
          mb: 3,
          pr: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h1">
          添加新模板
        </Typography>
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{ borderRadius: 2, minWidth: 120 }}
        >
          返回
        </Button>
      </Box>

      <Paper sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
        {/* 使用Grid布局创建两列 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
            height: "100%",
          }}
        >
          {/* 左侧列 */}
          <Box>
            {/* 模板名称 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                模板名称
              </Typography>
              <TextField
                fullWidth
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="请输入模板名称"
                variant="outlined"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 文件上传 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                模板文件
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={handleFileUpload}
                >
                  选择TSX文件
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".tsx"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {uploadedFile && (
                  <Typography variant="body2" color="text.secondary">
                    已选择: {uploadedFile.name}
                  </Typography>
                )}
              </Box>
              <TextField
                fullWidth
                label="类名"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="请输入模板类名"
                variant="outlined"
                size="small"
                helperText="类名应与TSX文件中导出的组件名称一致"
              />
            </Box>
          </Box>

          {/* 右侧列 */}
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* 模板字段 */}
            <Box sx={{ mb: 3, flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                模板字段
              </Typography>
              <Box sx={{ maxHeight: "400px", overflow: "auto" }}>
                {fields.map((field, index) => (
                  <Card key={field.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <TextField
                          label="字段名称"
                          value={field.name}
                          onChange={(e) =>
                            updateFieldName(field.id, e.target.value)
                          }
                          variant="outlined"
                          size="small"
                          sx={{ flex: 1 }}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.isFront}
                              onChange={(e) =>
                                updateFieldType(field.id, e.target.checked)
                              }
                            />
                          }
                          label={field.isFront ? "正面字段" : "反面字段"}
                        />
                        <IconButton
                          onClick={() => removeField(field.id)}
                          disabled={fields.length <= 1}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              <Button
                startIcon={<AddIcon />}
                onClick={addField}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                添加字段
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 提交按钮 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={resetForm}>
                重置
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{ ml: 2, borderRadius: 2, minWidth: 120 }}
              >
                {loading ? "添加中..." : "添加模板"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TemplateAdd;
