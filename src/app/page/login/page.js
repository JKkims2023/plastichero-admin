// src/app/login/page.js
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import useAuthStore from '../../store/authStore';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // js-cookie 라이브러리 import

import logoPath from '../../../../public/logo.svg';

export default function LoginPage() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  
  useEffect(() => {
    // 이미 로그인되어 있다면 홈페이지로 리디렉션
    if (isLoggedIn) {

      router.push('/');
    
    }
  
  }, [isLoggedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await fetch('/api/login', {

        method: 'POST',
        headers: {
        
          'Content-Type': 'application/json',
        
        },
        
        body: JSON.stringify({ username, password }),
      
      });

      const data = await response.json();

      if (response.ok) {

        login( data ); // 로그인 성공
        router.push('/'); // 홈페이지로 리디렉션
        console.log('jk login3');
        
      } else {

        alert(data.message);
      
      }
    
    } catch (error) {
      console.error('Login failed:', error);

      alert('Login failed. Please try again.');
    
    }
  };

  return (
    <div style={{display:'flex', width:'100%', height:'100vh', alignContent:'center', alignItems:'center', justifyContent:'center', backgroundColor:'#f5f5f5'}}>
      
      <div style={{margin: 'auto', alignSelf:'center', alignContent:'center', alignItems:'center', justifyContent:'center', width:'300px'}}>

        <Image src={logoPath} alt='' height='100px' width='200px' style={{alignSelf:'center', margin:'auto'}}/> 

        <form onSubmit={handleSubmit}>
          <div style={{marginTop:'20px', width:'300px'}}>
            <input
              type="text"
              id="username"
              placeholder='Login ID'
              value={username}
              style={{backgroundColor:'white', borderColor:'#f2f2f2', borderWidth:'2px', padding:'10px', borderRadius:'5px', width:'100%', fontSize:14, color:'black'}}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div style={{marginTop:'10px', width:'300px'}}>
            <input
              type="password"
              id="password"
              placeholder='Login Password'
              value={password}
              style={{backgroundColor:'white', borderColor:'#f2f2f2', borderWidth:'2px', padding:'10px', borderRadius:'5px', width:'100%', fontSize:14, color:'black'}}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit"
            style={{
              backgroundColor:'#6ebe45', 
              borderColor:'#6ebe45', 
              borderWidth:'1px', 
              marginTop:'20px', 
              padding:'20px',
              paddingTop:'10px',
              paddingBottom:'10px', 
              borderRadius:'5px', 
              fontSize:20,
              color:'white',
              width:'100%'}}>
              Log in
          </button>

          <div style={{
            display:'flex',
            justifyContent:'center',
            alignSelf:'center',
          }}>
            <label
              style={{

                margin:'auto',
                marginTop:'20px',
                textAlign:'center',
                justifyContent:'center',
                alignSelf:'center',
                color:'black',
                fontSize:13,
              }}
            >Copyright @ 2025 Plastichero, All rights reserved.</label>
          </div>

        </form>
      </div>
    </div>
  );
}