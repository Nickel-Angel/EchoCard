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
import { useTabStore } from "./store/tabStore";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      style={{ width: "calc(100% - 90px)" }}
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2, height: "95%" }}>
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
  // 使用全局状态管理标签页选择
  const { activeTab, setActiveTab } = useTabStore();

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Tabs
        orientation="vertical"
        value={activeTab}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: "divider" }}
      >
        <Tab
          icon={<ImportContactsOutlinedIcon />}
          label="卡组记忆"
          {...a11yProps(0)}
        />
        <Tab icon={<EditOutlinedIcon />} label="卡组编辑" {...a11yProps(1)} />
        <Tab icon={<SettingsOutlinedIcon />} label="设置" {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={activeTab} index={0}>
        <CardMemoMain />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <CardEditMain />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <SettingsMain />
      </TabPanel>
    </Box>
  );
}

export default App;
