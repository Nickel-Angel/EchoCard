import { useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import CardMemoMain from "./CardMemo/CardMemoMain";
import CardEditMain from "./CardEdit/CardEditMain";
import SettingsMain from "./Settings/SettingsMain";
import Sidebar from "./Sidebar";

function App() {
  const [activeComponent, setActiveComponent] = useState('CardMemo');
  const [sidebarVisible, setSetbarVisible] = useState(true);

  const renderComponent = () => {
    switch(activeComponent) {
      case 'CardMemo':
        return <CardMemoMain />;
      case 'CardEdit':
        return <CardEditMain />;
      case 'Settings':
        return <SettingsMain />;
      default:
        return <CardMemoMain />;
    }    
  }

  return (
    <main className="container">
      {sidebarVisible && (<div className="sidebar-container">
        <Sidebar
        setActiveComponent={setActiveComponent} />
        </div>
      )}
      <div className="content-container">{renderComponent()}</div>
    </main>
  );
}

export default App;