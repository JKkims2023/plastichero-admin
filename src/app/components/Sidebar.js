"use client";

// src/components/Sidebar.js
import Link from 'next/link';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import styles from './Sidebar.module.css';
import { useRouter } from 'next/navigation';

const sidebarData = [
  { href: '/', label: 'Overview' },
  { href: '/about', label: '회원관리' },
  { href: '/contact', label: '인증관리' },
  {
    label: '노드관리',
    children: [
      { href: '/blog/category1', label: '사전예약관리' },
      { href: '/blog/category2', label: '사전예약 삭제리스트' },
      { href: '/blog/category3', label: '입금현황' },
    ],
  },
  { href: '/about', label: '채굴관리' },
  { href: '/about', label: '운영관리' },
  { href: '/about', label: '키오스크관리' },
  { href: '/setting', label: '섧정' },
];


export default function Sidebar() {


  const [openMenu, setOpenMenu] = useState(null);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

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
      <h2>Menu</h2>
      <ul>
        {sidebarData.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link href={item.href} legacyBehavior>
                <a>{item.label}</a>
              </Link>
            ) : (
              <>
                <div style={{display:'flex', flexDirection:'row'}}>
                  <button className={styles.menuButton} onClick={() => toggleMenu(index)}>
                    {item.label}
                  </button>
                  <button style={{marginLeft:'auto'}}>
                 {openMenu === index ? '▲' : '▼'} {/* 화살표 표시 */}
                  </button>
                </div>
                <ul className={`${styles.subMenu} ${openMenu === index ? styles.open : ''}`} style={{marginTop:'15px', marginLeft:'10px'}}> 
                  {item.children &&
                    item.children.map((child, childIndex) => (
                      <li key={childIndex}>
                        <Link href={child.href} legacyBehavior>
                          <a>{child.label}</a>
                        </Link>
                      </li>
                    ))}
                </ul>
              </>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
