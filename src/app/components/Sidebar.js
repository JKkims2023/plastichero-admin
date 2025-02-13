"use client";

// src/components/Sidebar.js
import Link from 'next/link';
import Image from "next/image";
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import styles from './Sidebar.module.css';
import { useRouter } from 'next/navigation';
import SettingsIcon from '@mui/icons-material/Settings'; // Material UI 아이콘 사용

import logoPath from '../../../public/logo.svg';


export default function Sidebar() {

  const [menu_auth, setMenu_auth] = useState(useAuthStore((state) => state.user));
  const [sidebarData, setSidebarData] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(()=>{

    console.log('inside menu');

    console.log(menu_auth.data.menu_auth);

    if(menu_auth.data.menu_auth != 'undefined' && menu_auth.data.menu_auth.length > 0){

      console.log('menu_ok');

      setSidebarData([
      
        { href: '/', label: 'Overview' },
        {
          label: '회원관리',
          children: [
            { href: '/page/user/normalUser', label: '어플사용자 리스트' },
            { href: '/page/user/nodeUser', label: '노드사용자 리스트' },
          ],
        },
        { href: '/page/contact', label: '인증관리' },
        {
          label: '노드관리',
          children: [
            { href: '/page/blog/category1', label: '사전예약관리' },
            { href: '/page/blog/category2', label: '사전예약 삭제리스트' },
            { href: '/page/blog/category3', label: '입금현황' },
          ],
        },
        { href: '/page/about', label: '채굴관리' },
        { href: '/page/about', label: '운영관리' },
        { href: '/page/about', label: '키오스크관리' },
        { href: '/page/setting', label: '섧정' },
      
      ]);

    }
    
  },[menu_auth]);

  useEffect(()=>{

  },[sidebarData]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        logout();
        router.push('/login'); // 로그아웃 후 로그인 페이지로 리디렉션
      } else {
        console.error('Logout failed');
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const toggleMenu = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };


  return (
    
    <aside className={styles.sidebar}>

      <div style={{width:'100%', height:'1px', backgroundColor:'gray', marginTop:'0px'}}/>

        <ul style={{marginTop:'30px'}}>
          {sidebarData.map((item, index) => (
            <li key={index} style={{width:'100%'}}>
              {item.href ? (
                <div style={{width:'100%', padding:'20px', paddingTop:'7px', paddingBottom:'7px', alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                <SettingsIcon color="white" style={{marginRight:'15px', marginTop:'-5px'}}/>
                <Link href={item.href}  style={{fontSize:14, fontWeight:'bold', width:'100%',}} legacyBehavior>
                  <a tabIndex="0" style={{fontSize:14, fontWeight:'bold', width:'100%', color:'white'}}>{item.label}</a>
                </Link>
                </div>
              ) : (
                <>
                  <div style={{display:'flex', flexDirection:'row', paddingLeft:'20px', paddingRight:'20px', marginRight:'10px'}}>
                    <button   tabIndex="0" className={styles.menuButton} style={{fontSize:14, fontWeight:'bold'}} onClick={() => toggleMenu(index)}>
                      {item.label}
                    </button>
                    <button style={{marginLeft:'auto'}}>
                  {openMenu === index ? '▲' : '▼'} {/* 화살표 표시 */}
                    </button>
                  </div>
                  <ul className={`${styles.subMenu} ${openMenu === index ? styles.open : ''}`} style={{marginTop:'15px', marginLeft:'30px'}}> 
                    {item.children &&
                      item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link href={child.href} legacyBehavior>
                            <a style={{fontSize:12}}>{child.label}</a>
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
         
           color:white;
           outline: none; /* 기본 포커스 스타일 제거 (선택 사항) */
        
           },
          div:focus {

            outline: none; /* 기본 포커스 스타일 제거 (선택 사항) */
            background-color: white; /* 포커스 또는 호버 시 배경 색상 변경 */
          
            },
          div:hover {
          
            outline: none; /* 기본 포커스 스타일 제거 (선택 사항) */
            background-color: white; /* 포커스 또는 호버 시 배경 색상 변경 */
            color: blue; /* 포커스 또는 호버 시 텍스트 색상 변경 */
          
            }`}
        </style>

    </aside>
  );
}
