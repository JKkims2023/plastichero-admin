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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Chip from '@mui/material/Chip';

import logoPath from '../../../public/logo.svg';

export default function Sidebar() {

  const [menu_auth, setMenu_auth] = useState(useAuthStore((state) => state.user));
  const [sidebarData, setSidebarData] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [isShow, setIsShow] = useState(false);

  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const user = useAuthStore((state) => state.user);

  useEffect(()=>{
    getLoginStatus();
  },[]);

  useEffect(()=>{
    console.log('isLoggedIn effect sidebar : ' + isLoggedIn);
    setIsShow(isLoggedIn);
  },[isLoggedIn]);

  const getLoginStatus = async () => {
    try{
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: '' }),
      });

      const data = await response.json();

      if (response.ok) {

        login(data);
        setSidebarData(data.menu_auth);

      } else {

        logout();

      }

    }catch(error){  

      console.log(error);

    }

  };

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

  const UserInfo = () => {
    if (!user) return null;

    return (
      <div style={{
        padding: '20px',
        margin: '15px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <AccountCircleIcon 
            style={{
              color: '#fff',
              fontSize: '32px',
              marginRight: '10px'
            }}
          />
          <Chip
            label={user.user_type == 'A' ? '총괄관리자' : user.user_type == 'M' ? '어드민' : '일반사용자'}
            size="small"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '14px',
              height: '25px'
            }}
          />
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{
            color: '#fff',
            fontSize: '13px',
            opacity: 0.7
          }}>
            ID: {user.user_id}
          </div>
          <div style={{
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {user.user_name}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className={styles.sidebar} style={{display:isShow ? 'block' : 'none'}}>
      <div style={{width:'100%', height:'1px', backgroundColor:'gray', marginTop:'0px'}}/>
      
      <UserInfo />

      <ul style={{marginTop:'10px'}}>
        {sidebarData.map((item, index) => (
          <li key={index} style={{width:'100%'}}>
            {item.href || item.label == 'Overview' ? (
              <div style={{width:'100%', padding:'20px', paddingTop:'7px', paddingBottom:'7px', alignContent:'center', alignItems:'center', justifyContent:'center'}}>
              <HomeIcon color="white" style={{marginRight:'15px', marginTop:'-5px'}}/>
              <Link href={'/'}  style={{fontSize:14, fontWeight:'bold', width:'100%',}} legacyBehavior>
                <a tabIndex="0" style={{fontSize:14, fontWeight:'bold', width:'100%', color:'white'}}>{item.label}</a>
              </Link>
              </div>
            ) : (
              <>
                <div 
                  className={styles.menuRow}
                  style={{
                    display:item.show_yn == 'show' ? 'flex' : 'none', 
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
                  <button style={{
                    marginLeft: 'auto', 
                    marginTop: '-5px',
                    fontSize: '10px',  // 화살표 크기를 10px로 조정
                    color: 'white'
                  }}>
                    {openMenu === index ? '▲' : '▼'}
                  </button>
                </div>
                <ul className={`${styles.subMenu} ${openMenu === index ? styles.open : ''}`} style={{marginTop:'5px', marginLeft:'30px'}}> 
                  {item.children &&
                    item.children.map((child, childIndex) => {
                      // 시스템 사용자 관리 메뉴에 대한 접근 권한 체크
                      const isSystemUserManageMenu = child.label === '• 시스템 사용자 관리';
                      const hasAccess = !isSystemUserManageMenu || 
                        (isSystemUserManageMenu && (user?.user_type === 'A' || user?.user_type === 'M'));

                      return (
                        <li key={childIndex} style={{display:child.checked ? 'block' : 'none'}}>
                          {hasAccess ? (
                            <Link href={child.href} legacyBehavior>
                              <a className={styles.submenuLink} 
                                style={{fontSize:13, marginLeft:'25px', color: 'white'}}>
                                {child.label}
                              </a>
                            </Link>
                          ) : (
                            <span 
                              className={styles.submenuLink} 
                              style={{
                                fontSize:13, 
                                marginLeft:'25px', 
                                color: 'rgba(255,255,255,0.5)', 
                                cursor: 'not-allowed'
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                alert('접근 권한이 없습니다.');
                              }}
                            >
                              {child.label}
                            </span>
                          )}
                        </li>
                      );
                    })}
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
