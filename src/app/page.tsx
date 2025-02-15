import React from "react";
import Image from "next/image";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MiningIcon from '@mui/icons-material/Hardware';
import PointIcon from '@mui/icons-material/Stars';
import KioskIcon from '@mui/icons-material/TouchApp';


export default function Home() {

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      width: '100%',
      height: '100vh',
      gap: '4px',
      padding: '4px',
      backgroundColor: '#333',  // 구분선 색상
    }}>
      <div style={{
        flex: '1 1 calc(50% - 4px)',
        height: 'calc(50% - 4px)',
        backgroundColor: 'white',
        display: 'flex',
        padding: '10px',
        gap: '10px'
      }}>
        <PeopleAltIcon style={{ fontSize: 18, color: '#555' }} />
        <a style={{color:'black', fontSize:'15px', fontWeight:'bold'}}>회원 요약정보</a>
      </div>
      <div style={{
        flex: '1 1 calc(50% - 4px)',
        height: 'calc(50% - 4px)',
        backgroundColor: 'white',
        display: 'flex',
        padding: '10px',
        gap: '10px'
      }}>
        <MiningIcon style={{ fontSize: 18, color: '#555' }} />
        <a style={{color:'black', fontSize:'15px', fontWeight:'bold'}}>채굴 요약정보</a>
      </div>
      <div style={{
        flex: '1 1 calc(50% - 4px)',
        height: 'calc(50% - 4px)',
        backgroundColor: 'white',
        display: 'flex',
        padding: '10px',
        gap: '10px'
      }}>
        <PointIcon style={{ fontSize: 18, color: '#555' }} />
        <a style={{color:'black', fontSize:'15px', fontWeight:'bold'}}>포인트 요약정보</a>
      </div>
      <div style={{
        flex: '1 1 calc(50% - 4px)',
        height: 'calc(50% - 4px)',
        backgroundColor: 'white',
        display: 'flex',
        padding: '10px',
        gap: '10px'
      }}>
        <KioskIcon style={{ fontSize: 18, color: '#555' }} />
        <a style={{color:'black', fontSize:'15px', fontWeight:'bold'}}>키오스크 요약정보</a>
      </div>
    </div>
  );
}
