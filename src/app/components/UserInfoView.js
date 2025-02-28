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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';


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

    const [currentIndex, setCurrentIndex] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogImage, setDialogImage] = useState('');

    const handlePrev = () => {
        if (userInfo && userInfo.mb_images && Array.isArray(userInfo.mb_images) && userInfo.mb_images.length > 0) {
            setCurrentIndex((prevIndex) => (prevIndex === 0 ? userInfo.mb_images.length - 1 : prevIndex - 1));
        }
    };

    const handleNext = () => {
        if (userInfo && userInfo.mb_images && Array.isArray(userInfo.mb_images) && userInfo.mb_images.length > 0) {
            setCurrentIndex((prevIndex) => (prevIndex === userInfo.mb_images.length - 1 ? 0 : prevIndex + 1));
        }
    };

    const handleImageClick = (image) => {
        setDialogImage(image);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setDialogImage(null);
    };

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

                <div style={{width:'100%', height:'1px', backgroundColor:'#f0f0f0',}}/>

                <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VerifiedUserIcon sx={{ color: '#1f1f26' }} />
                    <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"normal", color:"#1f1f26", marginLeft:"3px"}} >
                        KYC 인증정보 
                    </Typography>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', backgroundColor: 'black', padding: '10px', overflow: 'hidden', marginTop:'10px' }}>
                    {userInfo.mb_images && Array.isArray(userInfo.mb_images) && userInfo.mb_images.length > 0 ? (
                        <>
                            <button onClick={handlePrev} disabled={currentIndex === 0} style={{ color: 'white' }}>◀</button>
                            <img 
                                src={userInfo.mb_images[currentIndex]} 
                                alt="User" 
                                style={{ maxWidth: 'calc(100% - 40px)', height: 'auto', borderRadius: '8px', cursor: 'pointer' }} 
                                onClick={() => handleImageClick(userInfo.mb_images[currentIndex])} 
                            />
                            <button onClick={handleNext} disabled={currentIndex === (userInfo.mb_images.length - 1)} style={{ color: 'white' }}>▶</button>
                        </>
                    ) : (
                        <Typography sx={{ color: 'white' }}>인증되지 않은 사용자입니다.</Typography>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    {userInfo.mb_images.map((_, index) => (
                        <span key={index} style={{ 
                            height: '10px', 
                            width: '10px', 
                            borderRadius: '50%', 
                            backgroundColor: currentIndex === index ? 'black' : 'lightgray', 
                            margin: '0 5px', 
                            display: 'inline-block' 
                        }} />
                    ))}
                </div>
                </div>
            </div>
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                aria-labelledby="dialog-title" 
                aria-describedby="dialog-description"
            >
                <DialogContent>
                    <img src={dialogImage} alt="Enlarged User" style={{ width: '100%', height: 'auto' }} />
                </DialogContent>
            </Dialog>
        </div>        
    )


};

export default UserInfoView;