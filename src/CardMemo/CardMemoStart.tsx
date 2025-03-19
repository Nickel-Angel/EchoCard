import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2"; // 更新为最新的Grid2 API
import Paper from "@mui/material/Paper";

interface CardMemoStartProps {
  deckName: string;
  tolearn: number;
  learning: number;
  toreview: number;
  onStartStudy: () => void;
}

function CardMemoStart({
  deckName,
  tolearn,
  learning,
  toreview,
  onStartStudy,
}: CardMemoStartProps) {
  const totalCards = tolearn + learning + toreview;

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {deckName}
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            今日学习统计
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                }}
              >
                <Typography variant="h5">{tolearn}</Typography>
                <Typography variant="body2">未学习</Typography>
              </Paper>
            </Grid>

            <Grid size={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: "warning.light",
                  color: "warning.contrastText",
                }}
              >
                <Typography variant="h5">{learning}</Typography>
                <Typography variant="body2">学习中</Typography>
              </Paper>
            </Grid>

            <Grid size={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: "info.light",
                  color: "info.contrastText",
                }}
              >
                <Typography variant="h5">{toreview}</Typography>
                <Typography variant="body2">待复习</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" align="center" sx={{ mt: 3 }}>
            今天共有 <b>{totalCards}</b> 张卡片需要学习
            <br />
            （点击空白处退出）
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={onStartStudy}
          disabled={totalCards === 0}
        >
          开始学习
        </Button>
      </CardActions>
    </Card>
  );
}

export default CardMemoStart;
