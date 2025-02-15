import React, { useState, useRef, useCallback, useEffect } from "react";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SettingsIcon from '@mui/icons-material/Settings';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const UserInfoView = ({userInfo}) => {


    React.useEffect(()=>{



    },[]);

    React.useEffect(() => {

        console.log('userInfo effect');
        console.log(userInfo);

    },[userInfo]);


    const OnClickUpdateCustomer = () => {

    };

    const OnclickUpdateCustomerMemo = () => {

    };

    function phoneFomatter(num){
    
        var formatNum = '';
        
        try{
         
          if(num.length === 11){
                
            formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
          
          }else if(num.length === 8){
              
            formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
          
          }else{
    
              if(num.indexOf('02')==0){
                  formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
              }else{
                  formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
              }
          }
          
        }catch(error){
    
          console.log(error);
    
          formatNum = num;
    
        }
    
        return formatNum;
    }


    return (

        <div style={{width:"100%", height:"100%", backgroundColor:"white"}}>
            <div style={{display:'flex', float:"left", width:"100%", background:"green", paddingTop:"10px", paddingBottom:"10px"}}>
                <Typography fontWeight="medium" sx={{fontSize:16, fontWeight:"normal", color:"white", marginLeft:"10px"}} >
                    사용자 : {userInfo.mb_name} 
                </Typography>
            </div>

            <div style={{
                display:'flex',
                flexDirection:'column',
                padding: '10px',
                width: '100%',
                boxSizing: 'border-box',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PersonIcon sx={{ color: '#1f1f26', marginTop:"6px"}} />
                    <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"normal", color:"#1f1f26", marginTop:"10px", marginLeft:"3px"}} >
                        아이디 : {userInfo.mb_id} 
                    </Typography>
                </div>
                
                <div style={{width:'100%', height:'1px', backgroundColor:'#f0f0f0',}}/>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EmailIcon sx={{ color: '#1f1f26' }} />
                    <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"normal", color:"#1f1f26", marginLeft:"3px"}} >
                        이메일 : {userInfo.mb_email} 
                    </Typography>
                </div>

                <div style={{width:'100%', height:'1px', backgroundColor:'#f0f0f0',}}/>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PhoneIcon sx={{ color: '#1f1f26' }} />
                    <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"normal", color:"#1f1f26", marginLeft:"3px"}} >
                        핸드폰 : {userInfo.mb_hp} 
                    </Typography>
                </div>

                <div style={{width:'100%', height:'1px', backgroundColor:'#f0f0f0',}}/>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarTodayIcon sx={{ color: '#1f1f26' }} />
                    <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"normal", color:"#1f1f26", marginLeft:"3px"}} >
                        가입일 : {userInfo.mb_datetime} 
                    </Typography>
                </div>

                <div style={{width:'100%', height:'1px', backgroundColor:'#f0f0f0',}}/>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AccessTimeIcon sx={{ color: '#1f1f26' }} />
                    <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"normal", color:"#1f1f26", marginLeft:"3px"}} >
                        최근 접속일 : {userInfo.mb_today_login} 
                    </Typography>
                </div>
            </div>
        </div>        
    )


};

export default UserInfoView;