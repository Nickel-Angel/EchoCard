import './Sidebar.css'

function SidebarButton({ setActiveComponent, imgSrc, text } : any) {
  return (
    <button onClick={() => setActiveComponent()}>
      <div><img src={imgSrc}/></div>
      <div>{text}</div>
    </button>
  );
}

function Sidebar({ setActiveComponent } : any) {
  return (
    <div className='sidebar'>
      <SidebarButton
        setActiveComponent={setActiveComponent('CardMemo')}
        imgSrc={''}
        text={'CardMemo'}
      />
      <SidebarButton
        setActiveComponent={setActiveComponent('CardEdit')}
        imgSrc={''}
        text={'CardEdit'}
      />
      <SidebarButton
        setActiveComponent={setActiveComponent('Settings')}
        imgSrc={''}
        text={'Settings'}
      />
    </div>
  );
}

export default Sidebar;