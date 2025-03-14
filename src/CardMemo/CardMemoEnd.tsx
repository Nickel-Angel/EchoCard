import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { green } from "@mui/material/colors";

function CardMemoEnd() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location.state, navigate]);

  const handleBackToHome = () => {
    navigate("/");
  };

  if (!location.state) {
    return null;
  }

  const {
    deckName,
    totalCards = 0,
    correctCount = 0,
    studyTime = 0,
  } = location.state;
  const accuracy =
    totalCards > 0 ? ((correctCount / totalCards) * 100).toFixed(1) : 0;

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <CardContent>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 64, color: green[500], mb: 2 }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            学习完成！
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {deckName}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={6}>
            <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                总卡片数
              </Typography>
              <Typography variant="h4" color="primary">
                {totalCards}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={6}>
            <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                正确率
              </Typography>
              <Typography variant="h4" color="primary">
                {accuracy}%
              </Typography>
            </Paper>
          </Grid>
          <Grid size={12}>
            <Paper elevation={2} sx={{ p: 2, textAlign: "center", mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                学习用时
              </Typography>
              <Typography variant="h4" color="primary">
                {Math.floor(studyTime / 60)}分{studyTime % 60}秒
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleBackToHome}
          sx={{ minWidth: 200 }}
        >
          返回主页
        </Button>
      </CardActions>
    </Card>
  );
}

export default CardMemoEnd;
