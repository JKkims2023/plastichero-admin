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
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';


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

        console.log(image);
        setDialogImage(`${process.env.NEXT_PUBLIC_IMG_URL_LOCAL}${image}`);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setDialogImage(null);
    };

    const handleKycRequest = async() => {

        try{

            const response = await fetch('/api/user/pushRequest', {

                method: 'POST',
                headers: {
                
                  'Content-Type': 'application/json',
                
                },
                
                body: JSON.stringify({ 
      
                    token: userInfo.push_key,
                    title: 'KYC 인증 요청',
                    body: '내페이지 메뉴를 클릭하여, KYC 인증 절차를 수행해주세요',
                    data: 'PlasticHero',
      
                }),
              
            });

            console.log(response);
        
            const data = await response.json(); 
    
            if (data.result === 'success') {
    
                alert('KYC 인증 요청이 완료되었습니다.');
            } else {
    
                alert(data.error);
            
            }

        }catch(error){

            console.log(error);
        }
    };

    return (
        <div style={{
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#1976d2',
                padding: '16px',
                color: 'white'
            }}>
                <PersonIcon sx={{ fontSize: 20 }} />
                <Typography 
                    component="span"
                    sx={{ 
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    사용자 정보: {userInfo.mb_name}
                </Typography>
            </div>

            <div style={{
                padding: '20px',
                flex: '1 1 auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <Box sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    p: 2.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <PersonIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    아이디
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: '13px',
                                color: '#666666',
                                ml: 3.5
                            }}>
                                {userInfo.mb_id}
                            </Typography>
                            <Divider sx={{ mt: 2 }} />
                        </div>

                        <div>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <EmailIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    이메일
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: '13px',
                                color: '#666666',
                                ml: 3.5
                            }}>
                                {userInfo.mb_email}
                            </Typography>
                            <Divider sx={{ mt: 2 }} />
                        </div>

                        <div>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <PhoneIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    핸드폰
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: '13px',
                                color: '#666666',
                                ml: 3.5
                            }}>
                                {phoneFomatter(userInfo.mb_hp)}
                            </Typography>
                            <Divider sx={{ mt: 2 }} />
                        </div>

                        <div>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <CalendarTodayIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    가입일
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: '13px',
                                color: '#666666',
                                ml: 3.5
                            }}>
                                {userInfo.mb_datetime}
                            </Typography>
                            <Divider sx={{ mt: 2 }} />
                        </div>

                        <div>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <AccessTimeIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    최근 접속일
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: '13px',
                                color: '#666666',
                                ml: 3.5
                            }}>
                                {userInfo.mb_today_login}
                            </Typography>
                            <Divider sx={{ mt: 2 }} />
                        </div>

                        <div>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                                <VerifiedUserIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    KYC 인증정보
                                </Typography>
                                {((userInfo.push_key != null && userInfo.push_key != '')) && (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleKycRequest}
                                        sx={{
                                            ml: 'auto',
                                            fontSize: '12px',
                                            height: '28px',
                                            backgroundColor: '#4CAF50',
                                            '&:hover': {
                                                backgroundColor: '#388E3C'
                                            }
                                        }}
                                    >
                                        인증요청
                                    </Button>
                                )}
                            </Box>

                            <div style={{ 
                                backgroundColor: '#f5f5f5',
                                borderRadius: '8px',
                                padding: '16px',
                                marginTop: '8px',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                {userInfo.mb_images && Array.isArray(userInfo.mb_images) && userInfo.mb_images.length > 0 ? (
                                    <>
                                        <button 
                                            onClick={handlePrev} 
                                            disabled={currentIndex === 0}
                                            style={{
                                                position: 'absolute',
                                                left: '24px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 2,
                                                opacity: currentIndex === 0 ? 0.3 : 1,
                                                transition: 'opacity 0.2s, background-color 0.2s',
                                                ':hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                                                }
                                            }}
                                        >
                                            ◀
                                        </button>
                                        <img 
                                            src={`${process.env.NEXT_PUBLIC_IMG_URL_LOCAL}${userInfo.mb_images[currentIndex]}`} 
                                            alt="User" 
                                            style={{ 
                                                width: '100%',
                                                height: 140,
                                                objectFit: 'cover', 
                                                borderRadius: '8px', 
                                                cursor: 'pointer',
                                                position: 'relative',
                                                zIndex: 1
                                            }} 
                                            onClick={() => handleImageClick(userInfo.mb_images[currentIndex])} 
                                        />
                                        <button 
                                            onClick={handleNext} 
                                            disabled={currentIndex === (userInfo.mb_images.length - 1)}
                                            style={{
                                                position: 'absolute',
                                                right: '24px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 2,
                                                opacity: currentIndex === (userInfo.mb_images.length - 1) ? 0.3 : 1,
                                                transition: 'opacity 0.2s, background-color 0.2s',
                                                ':hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                                                }
                                            }}
                                        >
                                            ▶
                                        </button>
                                    </>
                                ) : (
                                    <Typography sx={{ color: '#666' }}>인증되지 않은 사용자입니다.</Typography>
                                )}
                            </div>
                        </div>
                    </div>
                </Box>
            </div>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogContent>
                    <img src={dialogImage} alt="Enlarged User" style={{ width: '100%', height: 'auto' }} />
                </DialogContent>
            </Dialog>
        </div>
    )


};

export default UserInfoView;