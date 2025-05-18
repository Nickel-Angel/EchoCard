

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Slider,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import {
  getFsrsParams,
  trainFsrsModel,
  getDesiredRetention,
  setDesiredRetention,
} from "../api/Settings";

function SettingsMain() {
  const [fsrsParams, setFsrsParams] = useState<number[]>([]);
  const [retention, setRetention] = useState<number>(0.9); // 默认值
  const [loading, setLoading] = useState<boolean>(false);
  const [trainingLoading, setTrainingLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // 加载FSRS参数和记忆留存率
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [paramsData, retentionData] = await Promise.all([
          getFsrsParams(),
          getDesiredRetention(),
        ]);
        setFsrsParams(paramsData);
        setRetention(retentionData);
      } catch (error) {
        console.error("加载设置数据失败:", error);
        setSnackbar({
          open: true,
          message: "加载设置数据失败",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 训练FSRS模型
  const handleTrainModel = async () => {
    setTrainingLoading(true);
    try {
      const optimizedParams = await trainFsrsModel();
      setFsrsParams(optimizedParams);
      setSnackbar({
        open: true,
        message: "FSRS模型训练成功",
        severity: "success",
      });
    } catch (error) {
      console.error("训练FSRS模型失败:", error);
      setSnackbar({
        open: true,
        message: "训练FSRS模型失败",
        severity: "error",
      });
    } finally {
      setTrainingLoading(false);
    }
  };

  // 处理记忆留存率变化
  const handleRetentionChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    setRetention(newValue as number);
  };

  // 提交记忆留存率变更
  const handleRetentionChangeCommitted = async (
    _event: React.SyntheticEvent | Event,
    newValue: number | number[]
  ) => {
    try {
      await setDesiredRetention(newValue as number);
      setSnackbar({
        open: true,
        message: "记忆留存率设置成功",
        severity: "success",
      });
    } catch (error) {
      console.error("设置记忆留存率失败:", error);
      setSnackbar({
        open: true,
        message: "设置记忆留存率失败",
        severity: "error",
      });
    }
  };

  // 关闭提示信息
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ padding: 3, height: "100%", overflow: "auto" }}>
      <Typography variant="h4" gutterBottom>
        设置
      </Typography>

      {/* FSRS参数设置卡片 */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="FSRS模型参数" />
        <Divider />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              FSRS（Free Spaced Repetition
              Scheduler）是一种用于间隔重复的算法，用于优化记忆效率。
              以下是当前模型的参数，您可以通过训练按钮基于您的复习历史优化这些参数。
            </Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  当前参数值：
                </Typography>
                <Typography variant="h6">
                  {fsrsParams.map((param, index) => (
                    <span key={index}>
                      {param.toFixed(6)}{index < fsrsParams.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </Typography>
              </Paper>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: "center" }}
              >
                参数以文本形式展示，各个参数之间用逗号隔开
              </Typography>
            </Box>
          )}

          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleTrainModel}
              disabled={trainingLoading || loading}
              startIcon={
                trainingLoading && (
                  <CircularProgress size={20} color="inherit" />
                )
              }
            >
              {trainingLoading ? "训练中..." : "训练模型"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 记忆留存率设置卡片 */}
      <Card>
        <CardHeader title="记忆留存率设置" />
        <Divider />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              记忆留存率表示您希望在下次复习时能够记住的内容比例。
              较高的留存率会导致更频繁的复习，但可以提高记忆效果；较低的留存率会减少复习频率，但可能降低记忆效果。
            </Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ px: 3, py: 2 }}>
              <Typography id="retention-slider" gutterBottom>
                当前记忆留存率: {(retention * 100).toFixed(0)}%
              </Typography>
              <Slider
                value={retention}
                onChange={handleRetentionChange}
                onChangeCommitted={handleRetentionChangeCommitted}
                min={0.6}
                max={1.0}
                step={0.01}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                aria-labelledby="retention-slider"
              />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  60%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  100%
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 提示信息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SettingsMain;