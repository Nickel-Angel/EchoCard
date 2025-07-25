import { Box, Button } from "@mui/material";
import { NextIntervals } from "@/api/Card";

/**
 * 评分按钮组件，用于显示记忆评分按钮
 * 在不同的卡片模板中共享使用
 */
function RatingButtons({
  handleRating,
  nextIntervals,
}: {
  handleRating: (rating: number) => void;
  nextIntervals: NextIntervals | null;
}) {
  return (
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
        忘记{" "}
        {nextIntervals?.again
          ? `(${nextIntervals.again < 1 ? "<1" : nextIntervals.again} 天)`
          : "(<1 天)"}
      </Button>
      <Button
        variant="contained"
        color="warning"
        onClick={() => handleRating(2)}
        sx={{ flex: 1, mx: 0.5 }}
      >
        困难{" "}
        {nextIntervals?.hard
          ? `(${nextIntervals.hard < 1 ? "<1" : nextIntervals.hard} 天)`
          : "(<1 天)"}
      </Button>
      <Button
        variant="contained"
        color="info"
        onClick={() => handleRating(3)}
        sx={{ flex: 1, mx: 0.5 }}
      >
        良好{" "}
        {nextIntervals?.good
          ? `(${nextIntervals.good < 1 ? "<1" : nextIntervals.good} 天)`
          : "(<1 天)"}
      </Button>
      <Button
        variant="contained"
        color="success"
        onClick={() => handleRating(4)}
        sx={{ flex: 1, mx: 0.5 }}
      >
        简单{" "}
        {nextIntervals?.easy
          ? `(${nextIntervals.easy < 1 ? "<1" : nextIntervals.easy} 天)`
          : "(<1 天)"}
      </Button>
    </Box>
  );
}

export default RatingButtons;
