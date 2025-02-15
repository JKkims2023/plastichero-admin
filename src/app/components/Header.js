"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import styles from './Sidebar.module.css';
import Logout from '@mui/icons-material/Logout'; // Material UI 아이콘 사용

import logoPath from '../../../public/logo.svg';


export default function Sidebar() {

    const [menutitle, setMenutitle] = useState('');
    const router = useRouter(); // 이 줄 추가

    const logout = useAuthStore((state) => state.logout);

    useEffect(()=>{

        
    },[menutitle]);

    const handleLogout = () => {

        try{

            console.log('logout');

            logout();
            router.push('/');

        }catch(error){

            console.log(error);

        }

    };

    return (
    
        <div style={{width:'100%', backgroundColor:'#1f1f26', padding:'20px'}}>

            <div style={{display:'flex', float:'left', width:'100%'}}>

                <Image src={logoPath} alt='' height='100px' width='100px' style={{alignSelf:'center', margin:'auto', marginLeft:'20px'}}/> 
            
                <div style={{display:'flex', flex:1, width:'100%'}}>

                <div style={{display:'flex', flex:1, width:'100%', marginLeft:'auto', paddingTop:'20px', alignContent:'center', alignItems:'center',}} onClick={handleLogout}  >

                    <Logout color="white" style={{marginLeft:'auto'}}/>
                    <a style={{fontSize:14, fontWeight:'bold', color:'white', marginLeft:'10px'}}>로그아웃</a>

                </div>

                </div>

            </div>
            
        </div>

  );
}
