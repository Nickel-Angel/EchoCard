import { useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import CardMemoMain from "./CardMemo/CardMemoMain";
import CardEditMain from "./CardEdit/CardEditMain";
import SettingsMain from "./Settings/SettingsMain";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ImportContactsOutlinedIcon from "@mui/icons-material/ImportContactsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      className="tabpanel"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, height: "93%" }}>
          <Typography sx={{ height: "100%" }}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex", height: "100%", overflow: "hidden" }}>
      <Tabs
        orientation="vertical"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: "divider" }}
      >
        <Tab
          icon={<ImportContactsOutlinedIcon />}
          label="牌组记忆"
          {...a11yProps(0)}
        />
        <Tab icon={<EditOutlinedIcon />} label="牌组编辑" {...a11yProps(1)} />
        <Tab icon={<SettingsOutlinedIcon />} label="设置" {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <CardMemoMain />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <CardEditMain />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <SettingsMain />
      </TabPanel>
    </Box>
  );
}

export default App;
