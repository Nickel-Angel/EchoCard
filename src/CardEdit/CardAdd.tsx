import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTabStore } from "@/store/tabStore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";
import { DeckData } from "@/api/Card";
import { fetchDecks } from "@/api/Deck";
import {
  TemplateData,
  getTemplateFields,
  getAllTemplates,
  TemplateFieldData,
} from "@/api/Template";
import { addNewCard } from "@/api/Card";
import BatchImportDialog from "@/CardEdit/BatchImportDialog";

function CardAdd() {
  const navigate = useNavigate();
  const { setActiveTab } = useTabStore();

  // 状态管理
  const [decks, setDecks] = useState<DeckData[]>([]);
  const [templates, setTemplates] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedDeckId, setSelectedDeckId] = useState<number | "">("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");
  const [currentTemplate, setCurrentTemplate] = useState<TemplateData | null>(
    null
  );
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 批量导入对话框状态
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // 加载牌组数据
  useEffect(() => {
    const loadDecks = async () => {
      try {
        const deckList = await fetchDecks();
        setDecks(deckList);
        if (deckList.length > 0) {
          setSelectedDeckId(deckList[0].deckId);
        }
      } catch (err) {
        setError("加载牌组失败");
        console.error("加载牌组失败:", err);
      }
    };

    loadDecks();
  }, []);

  // 加载模板数据
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templateList = await getAllTemplates();
        setTemplates(templateList);

        // 如果有模板数据，自动选择第一个模板
        if (templateList.length > 0) {
          setSelectedTemplateId(templateList[0].id);
        }
      } catch (err) {
        setError("加载模板失败");
        console.error("加载模板失败:", err);
      }
    };

    loadTemplates();
  }, []);

  // 当选择模板时，加载模板详情
  useEffect(() => {
    if (selectedTemplateId === "") {
      setCurrentTemplate(null);
      setFieldValues({});
      return;
    }

    const loadTemplateDetails = async () => {
      try {
        // 加载模板字段
        const fields = await getTemplateFields(Number(selectedTemplateId));

        // 构建模板数据结构
        const templateFields: [string, boolean][] = fields.map(
          (field: TemplateFieldData) => [field.name, field.is_front]
        );

        // 设置当前模板
        const templateData: TemplateData = {
          template_id: Number(selectedTemplateId),
          template_name:
            templates.find((t) => t.id === Number(selectedTemplateId))?.name ||
            "",
          template_fields: templateFields,
        };
        setCurrentTemplate(templateData);

        // 初始化字段值
        const initialValues: { [key: string]: string } = {};
        fields.forEach((field: TemplateFieldData) => {
          initialValues[field.name] = "";
        });
        setFieldValues(initialValues);
      } catch (err) {
        setError("加载模板详情失败");
        console.error("加载模板详情失败:", err);
      }
    };

    loadTemplateDetails();
  }, [selectedTemplateId]);

  // 处理牌组选择变化
  const handleDeckChange = (event: SelectChangeEvent<number | string>) => {
    setSelectedDeckId(event.target.value as number);
  };

  // 处理模板选择变化
  const handleTemplateChange = (event: SelectChangeEvent<number | string>) => {
    setSelectedTemplateId(event.target.value as number);
  };

  // 处理字段值变化
  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // 提交新卡片
  const handleSubmit = async () => {
    if (!selectedDeckId || !selectedTemplateId || !currentTemplate) {
      setError("请选择牌组和模板");
      return;
    }

    // 允许空字符串输入，不再检查字段是否为空
    // 只确保所有字段都存在于fieldValues中
    const missingFields = currentTemplate.template_fields.filter(
      (field) => fieldValues[field[0]] === undefined
    );

    if (missingFields.length > 0) {
      setError(`字段缺失: ${missingFields.map((f) => f[0]).join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 准备字段内容数组，保持与模板字段相同的顺序
      const fieldContents = currentTemplate.template_fields.map(
        (field) => fieldValues[field[0]] || ""
      );

      // 调用API添加新卡片，现在返回卡片ID
      const cardId = await addNewCard({
        deckId: Number(selectedDeckId),
        templateId: Number(selectedTemplateId),
        templateFields: fieldContents,
      });
      console.log(`deckId: ${selectedDeckId}`);

      if (cardId !== null) {
        // 重置表单或导航回卡片列表
        resetForm();
        // 添加成功后显示成功消息，包含卡片ID
        alert(`卡片添加成功，卡片ID: ${cardId}`);
      } else {
        setError("添加卡片失败");
      }
    } catch (err) {
      setError("添加卡片失败");
      console.error("添加卡片失败:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFieldValues({});
    // 可选：是否要重置选择的牌组和模板
    // setSelectedDeckId("");
    // setSelectedTemplateId("");
  };

  // 返回卡片列表页面，并自动切换到卡片编辑标签页
  const handleBack = () => {
    // 设置全局标签状态为卡片编辑页（索引为1）
    setActiveTab(1);
    // 导航回主页
    navigate("/");
  };

  // 打开批量导入对话框
  const handleOpenImportDialog = () => {
    if (!selectedDeckId || !selectedTemplateId || !currentTemplate) {
      setError("请先选择牌组和模板");
      return;
    }
    setImportDialogOpen(true);
  };

  // 关闭批量导入对话框
  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
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
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h1">
          添加新卡片
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleOpenImportDialog}
            sx={{ mr: 2, borderRadius: 2, minWidth: 120 }}
          >
            批量导入
          </Button>
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ mr: 2, borderRadius: 2, minWidth: 120 }}
          >
            返回列表
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* 牌组选择 */}
          <Grid sx={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="deck-select-label">选择牌组</InputLabel>
              <Select
                labelId="deck-select-label"
                value={selectedDeckId}
                onChange={handleDeckChange}
                label="选择牌组"
              >
                {decks.map((deck) => (
                  <MenuItem key={deck.deckId} value={deck.deckId}>
                    {deck.deckName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 模板选择 */}
          <Grid sx={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="template-select-label">选择模板</InputLabel>
              <Select
                labelId="template-select-label"
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                label="选择模板"
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* 动态字段表单 */}
      {currentTemplate && (
        <Paper sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            填写卡片内容
          </Typography>

          <Grid container spacing={3}>
            {currentTemplate.template_fields.map((field, index) => (
              <Grid sx={{ xs: 12 }} key={index}>
                <TextField
                  label={field[0]}
                  value={fieldValues[field[0]] || ""}
                  onChange={(e) => handleFieldChange(field[0], e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  helperText={field[1] ? "正面字段" : "背面字段"}
                />
              </Grid>
            ))}
          </Grid>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" onClick={resetForm}>
              重置
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              {isSubmitting ? "添加中..." : "添加卡片"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* 批量导入对话框 */}
      {currentTemplate && (
        <BatchImportDialog
          open={importDialogOpen}
          onClose={handleCloseImportDialog}
          deckId={selectedDeckId}
          deckName={
            decks.find((d) => d.deckId === Number(selectedDeckId))?.deckName ||
            ""
          }
          templateId={selectedTemplateId}
          templateName={
            templates.find((t) => t.id === Number(selectedTemplateId))?.name ||
            ""
          }
          templateFields={currentTemplate.template_fields}
        />
      )}
    </Box>
  );
}

export default CardAdd;
