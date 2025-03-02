'use client';

import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import Sidebar from './Sidebar';
import Header from './Header';

export default function ClientLayout({ children }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
  const router = useRouter();

  // 초기 마운트 시에만 체크하도록 수정
  useEffect(() => {

    /*
    const cookies = parseCookies();
    const token = cookies.token; // 또는 사용하시는 인증 토큰 이름
    
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    */
  
  }, [setIsLoggedIn]);

  // 로그인 상태 변경 시 리디렉션
  useEffect(() => {


  }, [isLoggedIn, router]);

  return (
    <div style={{display:'flex', flexDirection:'column', height: '100vh', overflow: 'hidden', backgroundColor:'red'}}>
      <main style={{display:'flex', flexDirection:'column', height: '100vh', overflow: 'hidden'}}>
        <div style={{display:'flex', flexDirection:'column', height: '100vh', overflow: 'hidden'}}>
          <Header/>
          <div className="container" style={{width:'100%', height:'100%', backgroundColor:'white', display: 'flex', flex:1}}>
            <Sidebar />
            <div style={{display:'flex', flex:1, flexDirection:'column', width:'100%', overflow: 'auto',}}>
              <main className="h-full">{children}</main>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}