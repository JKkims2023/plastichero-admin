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
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Chip from '@mui/material/Chip';
import RefreshIcon from '@mui/icons-material/Refresh';

const UserInfoView = ({userInfo}) => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogImage, setDialogImage] = useState('');
    const [migrationInfo, setMigrationInfo] = useState([]);
    const [migrationStatus, setMigrationStatus] = useState('N');
    const [openMigrationDialog, setOpenMigrationDialog] = useState(false);
    
    // 페이지네이션을 위한 상태 추가
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedAccordion, setExpandedAccordion] = useState(false);

    React.useEffect(()=>{


    },[]);

    React.useEffect(() => {

        if(userInfo?.mb_no != null && userInfo?.mb_no != '' && userInfo?.mb_no != 'undefined'){

            handleMigrationRequest();

        }

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

    const handleMigrationRequest = async() => {

        try{

            const response = await fetch('/api/user/mygrationInfo', {
  
                method: 'POST',
                headers: {
                
                  'Content-Type': 'application/json',
                
                },
                
                body: JSON.stringify({mb_idx : userInfo?.mb_no }),
                
            });
        
            const data = await response.json(); 
        
            if (data.result === 'success') {
    
                setMigrationInfo(data.result_data);
                setMigrationStatus(data.result_migration_status);
            } else {
    
                alert(data.error);

            }

        }catch(error){

            console.log(error);
        }
    };


    const handleMigrationDetail = () => {
        setOpenMigrationDialog(true);
        setPage(1);
        setSearchTerm('');
        setExpandedAccordion(false);
    };
    
    const handleCloseMigrationDialog = () => {
        setOpenMigrationDialog(false);
    };

    // 주소 문자열 길이에 따라 축약하는 함수
    const truncateAddress = (address, maxLength = 20) => {
        if (!address) return '-';
        if (address.length <= maxLength) return address;
        return `${address.slice(0, maxLength / 2)}...${address.slice(-maxLength / 2)}`;
    };
    
    // 상태 값에 따라 보기 좋게 표시하는 함수
    const formatStatus = (status) => {
        if (!status) return '-';
        
        switch(status.toUpperCase()) {
            case 'Y':
                return '완료';
            case 'N':
                return '대기';
            default:
                return status;
        }
    };

    // 페이지 변경 핸들러
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // 검색어 변경 핸들러
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(1); // 검색 시 첫 페이지로 이동
    };

    // 아코디언 펼치기/접기 핸들러
    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedAccordion(isExpanded ? panel : false);
    };

    // 필터링된 마이그레이션 정보
    const filteredMigrationInfo = React.useMemo(() => {
        if (!migrationInfo || !migrationInfo.length) return [];
        
        return migrationInfo.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (item.address && item.address.toLowerCase().includes(searchLower)) ||
                (item.new_address && item.new_address.toLowerCase().includes(searchLower)) ||
                (item.migration_txid && item.migration_txid.toLowerCase().includes(searchLower))
            );
        });
    }, [migrationInfo, searchTerm]);

    // 현재 페이지의 데이터
    const currentPageData = React.useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return filteredMigrationInfo.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredMigrationInfo, page, rowsPerPage]);

    // 총 페이지 수
    const totalPages = Math.ceil(filteredMigrationInfo.length / rowsPerPage);

    // 재요청 함수 구현
    const handleRetryFunc = async (item) => {
        try {
            console.log("재요청 처리중...", item);
            
            // 여기에는 실제 재요청 API 호출 코드가 들어갈 것입니다.
            // JK님이 나중에 구현하실 예정이므로 로그만 출력합니다.
            alert(`마이그레이션 재요청이 접수되었습니다. 주소: ${item.address}`);
            
            // 데이터 갱신을 위해 마이그레이션 정보 다시 불러오기
            await handleMigrationRequest();
        } catch (error) {
            console.error("마이그레이션 재요청 중 오류 발생:", error);
            alert("재요청 처리 중 오류가 발생했습니다.");
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
                                    마이그레이션 정보
                                </Typography>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleMigrationDetail}
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
                                        상세내역
                                    </Button>

                            </Box>

                            <div style={{ 
                                backgroundColor: '#f5f5f5',
                                borderRadius: '8px',
                                padding: '16px',
                                marginTop: '8px',
                                position: 'relative',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    마이그레이션 상태 : {migrationStatus == 'Y' ? '완료' : '대기'}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </Box>
            </div>

            {/* 이미지 다이얼로그 */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogContent>
                    <img src={dialogImage} alt="Enlarged User" style={{ width: '100%', height: 'auto' }} />
                </DialogContent>
            </Dialog>

            {/* 마이그레이션 정보 다이얼로그 - 여러 정보를 보여주도록 개선 */}
            <Dialog
                open={openMigrationDialog}
                onClose={handleCloseMigrationDialog}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: '10px',
                        overflow: 'hidden',
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SwapHorizIcon />
                        <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                            마이그레이션 상세 정보
                        </Typography>
                        
                        {filteredMigrationInfo.length > 0 && (
                            <>
                                <Chip 
                                    label={`전체 ${filteredMigrationInfo.length}건`}
                                    size="small"
                                    sx={{ 
                                        ml: 1, 
                                        backgroundColor: 'rgba(255,255,255,0.2)', 
                                        color: 'white',
                                        fontSize: '12px',
                                        height: '20px'
                                    }}
                                />
                                <Chip 
                                    label={`완료 ${filteredMigrationInfo.filter(item => item.recovery_status === 'Y').length}건`}
                                    size="small"
                                    sx={{ 
                                        ml: 0.5, 
                                        backgroundColor: 'rgba(46,125,50,0.7)', 
                                        color: 'white',
                                        fontSize: '12px',
                                        height: '20px'
                                    }}
                                />
                                <Chip 
                                    label={`대기 ${filteredMigrationInfo.filter(item => item.recovery_status !== 'Y').length}건`}
                                    size="small"
                                    sx={{ 
                                        ml: 0.5, 
                                        backgroundColor: 'rgba(211,47,47,0.7)', 
                                        color: 'white',
                                        fontSize: '12px',
                                        height: '20px'
                                    }}
                                />
                            </>
                        )}
                    </Box>
                    <IconButton 
                        onClick={handleCloseMigrationDialog} 
                        sx={{ color: 'white' }}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                
                {/* 검색 영역 */}
                <Box 
                    sx={{ 
                        p: 2, 
                        borderBottom: '1px solid #eaeaea',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Paper
                        component="form"
                        sx={{ 
                            p: '2px 4px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            width: '100%',
                            boxShadow: 'none',
                            border: '1px solid #e0e0e0'
                        }}
                    >
                        <IconButton sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                        <InputBase
                            sx={{ ml: 1, flex: 1, fontSize: '13px' }}
                            placeholder="주소 또는 트랜잭션 ID로 검색"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && (
                            <IconButton 
                                sx={{ p: '10px' }} 
                                aria-label="clear"
                                onClick={() => setSearchTerm('')}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Paper>
                </Box>
                
                <DialogContent sx={{ p: 2, overflowY: 'auto' }}>
                    {migrationInfo && filteredMigrationInfo.length > 0 ? (
                        <>
                            {currentPageData.map((item, index) => (
                                <Accordion 
                                    key={`migration-${page}-${index}`}
                                    expanded={expandedAccordion === `panel-${page}-${index}`}
                                    onChange={handleAccordionChange(`panel-${page}-${index}`)}
                                    sx={{ 
                                        mb: 1.5, 
                                        boxShadow: 'none', 
                                        border: '1px solid #eaeaea',
                                        '&:before': {
                                            display: 'none',
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{ 
                                            backgroundColor: '#f5f5f5',
                                            '&.Mui-expanded': {
                                                borderBottom: '1px solid #eaeaea'
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Typography 
                                                sx={{ 
                                                    fontSize: '13px', 
                                                    fontWeight: 'bold',
                                                    mr: 2,
                                                    minWidth: '30px'
                                                }}
                                            >
                                                #{(page - 1) * rowsPerPage + index + 1}
                                            </Typography>
                                            <Typography 
                                                sx={{ 
                                                    fontSize: '13px', 
                                                    flexGrow: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {truncateAddress(item.address, 30)}
                                            </Typography>
                                            <Box 
                                                sx={{ 
                                                    display: 'inline-block',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    ml: 1,
                                                    borderRadius: '4px',
                                                    backgroundColor: item.recovery_status === 'Y' ? '#e8f5e9' : '#ffebee',
                                                    color: item.recovery_status === 'Y' ? '#2e7d32' : '#d32f2f',
                                                    fontWeight: 'bold',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {formatStatus(item.recovery_status)}
                                            </Box>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0 }}>
                                        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                                            <Table size="small">
                                                <TableBody>
                                                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell 
                                                            component="th" 
                                                            scope="row"
                                                            sx={{ 
                                                                backgroundColor: '#f9f9f9',
                                                                fontWeight: 'bold',
                                                                width: '30%',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            기존 주소
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '13px', wordBreak: 'break-all' }}>
                                                            {item.address || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell 
                                                            component="th" 
                                                            scope="row"
                                                            sx={{ 
                                                                backgroundColor: '#f9f9f9',
                                                                fontWeight: 'bold',
                                                                width: '30%',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            새 주소
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '13px', wordBreak: 'break-all' }}>
                                                            {item.new_address || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell 
                                                            component="th" 
                                                            scope="row"
                                                            sx={{ 
                                                                backgroundColor: '#f9f9f9',
                                                                fontWeight: 'bold',
                                                                width: '30%',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            복구 금액
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '13px' }}>
                                                            {item.recovery_amount || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell 
                                                            component="th" 
                                                            scope="row"
                                                            sx={{ 
                                                                backgroundColor: '#f9f9f9',
                                                                fontWeight: 'bold',
                                                                width: '30%',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            사용 가능한 스왑 금액
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '13px' }}>
                                                            {item.useable_swap_amount || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell 
                                                            component="th" 
                                                            scope="row"
                                                            sx={{ 
                                                                backgroundColor: '#f9f9f9',
                                                                fontWeight: 'bold',
                                                                width: '30%',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            복구 상태
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '13px' }}>
                                                            <Box 
                                                                sx={{ 
                                                                    display: 'inline-block',
                                                                    px: 1.5,
                                                                    py: 0.5,
                                                                    borderRadius: '4px',
                                                                    backgroundColor: item.recovery_status === 'Y' ? '#e8f5e9' : '#ffebee',
                                                                    color: item.recovery_status === 'Y' ? '#2e7d32' : '#d32f2f',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                {formatStatus(item.recovery_status)}
                                                            </Box>
                                                            {item.recovery_status !== 'Y' && (
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    color="primary"
                                                                    startIcon={<RefreshIcon fontSize="small" />}
                                                                    onClick={() => handleRetryFunc(item)}
                                                                    sx={{ 
                                                                        ml: 2,
                                                                        minWidth: '80px',
                                                                        height: '28px',
                                                                        fontSize: '12px',
                                                                        backgroundColor: '#1565c0',
                                                                        '&:hover': { backgroundColor: '#0d47a1' }
                                                                    }}
                                                                >
                                                                    재요청
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell 
                                                            component="th" 
                                                            scope="row"
                                                            sx={{ 
                                                                backgroundColor: '#f9f9f9',
                                                                fontWeight: 'bold',
                                                                width: '30%',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            마이그레이션 트랜잭션 ID
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '13px', wordBreak: 'break-all' }}>
                                                            {item.migration_txid ? 
                                                                <a 
                                                                    href={`https://explorer.plasticherokorea.com/search-results?q=${item.migration_txid}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        color: '#1976d2',
                                                                        textDecoration: 'none',
                                                                        fontWeight: 500,
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                                                    onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                                                                >
                                                                    {item.migration_txid}
                                                                </a> 
                                                                : '-'
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </AccordionDetails>
                                </Accordion>
                            ))}

                            {/* 페이지네이션 */}
                            {totalPages > 1 && (
                                <Stack 
                                    spacing={2} 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        mt: 3,
                                        mb: 1
                                    }}
                                >
                                    <Pagination 
                                        count={totalPages} 
                                        page={page}
                                        onChange={handleChangePage}
                                        color="primary"
                                        size="small"
                                    />
                                </Stack>
                            )}
                        </>
                    ) : (
                        <Box 
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 5,
                                color: '#666'
                            }}
                        >
                            {searchTerm ? (
                                <>
                                    <SearchIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                                    <Typography>검색 결과가 없습니다</Typography>
                                </>
                            ) : (
                                <Typography>마이그레이션 정보가 없습니다</Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', justifyContent: 'space-between' }}>
                    {searchTerm && filteredMigrationInfo.length > 0 && (
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>
                            검색결과: 총 {filteredMigrationInfo.length}건
                        </Typography>
                    )}
                    <Button
                        onClick={handleCloseMigrationDialog}
                        variant="outlined"
                        sx={{ minWidth: '80px', ml: 'auto' }}
                        color="primary"
                    >
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )


};

export default UserInfoView;