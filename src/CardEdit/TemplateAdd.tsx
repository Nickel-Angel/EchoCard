import { useEffect, useRef, useState } from "react";
import { Canvas, Rect, Circle, Textbox, FabricObject } from "fabric";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import Slider from "@mui/material/Slider";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import OpacityIcon from "@mui/icons-material/Opacity";
import Paper from "@mui/material/Paper";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PaletteIcon from "@mui/icons-material/Palette";
import Fab from "@mui/material/Fab";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TitleIcon from "@mui/icons-material/Title";
import ClearIcon from "@mui/icons-material/Clear";
import HomeIcon from "@mui/icons-material/Home";

function TemplateAdd() {
  const canvasRef = useRef<Canvas | null>(null);
  const navigate = useNavigate();

  // 状态管理
  const [fillColor, setFillColor] = useState("#f44336"); // 默认填充颜色
  const [strokeColor, setStrokeColor] = useState("#333333"); // 默认边框颜色
  const [fillOpacity, setFillOpacity] = useState(100); // 默认填充透明度
  const [strokeOpacity, setStrokeOpacity] = useState(100); // 默认边框透明度
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(true); // 侧边栏状态

  // 转换颜色为带透明度的RGBA格式
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  // 获取当前填充颜色的RGBA值
  const getFillRgba = () => hexToRgba(fillColor, fillOpacity);

  // 获取当前边框颜色的RGBA值
  const getStrokeRgba = () => hexToRgba(strokeColor, strokeOpacity);

  useEffect(() => {
    // 获取canvas元素的父容器
    const canvasContainer = document.getElementById("canvas-container");
    if (!canvasContainer) return;

    // 根据父容器大小设置canvas尺寸
    const canvas = new Canvas("my-canvas", {
      width: canvasContainer.clientWidth,
      height: canvasContainer.clientHeight,
      backgroundColor: "#fff",
      selection: true,
    });

    canvasRef.current = canvas;

    // 监听对象选中事件
    canvas.on("selection:created", function (e) {
      if (e.selected && e.selected.length > 0) {
        const obj = e.selected[0];
        setSelectedObject(obj);
        // 更新颜色状态
        if (obj.fill) {
          if (typeof obj.fill === "string") {
            if (obj.fill.startsWith("rgba")) {
              // 解析RGBA值
              const rgba = obj.fill.match(
                /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
              );
              if (rgba) {
                const r = parseInt(rgba[1]);
                const g = parseInt(rgba[2]);
                const b = parseInt(rgba[3]);
                const a = parseFloat(rgba[4]);

                // 转换为HEX格式
                const hex = `#${r.toString(16).padStart(2, "0")}${g
                  .toString(16)
                  .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                setFillColor(hex);
                setFillOpacity(Math.round(a * 100));
              } else {
                setFillColor(obj.fill);
              }
            } else {
              setFillColor(obj.fill);
              setFillOpacity(100);
            }
          }
        }
        if (obj.stroke) {
          if (typeof obj.stroke === "string") {
            if (obj.stroke.startsWith("rgba")) {
              // 解析RGBA值
              const rgba = obj.stroke.match(
                /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
              );
              if (rgba) {
                const r = parseInt(rgba[1]);
                const g = parseInt(rgba[2]);
                const b = parseInt(rgba[3]);
                const a = parseFloat(rgba[4]);

                // 转换为HEX格式
                const hex = `#${r.toString(16).padStart(2, "0")}${g
                  .toString(16)
                  .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                setStrokeColor(hex);
                setStrokeOpacity(Math.round(a * 100));
              } else {
                setStrokeColor(obj.stroke);
              }
            } else {
              setStrokeColor(obj.stroke);
              setStrokeOpacity(100);
            }
          }
        }
      }
    });

    canvas.on("selection:updated", function (e) {
      if (e.selected && e.selected.length > 0) {
        const obj = e.selected[0];
        setSelectedObject(obj);
        // 更新颜色状态
        if (obj.fill) {
          if (typeof obj.fill === "string") {
            if (obj.fill.startsWith("rgba")) {
              // 解析RGBA值
              const rgba = obj.fill.match(
                /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
              );
              if (rgba) {
                const r = parseInt(rgba[1]);
                const g = parseInt(rgba[2]);
                const b = parseInt(rgba[3]);
                const a = parseFloat(rgba[4]);

                // 转换为HEX格式
                const hex = `#${r.toString(16).padStart(2, "0")}${g
                  .toString(16)
                  .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                setFillColor(hex);
                setFillOpacity(Math.round(a * 100));
              } else {
                setFillColor(obj.fill);
              }
            } else {
              setFillColor(obj.fill);
              setFillOpacity(100);
            }
          }
        }
        if (obj.stroke) {
          if (typeof obj.stroke === "string") {
            if (obj.stroke.startsWith("rgba")) {
              // 解析RGBA值
              const rgba = obj.stroke.match(
                /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
              );
              if (rgba) {
                const r = parseInt(rgba[1]);
                const g = parseInt(rgba[2]);
                const b = parseInt(rgba[3]);
                const a = parseFloat(rgba[4]);

                // 转换为HEX格式
                const hex = `#${r.toString(16).padStart(2, "0")}${g
                  .toString(16)
                  .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                setStrokeColor(hex);
                setStrokeOpacity(Math.round(a * 100));
              } else {
                setStrokeColor(obj.stroke);
              }
            } else {
              setStrokeColor(obj.stroke);
              setStrokeOpacity(100);
            }
          }
        }
      }
    });

    canvas.on("selection:cleared", function () {
      setSelectedObject(null);
    });

    // 添加边界限制，防止元素拖出画布
    const limitObjectToCanvas = (obj: FabricObject) => {
      // 获取对象的边界框
      const objBoundingBox = obj.getBoundingRect();
      // 获取画布尺寸
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // 计算对象的新位置
      let left = obj.left;
      let top = obj.top;
      let right = objBoundingBox.left + objBoundingBox.width;
      let bottom = objBoundingBox.top + objBoundingBox.height;

      // 限制左边界
      if (objBoundingBox.left < 0) {
        left = left - objBoundingBox.left;
      }
      // 限制上边界
      if (objBoundingBox.top < 0) {
        top = top - objBoundingBox.top;
      }
      // 限制右边界
      if (right > canvasWidth) {
        left =
          canvasWidth - objBoundingBox.width + (left - objBoundingBox.left);
      }
      // 限制下边界
      if (bottom > canvasHeight) {
        top = canvasHeight - objBoundingBox.height + (top - objBoundingBox.top);
      }

      // 更新对象位置
      obj.set({
        left: left,
        top: top,
      });
    };
    // 移动时限制边界
    canvas.on("object:moving", function (e) {
      limitObjectToCanvas(e.target);
    });

    // 缩放时限制边界
    canvas.on("object:scaling", function (e) {
      e.target.setCoords();
    });

    // 缩放完成后限制边界
    canvas.on("object:modified", function (e) {
      limitObjectToCanvas(e.target);
    });

    // 旋转时限制边界
    canvas.on("object:rotating", function (e) {
      e.target.setCoords();
    });

    // 添加窗口大小变化监听器
    const handleResize = () => {
      if (canvasRef.current && canvasContainer) {
        const scaleX = canvasContainer.clientWidth / canvas.width;
        const scaleY = canvasContainer.clientHeight / canvas.height;
        const scale = Math.min(scaleX, scaleY);
        canvas.setZoom(scale);
        console.log(
          `width:${canvasContainer.clientWidth}, height: ${canvasContainer.clientHeight}`
        );
        canvasRef.current.setDimensions({
          width: canvasContainer.clientWidth * scale,
          height: canvasContainer.clientHeight * scale,
        });
        canvas.setZoom(scale);
        canvas.renderAll();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  // 添加矩形
  const addRectangle = () => {
    const canvas = canvasRef.current;
    canvas!.isDrawingMode = false;

    const rect = new Rect({
      left: 100,
      top: 100,
      fill: getFillRgba(),
      width: 100,
      height: 80,
      stroke: getStrokeRgba(),
      strokeWidth: 2,
    });

    canvas!.add(rect);
    canvas!.setActiveObject(rect);
  };

  // 添加圆形
  const addCircle = () => {
    const canvas = canvasRef.current;
    canvas!.isDrawingMode = false;

    const circle = new Circle({
      left: 200,
      top: 150,
      radius: 50,
      fill: getFillRgba(),
      stroke: getStrokeRgba(),
      strokeWidth: 2,
    });

    canvas!.add(circle);
    canvas!.setActiveObject(circle);
  };

  // 添加文本框（可双击编辑）
  const addText = () => {
    const canvas = canvasRef.current;
    canvas!.isDrawingMode = false;

    const text = new Textbox("请填写文本", {
      left: 150,
      top: 200,
      fontSize: 20,
      fill: getFillRgba(),
      width: 200,
      editable: true,
    });

    canvas!.add(text);
    canvas!.setActiveObject(text);
  };

  // 清空画布
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas!.clear();
    canvas!.backgroundColor = "#fff";
    setSelectedObject(null);
  };

  // 更新选中对象的填充颜色
  const updateFillColor = (color: string) => {
    setFillColor(color);
    if (selectedObject) {
      selectedObject.set({
        fill: hexToRgba(color, fillOpacity),
      });
      canvasRef.current?.renderAll();
    }
  };

  // 更新选中对象的边框颜色
  const updateStrokeColor = (color: string) => {
    setStrokeColor(color);
    if (selectedObject) {
      selectedObject.set({
        stroke: hexToRgba(color, strokeOpacity),
      });
      canvasRef.current?.renderAll();
    }
  };

  // 更新选中对象的填充透明度
  const updateFillOpacity = (opacity: number) => {
    setFillOpacity(opacity);
    if (selectedObject) {
      selectedObject.set({
        fill: hexToRgba(fillColor, opacity),
      });
      canvasRef.current?.renderAll();
    }
  };

  // 更新选中对象的边框透明度
  const updateStrokeOpacity = (opacity: number) => {
    setStrokeOpacity(opacity);
    if (selectedObject) {
      selectedObject.set({
        stroke: hexToRgba(strokeColor, opacity),
      });
      canvasRef.current?.renderAll();
    }
  };

  // 切换侧边栏显示状态
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // 侧边栏内容组件
  const ControlPanel = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        height: "100%", // 使Box占满整个高度
        justifyContent: "space-between", // 使内容分布在顶部和底部
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Tooltip title="返回主页">
          <IconButton
            color="primary"
            onClick={() => navigate("/")}
            sx={{ borderRadius: 2 }}
          >
            <HomeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="矩形">
          <IconButton
            color="primary"
            onClick={addRectangle}
            sx={{ borderRadius: 2 }}
          >
            <CropSquareIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="圆形">
          <IconButton
            color="primary"
            onClick={addCircle}
            sx={{ borderRadius: 2 }}
          >
            <RadioButtonUncheckedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="文本">
          <IconButton
            color="primary"
            onClick={addText}
            sx={{ borderRadius: 2 }}
          >
            <TitleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="清空画布">
          <IconButton
            color="secondary"
            onClick={clearCanvas}
            sx={{ borderRadius: 2 }}
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="填充颜色">
              <TextField
                size="small"
                type="color"
                value={fillColor}
                onChange={(e) => updateFillColor(e.target.value)}
                sx={{ width: 56 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <FormatColorFillIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Tooltip>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: 1,
              }}
            >
              <OpacityIcon fontSize="small" color="action" />
              <Slider
                size="small"
                value={fillOpacity}
                onChange={(_, value) => updateFillOpacity(value as number)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Box>

            <Paper
              elevation={1}
              sx={{
                width: 24,
                height: 24,
                bgcolor: getFillRgba(),
                border: "1px solid #ccc",
                borderRadius: 1,
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="边框颜色">
              <TextField
                size="small"
                type="color"
                value={strokeColor}
                onChange={(e) => updateStrokeColor(e.target.value)}
                sx={{ width: 56 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BorderColorIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Tooltip>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
            >
              <OpacityIcon fontSize="small" color="action" />
              <Slider
                size="small"
                value={strokeOpacity}
                onChange={(_, value) => updateStrokeOpacity(value as number)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Box>

            <Paper
              elevation={1}
              sx={{
                width: 24,
                height: 24,
                bgcolor: getStrokeRgba(),
                border: "1px solid #ccc",
                borderRadius: 1,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* 收起侧边栏按钮放在底部 */}
      <Box
        sx={{ justifyContent: "center", width: "100%", alignSelf: "flex-end" }}
      >
        <Tooltip title="收起侧边栏">
          <IconButton onClick={toggleDrawer}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 320,
        width: "100%",
      }}
    >
      <Box
        id="canvas-container"
        sx={{
          border: "1px solid #999",
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <canvas id="my-canvas" style={{ width: "100%", height: "100%" }} />
      </Box>

      <Tooltip title="打开工具栏">
        <Fab
          color="primary"
          size="medium"
          onClick={toggleDrawer}
          sx={{
            position: "absolute",
            right: 20,
            bottom: 20,
            zIndex: 1000,
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <PaletteIcon />
        </Fab>
      </Tooltip>

      {/* 侧边栏 */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        variant="persistent"
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
          },
        }}
      >
        <ControlPanel />
      </Drawer>
    </Box>
  );
}

export default TemplateAdd;
