import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface CardMemoActionProps {
  frontContent: string;
  backContent: string;
  onRating?: (rating: number) => void;
}

function CardMemoAction({
  frontContent,
  backContent,
  onRating = () => {},
}: CardMemoActionProps) {
  const [showBack, setShowBack] = useState(false);

  const handleToggleContent = () => {
    setShowBack(!showBack);
  };

  const handleRating = (rating: number) => {
    onRating(rating);
    // TODO: get next card from backend.
    setShowBack(false);
  };

  // TODO: add schedule time in button.
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {showBack ? backContent : frontContent}
        </Typography>
      </CardContent>
      <CardActions sx={{ flexDirection: "column", alignItems: "stretch" }}>
        {showBack ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              mb: 1,
            }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={() => handleRating(1)}
              sx={{ flex: 1, mx: 0.5 }}
            >
              忘记
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => handleRating(2)}
              sx={{ flex: 1, mx: 0.5 }}
            >
              困难
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={() => handleRating(3)}
              sx={{ flex: 1, mx: 0.5 }}
            >
              良好
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleRating(4)}
              sx={{ flex: 1, mx: 0.5 }}
            >
              简单
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleToggleContent}
            fullWidth
          >
            显示背面
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

export default CardMemoAction;
