import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { addNewCard } from "@/api/Card";

// 自定义样式的文件上传按钮
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

/**
 * CSV预览数据接口
 */
interface CsvPreviewData {
  rows: string[][];
  totalRows: number;
}

/**
 * 批量导入对话框组件
 */
interface BatchImportDialogProps {
  open: boolean;
  onClose: () => void;
  deckId: number | "";
  deckName: string;
  templateId: number | "";
  templateName: string;
  templateFields: [string, boolean][];
}

function BatchImportDialog({
  open,
  onClose,
  deckId,
  deckName,
  templateId,
  templateName,
  templateFields,
}: BatchImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CsvPreviewData | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFileError(null);

    if (!selectedFile) {
      setFile(null);
      setPreviewData(null);
      return;
    }

    // 验证文件类型
    if (!selectedFile.name.endsWith(".csv")) {
      setFileError("请选择CSV格式的文件");
      setFile(null);
      setPreviewData(null);
      return;
    }

    setFile(selectedFile);

    // 读取CSV文件并预览
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // 使用更健壮的CSV解析函数
        const rows = parseCSV(content);

        if (rows.length === 0) {
          setFileError("CSV文件为空");
          setPreviewData(null);
          return;
        }

        // 检查CSV列数与模板字段数是否匹配
        if (rows[0].length < templateFields.length) {
          setFileError(
            `CSV文件列数(${rows[0].length})少于模板所需字段数(${templateFields.length})`
          );
          setPreviewData(null);
          return;
        }

        setPreviewData({
          rows: rows.slice(0, 5), // 只显示前5行
          totalRows: rows.length,
        });
      } catch (error) {
        console.error("CSV解析错误:", error);
        setFileError("CSV文件格式不正确");
        setPreviewData(null);
      }
    };

    reader.onerror = () => {
      setFileError("读取文件时出错");
      setPreviewData(null);
    };

    reader.readAsText(selectedFile);
  };

  // CSV解析函数，处理引号和转义字符
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    const result: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const row: string[] = [];
      let cell = "";
      let inQuotes = false;
      let j = 0;

      while (j < line.length) {
        const char = line[j];

        if (char === '"' && (j === 0 || line[j - 1] !== "\\")) {
          // 处理引号开始或结束
          inQuotes = !inQuotes;
          j++;
        } else if (char === "," && !inQuotes) {
          // 处理逗号分隔符（不在引号内）
          row.push(processCell(cell));
          cell = "";
          j++;
        } else {
          // 处理普通字符
          cell += char;
          j++;
        }
      }

      // 添加最后一个单元格
      row.push(processCell(cell));
      result.push(row);
    }

    return result;
  };

  // 处理单元格内容，还原转义字符
  const processCell = (cell: string) => {
    // 去除首尾引号
    if (cell.startsWith('"') && cell.endsWith('"')) {
      cell = cell.substring(1, cell.length - 1);
    }

    // 还原转义字符
    return cell
      .replace(/\\n/g, "\n") // 换行符
      .replace(/\\r/g, "\r") // 回车符
      .replace(/\\t/g, "\t") // 制表符
      .replace(/\\\\/g, "\\") // 反斜杠
      .replace(/\\"/g, '"'); // 引号
  };

  // 处理导入提交
  const handleImport = () => {
    if (!file || !previewData) {
      setFileError("请先选择有效的CSV文件");
      return;
    }

    setIsUploading(true);

    // 读取完整的CSV文件并处理
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const rows = parseCSV(content);

        if (rows.length === 0) {
          setFileError("CSV文件为空");
          setIsUploading(false);
          return;
        }

        // 构建导入数据
        const importData = {
          deckId,
          templateId,
          cards: rows.map((row) => {
            const cardFields: { [key: string]: string } = {};

            // 按顺序一一对应字段
            templateFields.forEach((field, index) => {
              if (index < row.length) {
                cardFields[field[0]] = row[index] || "";
              } else {
                cardFields[field[0]] = "";
              }
            });

            return cardFields;
          }),
        };

        console.log("导入数据:", importData);

        // 实际调用API进行导入
        let successCount = 0;
        let failCount = 0;

        // 使用Promise.all并行处理所有导入请求
        try {
          const importPromises = importData.cards.map(async (cardFields) => {
            // 将字段对象转换为数组，保持与模板字段相同的顺序
            const templateFieldsArray = templateFields.map(
              (field) => cardFields[field[0]] || ""
            );

            // 调用API添加卡片
            const result = await addNewCard({
              deckId: importData.deckId as number,
              templateId: importData.templateId as number,
              templateFields: templateFieldsArray,
            });

            return result !== null;
          });

          // 等待所有导入完成
          const results = await Promise.all(importPromises);

          // 统计成功和失败的数量
          successCount = results.filter((result) => result).length;
          failCount = results.length - successCount;

          setIsUploading(false);

          if (failCount > 0) {
            alert(`导入完成：成功 ${successCount} 张，失败 ${failCount} 张`);
          } else {
            alert(`成功导入 ${successCount} 张卡片到牌组 "${deckName}"`);
          }

          onClose();
        } catch (error) {
          console.error("批量导入卡片失败:", error);
          setFileError("批量导入卡片失败，请检查数据格式或稍后重试");
          setIsUploading(false);
        }
      } catch (error) {
        console.error("CSV处理错误:", error);
        setFileError("处理CSV数据时出错");
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setFileError("读取文件时出错");
      setIsUploading(false);
    };

    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>批量导入卡片</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          请选择CSV文件，将卡片批量导入到牌组 <strong>{deckName}</strong>{" "}
          中，使用模板 <strong>{templateName}</strong>
          。CSV文件中的列将按顺序与模板字段对应。
        </DialogContentText>

        {/* 字段顺序提示 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            CSV文件列顺序应为：
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>列序号</TableCell>
                  <TableCell>对应字段</TableCell>
                  <TableCell>字段所属面</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templateFields.map((field, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{field[0]}</TableCell>
                    <TableCell>{field[1] ? "正面" : "背面"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 文件选择区域 */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
          >
            选择CSV文件
            <VisuallyHiddenInput
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </Button>

          {file && (
            <Typography variant="body2">
              已选择: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </Typography>
          )}

          {fileError && (
            <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
              <AlertTitle>错误</AlertTitle>
              {fileError}
            </Alert>
          )}
        </Box>

        {/* CSV预览区域 */}
        {previewData && (
          <>
            <Typography variant="h6" gutterBottom>
              数据预览 (显示前 {previewData.rows.length} 行，共{" "}
              {previewData.totalRows} 行)
            </Typography>

            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {templateFields
                      .slice(0, previewData.rows[0].length)
                      .map((field, index) => (
                        <TableCell key={index}>{field[0]}</TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!previewData || isUploading}
        >
          {isUploading ? "导入中..." : "导入"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BatchImportDialog;
