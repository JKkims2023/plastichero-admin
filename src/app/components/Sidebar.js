"use client";

// src/components/Sidebar.js
import Link from 'next/link';
import Image from "next/image";
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import styles from './Sidebar.module.css';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import SettingsIcon from '@mui/icons-material/Settings'; // Material UI 아이콘 사용
import HomeIcon from '@mui/icons-material/Home'; // Material UI 아이콘 사용
import UserIcon from '@mui/icons-material/Person'; // Material UI 아이콘 사용
import NodeIcon from '@mui/icons-material/Computer'; // Material UI 아이콘 사용
import MiningIcon from '@mui/icons-material/Build'; // Material UI 아이콘 사용
import PointIcon from '@mui/icons-material/Money'; // Material UI 아이콘 사용
import OperationIcon from '@mui/icons-material/Build'; // Material UI 아이콘 사용
import KeyIcon from '@mui/icons-material/Key'; // Material UI 아이콘 사용


import logoPath from '../../../public/logo.svg';


export default function Sidebar() {

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [menu_auth, setMenu_auth] = useState(useAuthStore((state) => state.user));
  const [sidebarData, setSidebarData] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(()=>{

    const cookies = parseCookies();

    console.log('cookies', cookies.token);

    console.log('inside menu');

    console.log('isLoggedIn : ' + isLoggedIn)

    console.log('inside menu menu_auth');
    console.log(menu_auth);
//    console.log(menu_auth.data.menu_auth);

    if(menu_auth != null && menu_auth.menu_auth != 'undefined' && menu_auth.menu_auth.length > 0){

      console.log('menu_ok');

      setSidebarData([
      
        { href: '/', label: 'Overview' },
        {
          label: '회원관리',
          children: [
            { href: '/page/user/normalUser', label: '• 일반사용자 관리' },
            { href: '/page/user/nodeUser', label: '• 노드사용자 관리' },
            { href: '/page/user/kycInfo', label: '• KYC 정보관리' },
            { href: '/page/user/blackList', label: '• 블랙리스트 관리' },
          ],
        },
        {
          label: '채굴관리',
          children: [
            { href: '/page/mining/miningList', label: '• 채굴내역' },
            { href: '/page/mining/miningSetting', label: '• 채굴설정' },
            { href: '/page/mining/miningMonitoring', label: '• 모니터링 / 재처리' },
          ],
        },
        {
          label: '포인트관리',
          children: [
            { href: '/page/point/pointList', label: '• 포인트 사용내역' },
            { href: '/page/point/swapList', label: '• 포인트 전환내역' },
          ],
        },
        {
          label: '운영관리',
          children: [
            { href: '/page/manage/noticeInfo', label: '• 공지 관리' },
            { href: '/page/manage/mailInfo', label: '• 메일 발송' },
            { href: '/page/manage/smsInfo', label: '• SMS 관리' },
            { href: '/page/manage/lockInfo', label: '• Lock 설정' },
            { href: '/page/manage/appInfo', label: '• 앱 관리' },
          ],
        },
        {
          label: '키오스크관리',
          children: [
            { href: '/page/kiosk/ownerInfo', label: '• 소유자 관리' },
            { href: '/page/kiosk/petDepositInfo', label: '• 플라스틱 수거현황' },
          ],
        },
        {
          label: '설정',
          children: [
            { href: '/page/setup', label: '• 사용자 관리' },
          ],
        },
      
      
      ]);

    }else{
    

      setSidebarData([
      
        { href: '/', label: 'Overview' },
        {
          label: '회원관리',
          children: [
            { href: '/page/user/normalUser', label: '• 일반사용자 관리' },
            { href: '/page/user/nodeUser', label: '• 노드사용자 관리' },
            { href: '/page/user/kycInfo', label: '• KYC 정보관리' },
            { href: '/page/user/blackList', label: '• 블랙리스트 관리' },
          ],
        },
        {
          label: '채굴관리',
          children: [
            { href: '/page/mining/miningList', label: '• 채굴내역' },
            { href: '/page/mining/miningSetting', label: '• 채굴설정' },
            { href: '/page/mining/miningMonitoring', label: '• 모니터링 / 재처리' },
          ],
        },
        {
          label: '포인트관리',
          children: [
            { href: '/page/point/pointList', label: '• 포인트 사용내역' },
            { href: '/page/point/swapList', label: '• 포인트 전환내역' },
          ],
        },
        {
          label: '운영관리',
          children: [
            { href: '/page/manage/noticeInfo', label: '• 공지 관리' },
            { href: '/page/manage/mailInfo', label: '• 메일 발송' },
            { href: '/page/manage/smsInfo', label: '• SMS 관리' },
            { href: '/page/manage/lockInfo', label: '• Lock 설정' },
            { href: '/page/manage/appInfo', label: '• 앱 관리' },
          ],
        },
        {
          label: '키오스크관리',
          children: [
            { href: '/page/kiosk/ownerInfo', label: '• 소유자 관리' },
            { href: '/page/kiosk/petDepositInfo', label: '• 플라스틱 수거현황' },
          ],
        },
        {
          label: '설정',
          children: [
            { href: '/page/setup', label: '• 사용자 관리' },
          ],
        },
      
      ]);


    }
    
  },[menu_auth]);

  /*
     {
          label: '노드관리',
          children: [
            { href: '/page/blog/category1', label: '• 사전예약관리' },
            { href: '/page/blog/category2', label: '• 사전예약 삭제리스트' },
            { href: '/page/blog/category3', label: '• 입금현황' },
          ],
        },

  */

  useEffect(()=>{

  },[sidebarData]);


  const toggleMenu = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const getIcon = (label) => {
    switch (label) {
      case '회원관리':
        return <UserIcon color="white" style={{marginRight:'15px', marginTop:'3px' }}/>;
      case '노드관리':
        return <NodeIcon color="white" style={{marginRight:'15px', marginTop:'3px' }}/>;
      case '채굴관리':
        return <MiningIcon color="white" style={{marginRight:'15px', marginTop:'3px' }}/>;
      case '포인트관리':
        return <PointIcon color="white" style={{marginRight:'15px', marginTop:'3px' }}/>; 
      case '운영관리':
        return <OperationIcon color="white" style={{marginRight:'15px', marginTop:'3px' }}/>; 
      case '키오스크관리':
        return <KeyIcon color="white" style={{marginRight:'15px', marginTop:'3px' }}/>; 
      case '설정':
        return <SettingsIcon color="white" style={{marginRight:'15px', marginTop:'3px' }}/>;   
      default:
        return <HomeIcon color="white" style={{marginRight:'15px', marginTop:'3px' }}/>; 
    }
  };


  return (
    
    <aside className={styles.sidebar}>

      <div style={{width:'100%', height:'1px', backgroundColor:'gray', marginTop:'0px'}}/>

        <div style={{display:'flex', flexDirection:'row', width:'100%', marginLeft:'25px',}}>

          <a style={{fontSize:14, fontWeight:'bold', color:'white', marginTop:'25px',}}></a>

        </div>


        <ul style={{marginTop:'30px'}}>
          {sidebarData.map((item, index) => (
            <li key={index} style={{width:'100%'}}>
              {item.href ? (
                <div style={{width:'100%', padding:'20px', paddingTop:'7px', paddingBottom:'7px', alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                <HomeIcon color="white" style={{marginRight:'15px', marginTop:'-5px'}}/>
                <Link href={item.href}  style={{fontSize:14, fontWeight:'bold', width:'100%',}} legacyBehavior>
                  <a tabIndex="0" style={{fontSize:14, fontWeight:'bold', width:'100%', color:'white'}}>{item.label}</a>
                </Link>
                </div>
              ) : (
                <>
                  <div 
                    className={styles.menuRow}
                    style={{
                      display:'flex', 
                      flexDirection:'row',
                      paddingTop:'10px', 
                      paddingBottom:'10px',
                      paddingLeft:'20px', 
                      paddingRight:'10px', 
                      marginRight:'10px', 

                    }}>
                    {getIcon(item.label)}
                    <button tabIndex="0" className={styles.menuButton} style={{fontSize:14, fontWeight:'bold'}} onClick={() => toggleMenu(index)}>
                      {item.label}
                    </button>
                    <button style={{marginLeft:'auto', marginTop:'-5px'}}>
                      {openMenu === index ? '▲' : '▼'}
                    </button>
                  </div>
                  <ul className={`${styles.subMenu} ${openMenu === index ? styles.open : ''}`} style={{marginTop:'5px', marginLeft:'30px'}}> 
                    {item.children &&
                      item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link href={child.href} legacyBehavior>
                            <a className={styles.submenuLink} style={{fontSize:13, marginLeft:'25px', color: 'white'}}>{child.label}</a>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
        <style jsx>{`
          
          a:focus {
            color: #4CAF50 !important; /* 초록색으로 변경 */
            outline: none;
          },
          a:not(:focus) {
            color: white !important;
            outline: none;
          },
          div:focus {

            outline: none; /* 기본 포커스 스타일 제거 (선택 사항) */
            background-color: white; /* 포커스 또는 호버 시 배경 색상 변경 */
          
            },
          div:hover {
          
            outline: none; /* 기본 포커스 스타일 제거 (선택 사항) */
            background-color: white; /* 포커스 또는 호버 시 배경 색상 변경 */
            color: white; /* 포커스 또는 호버 시 텍스트 색상 변경 */
          
            }`}
        </style>

    </aside>
  );
}
