import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { Modal, styled } from "@mui/material";
import { useState } from "react";
import CardMemoStart from "./CardMemoStart";
import Box from "@mui/material/Box";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { DeckData, createDeckData } from "./CardMemoUtils";

interface DenseTableProps {
  rows: DeckData[];
  navigate: NavigateFunction;
}

const TextButton = styled(Button)({
  textTransform: "none",
  justifyContent: "flex-start",
});

const DenseTable = ({ rows, navigate }: DenseTableProps) => {
  const [open, setOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<DeckData | null>(null);

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
    </>
  );
};

function CardMemoMain() {
  // TODO: get deck data from back-end
  const rows: DeckData[] = [
    createDeckData(1, "Frozen yoghurt", 159, 6, 24),
    createDeckData(2, "Ice cream sandwich", 237, 9, 37),
    createDeckData(3, "Eclair", 262, 16, 24),
    createDeckData(4, "Cupcake", 305, 3, 67),
    createDeckData(5, "Gingerbread", 356, 16, 49),
  ];
  // TODO: get learning time and learning number from back-end
  const learningTime = 0;
  const learningNumber = 0;
  const navigate = useNavigate();

  if (rows.length !== 0) {
    return (
      <div>
        <DenseTable navigate={navigate} rows={rows} />
        <div
          style={{
            paddingTop: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <p>
            今天共学习了 {learningTime} 分钟，学习了 {learningNumber} 张卡片。
          </p>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/card-memo-statistic")}
          >
            查看详细统计
          </Button>
        </div>
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
        <Button variant="contained">添加卡组</Button>
      </Box>
    </Box>
  );
}

export default CardMemoMain;
