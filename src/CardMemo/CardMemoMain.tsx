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

interface DeckData {
  name: string;
  tolearn: number;
  learning: number;
  toreview: number;
}

function createDeckData(
  name: string,
  tolearn: number,
  learning: number,
  toreview: number
): DeckData {
  return { name, tolearn, learning, toreview };
}

const TextButton = styled(Button)({
  textTransform: "none",
  justifyContent: "flex-start",
});

const DenseTable = ({ rows }: { rows: DeckData[] }) => {
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
    console.log(`开始学习牌组: ${selectedDeck?.name}`);
    setOpen(false);
    // TODO: 实现开始学习的逻辑
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
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <TextButton onClick={() => handleOpen(row)}>
                    {row.name}
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
              deckName={selectedDeck.name}
              newCardsCount={selectedDeck.tolearn}
              learningCardsCount={selectedDeck.learning}
              reviewCardsCount={selectedDeck.toreview}
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
    createDeckData("Frozen yoghurt", 159, 6, 24),
    createDeckData("Ice cream sandwich", 237, 9, 37),
    createDeckData("Eclair", 262, 16, 24),
    createDeckData("Cupcake", 305, 3, 67),
    createDeckData("Gingerbread", 356, 16, 49),
  ];
  // TODO: get learning time and learning number from back-end
  const learningTime = 0;
  const learningNumber = 0;
  if (rows.length !== 0) {
    return (
      <div>
        <DenseTable rows={rows} />
        <p style={{ paddingTop: "20px" }}>
          今天共学习了 {learningTime} 分钟，学习了 {learningNumber} 张卡片。
        </p>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <p style={{ paddingTop: "20px", textAlign: "center" }}>
        你还没有卡组哦，快去添加卡组吧~
        <br />
        <br />
        <Button variant="contained">添加卡组</Button>
      </p>
    </div>
  );
}

export default CardMemoMain;
