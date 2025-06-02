import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import {
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import styled from "@mui/material/styles/styled";
import { useState, useEffect } from "react";
import CardMemoStart from "./CardMemoStart";
import Box from "@mui/material/Box";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { DeckData, fetchDecks, deleteDeck } from "@/api/Deck";
import { fetchLearningCount } from "@/api/Card";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTabStore } from "@/store/tabStore";

interface DenseTableProps {
  rows: DeckData[];
  navigate: NavigateFunction;
  refreshDecks: () => void;
}

const TextButton = styled(Button)({
  textTransform: "none",
  justifyContent: "flex-start",
});

const DenseTable = ({ rows, navigate, refreshDecks }: DenseTableProps) => {
  const [open, setOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<DeckData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<DeckData | null>(null);

  const handleOpen = (deck: DeckData) => {
    setSelectedDeck(deck);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleStartStudy = () => {
    console.log(`开始学习牌组: ${selectedDeck?.deckName}`);
    setOpen(false);
    if (selectedDeck) {
      navigate("/card-memo-learning", {
        state: {
          deckId: selectedDeck.deckId,
          deckName: selectedDeck.deckName,
          tolearn: selectedDeck.tolearn,
          learning: selectedDeck.learning,
          toreview: selectedDeck.toreview,
        },
      });
    }
  };

  const handleDeleteClick = (event: React.MouseEvent, deck: DeckData) => {
    event.stopPropagation();
    setDeckToDelete(deck);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeckToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (deckToDelete) {
      try {
        const success = await deleteDeck(deckToDelete.deckId);
        if (success) {
          refreshDecks();
        } else {
          throw new Error("删除牌组失败");
        }
      } catch (error) {
        console.error("删除牌组出错:", error);
        // 通知父组件显示错误信息
        refreshDecks();
      }
    }
    setDeleteDialogOpen(false);
    setDeckToDelete(null);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 500 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>牌组</TableCell>
              <TableCell align="center">未学习</TableCell>
              <TableCell align="center">学习中</TableCell>
              <TableCell align="center">待复习</TableCell>
              <TableCell align="center">删除卡组</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: DeckData) => (
              <TableRow
                key={row.deckName}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <TextButton onClick={() => handleOpen(row)}>
                    {row.deckName}
                  </TextButton>
                </TableCell>
                <TableCell align="center">{row.tolearn}</TableCell>
                <TableCell align="center">{row.learning}</TableCell>
                <TableCell align="center">{row.toreview}</TableCell>
                <TableCell align="center">
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={(event) => handleDeleteClick(event, row)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-deck-study"
        aria-describedby="modal-deck-study-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            maxWidth: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 0,
            borderRadius: 1,
          }}
        >
          {selectedDeck && (
            <CardMemoStart
              deckName={selectedDeck.deckName}
              tolearn={selectedDeck.tolearn}
              learning={selectedDeck.learning}
              toreview={selectedDeck.toreview}
              onStartStudy={handleStartStudy}
            />
          )}
        </Box>
      </Modal>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"确认删除牌组"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            确定要删除牌组 "{deckToDelete?.deckName}"
            吗？此操作不可恢复，牌组中的所有卡片将被永久删除。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

function CardMemoMain() {
  // const rows: DeckData[] = [
  //   createDeckData(1, "Frozen yoghurt", 159, 6, 24),
  //   createDeckData(2, "Ice cream sandwich", 237, 9, 37),
  //   createDeckData(3, "Eclair", 262, 16, 24),
  //   createDeckData(4, "Cupcake", 305, 3, 67),
  //   createDeckData(5, "Gingerbread", 356, 16, 49),
  // ];
  const [rows, setRows] = useState<DeckData[]>([]);
  const [learningNumber, setLearningNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const { setActiveTab } = useTabStore();

  // 处理错误提示关闭
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const refreshDecks = async () => {
    setLoading(true);
    setError(null);
    try {
      const rowList = await fetchDecks();
      setRows(rowList);
      try {
        await fetchLearningCount(setLearningNumber);
      } catch (learningError) {
        console.error("获取学习统计数据失败:", learningError);
        // 不影响主要功能，只记录错误
      }
    } catch (error) {
      console.error("获取牌组数据失败:", error);
      setError("获取牌组数据失败，请稍后重试");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await refreshDecks();
    };

    fetchData();

    // 组件卸载时的清理函数
    return () => {
      // 这里可以添加取消请求的逻辑，如果有使用可取消的请求库
    };
  }, []);

  // 显示加载状态
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 显示错误状态
  if (error && rows.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          padding: 3,
        }}
      >
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={refreshDecks}>
          重试
        </Button>
      </Box>
    );
  }

  if (rows.length !== 0) {
    return (
      <div>
        <DenseTable
          navigate={navigate}
          rows={rows}
          refreshDecks={refreshDecks}
        />
        <div
          style={{
            paddingTop: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <p>今天共学习了 {learningNumber} 张卡片。</p>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/card-memo-statistic")}
          >
            查看详细统计
          </Button>
        </div>

        {/* 错误提示 Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      </div>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box sx={{ paddingTop: "20px", textAlign: "center" }}>
        你还没有卡组哦，快去添加卡组吧~
        <br />
        <br />
        <Button
          variant="contained"
          onClick={() => {
            // 设置全局标签状态为卡片编辑页（索引为1）
            setActiveTab(1);
            // 导航回主页
            navigate("/");
          }}
        >
          添加卡组
        </Button>
      </Box>
    </Box>
  );
}

export default CardMemoMain;
