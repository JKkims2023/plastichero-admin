"use client";

import Image from "next/image";
import { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';
import SettingsIcon from '@mui/icons-material/Settings'; // Material UI 아이콘 사용

import logoPath from '../../../public/logo.svg';


export default function Sidebar() {

    const [menutitle, setMenutitle] = useState('');

    useEffect(()=>{

        
    },[menutitle]);


    return (
    
        <div style={{width:'100%', backgroundColor:'#1f1f26', padding:'20px'}}>

            <div style={{display:'flex', float:'left'}}>

                <Image src={logoPath} alt='' height='100px' width='100px' style={{alignSelf:'center', margin:'auto', marginLeft:'20px'}}/> 
                
                <div style={{width:'100%'}}>

                </div>

            </div>
            
        </div>

  );
}
