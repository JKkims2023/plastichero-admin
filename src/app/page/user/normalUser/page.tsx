'use client';

import React from "react";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { 
    DataGrid,
    GridToolbar, 
    GridRowsProp, 
    GridColDef, 
    GridToolbarContainer, 
    GridToolbarExport, 
    GridToolbarColumnsButton, 
    GridToolbarFilterButton,
    gridClasses,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
    GridPagination
} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';


import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { alpha, styled } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import SortIcon from '@mui/icons-material/Sort';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { GridEventListener } from '@mui/x-data-grid';
import UserInfoView from '../../../components/UserInfoView';
import PointHistoryView from '../../../components/PointHistoryView';
import WalletInfoView from '../../../components/WalletInfoView';
import { get } from "http";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from "@mui/material/Backdrop";

// 디바운스 훅 추가
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// 필터링 유틸리티 함수
const filterUsers = (users, { userType, searchField, keyword }) => {
  // 빈 배열 체크 - 방어적 프로그래밍
  if (!users || users.length === 0) return [];
  
  let filtered = [...users];
  
  // 1. 회원 유형 필터링
  if (userType !== 10) { // 10이 아니면 필터링 적용
    filtered = filtered.filter(user => {
      switch(userType) {
        case 20: // 정상 이용자
          return user.block_yn === 'N' && user.lock_yn === 'N';
        case 30: // 블랙 이용자
          return user.block_yn === 'Y';
        case 40: // Lock 적용 이용자
          return user.lock_yn === 'Y';
        default:
          return true;
      }
    });
  }
  
  // 2. 키워드 필터링 (대소문자 구분 없이)
  if (keyword && keyword.trim().length > 0) {
    const normalizedKeyword = keyword.trim().toLowerCase();
    
    if (searchField === 'all') {
      filtered = filtered.filter(user => 
        (user.mb_id && user.mb_id.toLowerCase().includes(normalizedKeyword)) ||
        (user.mb_name && user.mb_name.toLowerCase().includes(normalizedKeyword)) ||
        (user.mb_email && user.mb_email.toLowerCase().includes(normalizedKeyword)) ||
        (user.mb_wallet && user.mb_wallet.toLowerCase().includes(normalizedKeyword))
      );
    } else if (searchField === 'id') {
      filtered = filtered.filter(user => 
        user.mb_id && user.mb_id.toLowerCase().includes(normalizedKeyword)
      );
    } else if (searchField === 'name') {
      filtered = filtered.filter(user => 
        user.mb_name && user.mb_name.toLowerCase().includes(normalizedKeyword)
      );
    } else if (searchField === 'email') {
      filtered = filtered.filter(user => 
        user.mb_email && user.mb_email.toLowerCase().includes(normalizedKeyword)
      );
    } else if (searchField === 'wallet') {
      filtered = filtered.filter(user => 
        user.mb_wallet && user.mb_wallet.toLowerCase().includes(normalizedKeyword)
      );
    }
  }
  
  // ID 재할당
  return filtered.map((user, idx) => ({ ...user, id: idx + 1 }));
};

type Anchor = 'bottom';

const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({

    [`& .${gridClasses.row}.even`]: {
      backgroundColor: theme.palette.grey[50],
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
        '@media (hover: none)': {
          backgroundColor: 'transparent',
        },
      },
      '&.Mui-selected': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity,
        ),
        '&:hover': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY +
              theme.palette.action.selectedOpacity +
              theme.palette.action.hoverOpacity,
          ),
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            backgroundColor: alpha(
              theme.palette.primary.main,
              ODD_OPACITY + theme.palette.action.selectedOpacity,
            ),
          },
        },
      },
    },
}));



export default function Home() {

    const ref_Div = React.useRef<HTMLDivElement>(null);
    const ref_Grid = React.useRef(0);

    const [pagingIdx, setPaginIdx] = React.useState('0');
    const [filterInfo, setFilterInfo] = React.useState('');
    const [userList, setUserList] = React.useState([]);
    const [filterUserList, setFilterUserList] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState({

        contentID : '',
        contentTitle : '',
    
    });

    const [filterUserTypeMethod, setFilterUserTypeMethod] = React.useState(10);
    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('all');
    const [stateBottom, setStateBottom] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isFiltering, setIsFiltering] = React.useState(false);
    const [totalUserCount, setTotalUserCount] = React.useState(0);
    const [leaveUserCount, setLeaveUserCount] = React.useState(0);
    const [blackUserCount, setBlackUserCount] = React.useState(0);
    const [lockUserCount, setLockUserCount] = React.useState(0);
    const [filteredCount, setFilteredCount] = React.useState(0);

    // 디바운스된 검색어 생성
    const debouncedFilterInfo = useDebounce(filterInfo, 300);

    const page_info = 'Home > 회원관리 > 일반 회원리스트';

    // @ts-ignore
    const columns: GridColDef<(typeof rows)[number]>[] = [
      {   
          field: 'id', 
          headerName: 'No', 
          type: 'string',
          flex: 0.3,             
          disableColumnMenu: true, 
      },
      {
          field: 'mb_id',
          headerName: '사용자ID',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_name',
          headerName: '사용자명',
          type: 'string',
          flex: 0.6,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_email',
          headerName: '이메일',
          type: 'string',
          flex: 1.2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_point',
          headerName: '보유포인트',
          type: 'string',
          flex: 0.6,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_wallet',
          headerName: '지갑주소',
          type: 'string',
          flex: 2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_today_login',
          headerName: '최근 접속일',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_datetime',
          headerName: '가입일',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
        field: 'detail',
        headerName: '상세정보',
        flex: 0.5,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
            <div style={{ width: '100%', textAlign: 'center' }}>
                <Button
                    variant="contained"
                    size="small"
                    sx={{ fontSize: '12px' }}
                    onClick={(event) => {

                        event.stopPropagation();

                        console.log('JK');
                        console.log(filterUserList[params.row.id - 1].mb_images);

                        if(filterUserList[params.row.id - 1].mb_images == ''){

                          const userInfo = {...filterUserList[params.row.id - 1], mb_images: []};
                          setSelectedContent(userInfo);
                          
                        }else{

                          
                          const userInfo = {
                              ...filterUserList[params.row.id - 1], 
                              mb_images: filterUserList[params.row.id - 1].mb_images.split('|').filter(image => image !== '') // 빈 문자열 제거
                          };
                          setSelectedContent(userInfo);
                        
                        }
                        
                        setStateBottom(true);
                    }}
                >
                    보기
                </Button>
            </div>
        ),
      },
    ];

    React.useEffect(()=>{
  
      try{

          if (ref_Div.current) {

            const offsetHeight = ref_Div.current.offsetHeight;
            const offsetWidth = ref_Div.current.offsetWidth;
            
            console.log('Height:', offsetHeight, 'Width:', offsetWidth);

            ref_Grid.current = offsetHeight - 0;

            get_UserInfo();

          }

      }catch(error){

        console.error('Error getting dimensions:', error);

      }

    },[]);

    // 필터링 적용 함수
    const handleFilterApply = () => {
      try {
        setIsFiltering(true);
        
        const filteredData = filterUsers(userList, {
          userType: filterUserTypeMethod,
          searchField: filterContentTypeValueMethod,
          keyword: debouncedFilterInfo
        });
        
        setFilterUserList(filteredData);
        setFilteredCount(filteredData.length);
      } catch (error) {
        console.error('필터링 중 오류 발생:', error);
        // 오류 시 원본 데이터 사용
        setFilterUserList(userList);
      } finally {
        setIsFiltering(false);
      }
    };

    // 디바운스된 검색어가 변경될 때마다 필터링 적용
    React.useEffect(() => {
      if (userList.length > 0) {
        handleFilterApply();
      }
    }, [debouncedFilterInfo, filterUserTypeMethod, filterContentTypeValueMethod]);

    const get_UserInfo = async() => {

      try{

        setIsLoading(true);
        
        const response = await fetch('/api/user', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({ pagingIdx, filterInfo }),
        
        });
  
        const data = await response.json(); 
  
        if (response.ok) {

          console.log(data.result_data);

          setTotalUserCount(data.total_count);
          setLeaveUserCount(data.leave_count);
          setBlackUserCount(data.black_count);
          setLockUserCount(data.result_data.filter((data) => data.lock_yn === 'Y').length);

          const mappedData = data.result_data.map((data, idx) => ({ id: idx + 1, ...data }));
          setUserList(mappedData);
          setFilterUserList(mappedData);
          setFilteredCount(mappedData.length);
          
        } else {
  
          alert(data.message);
        
        }

      }catch(error){

        console.log(error);

      } finally {
        setIsLoading(false);
      }

    };

    const toggleDrawer = (anchor: Anchor, open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        
      if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
          
        return;
        
      }
    
      setStateBottom(false);
   
    };
    
    const handleChangeFilterUserType = (event: SelectChangeEvent<number>) => {

      try{

        setFilterUserTypeMethod(Number(event.target.value));
 
      }catch(error){
        
        console.log(error);

      }
    
    }

    const handleChangeFilterContentType = (event: SelectChangeEvent<number>) => {

        try{


          setFilterContentTypeMethod(Number(event.target.value)); 

          switch(event.target.value){

            case 10:{
              console.log('all');
              setFilterContentTypeValueMethod('all');
            }break;
            case 20:{
              console.log('id');
              setFilterContentTypeValueMethod('id');
            }break;
            case 30:{
              console.log('name');
              setFilterContentTypeValueMethod('name');
            }break;
            case 40:{
              console.log('email');
              setFilterContentTypeValueMethod('email');
            }break;
            case 50:{
              console.log('wallet');
              setFilterContentTypeValueMethod('wallet');
            }break;
            default:{ 
              console.log('default');
              setFilterContentTypeValueMethod('all');
            }break;  

          }

        }catch(error){

            console.log(error);

        }
    };

    const handleClickDeleteKeyword = () => {

      try{

        setFilterInfo('');

      }catch(error){

        console.log(error);

      }

    };

    // 검색 버튼 클릭 핸들러 단순화
    const handleClickSearch = () => {
    //  handleFilterApply();

      handleResetFilters();

      get_UserInfo();
    
    };

    // 필터 초기화 함수
    const handleResetFilters = () => {
      setFilterInfo('');
      setFilterUserTypeMethod(10);
      setFilterContentTypeMethod(10);
      setFilterContentTypeValueMethod('all');
    };

    // Custom Pagination Component
    function CustomPagination() {
      
      const apiRef = useGridApiContext();
      const page = useGridSelector(apiRef, gridPageSelector);
      const pageCount = useGridSelector(apiRef, gridPageCountSelector);

      return (
        <Box
            sx={{
                display: 'flex',
                width: 'auto',
                marginLeft: 'auto',
                marginRight: 'auto',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2
            }}
        >
            <IconButton
                onClick={() => apiRef.current.setPage(0)}
                disabled={page === 0}
                sx={{ padding: '4px' }}
            >
                <FirstPageIcon />
            </IconButton>
            <GridPagination />
            <IconButton
                onClick={() => apiRef.current.setPage(pageCount - 1)}
                disabled={page === pageCount - 1}
                sx={{ padding: '4px' }}
            >
                <LastPageIcon />
            </IconButton>
        </Box>
      );
    
    };


  return (

    <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px', position: 'relative'}}>
            
      <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

          <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

      </div>

      <div style={{}}>
          <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
              일반 회원리스트
          </Typography>
      </div>

      <div style={{marginTop:'-10px'}}>
        {/* Summary 정보 영역 추가 */}
        <Grid container spacing={2} style={{ marginTop: '0px' }}>
          {['누적 가입자', '정상 이용자', '블랙 이용자', 'Lock 적용 이용자', '탈퇴한 이용자'].map((title, index) => (
            <Grid item xs={2.4} key={index}> {/* xs={2.4}로 조정하여 한 줄에 5개 항목 배치 */}
              <div style={{
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: 2, 
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                textAlign: 'left',
              }}>
                <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>{title}</Typography>
                <Typography variant="body1" style={{ color: 'black', fontSize: '24px', fontWeight: 'bold' }}>
                  {index === 0 ? totalUserCount.toLocaleString() : 
                    index === 1 ? userList.length.toLocaleString() :
                    index === 2 ? blackUserCount.toLocaleString() : 
                    index === 3 ? lockUserCount.toLocaleString() : 
                    index === 4 ? leaveUserCount.toLocaleString() :
                    0
                    } 
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>
        {/* Summary 정보 영역 추가 끝 */}
      </div>

      <div style={{
        
        display:"flex", 
        float:"left",  
        marginTop:'10px', 
        paddingTop:"10px", 
        paddingBottom:"10px", 
        paddingLeft:"10px",
        width:"100%", 
        borderRadius:'5px', 
        borderColor:'#f1f1f1', 
        borderWidth:'2px', 
        backgroundColor:'#efefef',
        alignContent:'center',
        alignItems:'center',
        
        }}>

        <div style={{display:"flex", float:"left"}}>

          <FormControl fullWidth sx={{ 
              width: "110px", 
              marginTop: "0px", 
              marginLeft: "8px",
              '& .MuiOutlinedInput-root': {
                  height: '33px',
                  backgroundColor: 'white'
              },
              '& .MuiInputLabel-root': {
                  fontSize: '14px'
              }
          }}>
              <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              sx={{
                  color: 'black',
                  height: '33px',
                  '& .MuiSelect-select': {
                      height: '33px',
                      padding: '0 14px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px'
                  }
              }}
              value={filterUserTypeMethod}
              size="small"
              onChange={handleChangeFilterUserType}
              >
              <MenuItem style={{fontSize:14}} value={10}>전체</MenuItem>
              <MenuItem style={{fontSize:14}} value={20}>정상 이용자</MenuItem>
              <MenuItem style={{fontSize:14}} value={30}>블랙 이용자</MenuItem>
              <MenuItem style={{fontSize:14}} value={40}>Lock적용 이용자</MenuItem>

              </Select>
          </FormControl>

        </div>


          <div style={{display:"flex", float:"left", marginLeft:"auto", alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                
              <div style={{display:"flex", float:"left"}}>

                  <FormControl fullWidth sx={{ 
                      width: "110px", 
                      marginTop: "0px", 
                      marginLeft: "8px",
                      '& .MuiOutlinedInput-root': {
                          height: '33px',
                          backgroundColor: 'white'
                      },
                      '& .MuiInputLabel-root': {
                          fontSize: '14px'
                      }
                  }}>
                      <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          sx={{
                              color: 'black',
                              height: '33px',
                              '& .MuiSelect-select': {
                                  height: '33px',
                                  padding: '0 14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontSize: '14px'
                              }
                          }}
                          value={filterContentTypeMethod}
                          size="small"
                          onChange={handleChangeFilterContentType}
                      >
                          <MenuItem style={{fontSize:14}} value={10}>전체</MenuItem>
                          <MenuItem style={{fontSize:14}} value={20}>유저 아이디</MenuItem>
                          <MenuItem style={{fontSize:14}} value={30}>유저명</MenuItem>
                          <MenuItem style={{fontSize:14}} value={40}>이메일</MenuItem>
                          <MenuItem style={{fontSize:14}} value={50}>지갑주소</MenuItem>
                      </Select>
                  </FormControl>
              </div>
          </div>

          <Box
            component="form"
            marginLeft="10px"
            marginRight="5px"
            noValidate
            style={{marginLeft:'5px'}}
            autoComplete="off">

            <FormControl sx={{minWidth: '300px' }} variant="outlined">
                <InputLabel 
                    id='keywordLabel' 
                    size="small" 
                    sx={{
                        height: "40px",
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        '&.MuiInputLabel-root': {
                            marginBottom: '0px',
                            transform: 'translate(14px, -2px)',
                            '&.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -14px) scale(0.75)'
                            }
                        }
                    }}
                >
                    키워드를 입력하세요
                </InputLabel>
                <OutlinedInput
                    sx={{
                        height: '33px',
                        backgroundColor:'white',
                        fontSize: '14px',
                        '& .MuiOutlinedInput-input': {
                            fontSize: '14px',
                            padding: '0 14px',
                            height: '33px',
                            display: 'flex',
                            alignItems: 'center'
                        },
                        '& input': {
                            paddingTop: 0,
                            paddingBottom: 0,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center'
                        }
                    }}
                    id="keywordInfoField"
                    type='text'
                    value={filterInfo}
                    onChange={(text)=>{ 
                        setFilterInfo(text.target.value);
                    }}
                    endAdornment={
                        <InputAdornment position="end">
                            <ClearIcon onClick={handleClickDeleteKeyword} />
                        </InputAdornment>
                    }
                    label="키워드를 입력하세요"
                />
            </FormControl>
          </Box>
          <Button 
            id="keyBtns" 
            variant="outlined" 
            style={{
              color:"white", 
              backgroundColor:"#1f1f26", 
              borderColor:"#CBCBCB",
              height:"33px",
              marginRight:"5px",
              fontSize: '14px'
            }}  
            onClick={handleClickSearch}
          >
            초기화
          </Button>

      </div>

      {/* 필터링 결과 상태 표시 */}
      {filterUserList.length !== userList.length && (
        <Box sx={{ 
          mt: 1, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <span style={{ fontWeight: 'bold' }}>검색 결과:</span> 
            전체 {userList.length}명 중 {filterUserList.length}명 표시됨
          </Typography>
          
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleResetFilters}
            sx={{ 
              fontSize: '12px',
              visibility: (filterInfo !== '' || filterUserTypeMethod !== 10 || filterContentTypeMethod !== 10) ? 'visible' : 'hidden'
            }}
          >
            필터 초기화
          </Button>
        </Box>
      )}

      <div ref={ref_Div} style={{flex:1, height:'100%', marginTop:'0px', paddingLeft:"0px",}}>

        <StripedDataGrid 

          rows={filterUserList}
          columns={columns}
          autoHeight={true}

          initialState={{
              pagination: {
                  paginationModel: {
                  pageSize: 10,
                  },
              },
          }}
          pageSizeOptions={[10]}
          rowHeight={42}
          columnHeaderHeight={45}

          slots={{
              pagination: CustomPagination,
          }}

          localeText={{
              toolbarExportCSV: "CVS 파일 저장",
              toolbarColumns: "헤더설정",
              toolbarFilters: "내부필터링",
              toolbarExport: "다운로드",
              MuiTablePagination: {
                  labelDisplayedRows: ({ from, to, count }) => {
                      if (from === undefined || to === undefined || count === undefined) {
                          return '0-0 / 0';
                      }
                      return `${from.toLocaleString('ko-KR')}-${to.toLocaleString('ko-KR')} / ${count.toLocaleString('ko-KR')}`;
                  }
              }
          }}

          slotProps={{
              toolbar: {
                  printOptions: { disableToolbarButton: true },
                  csvOptions: { disableToolbarButton: true },
              },
              pagination: {
                  labelRowsPerPage: "페이지당 행:",
                  labelDisplayedRows: ({ from, to, count }) => 
                      `${from.toLocaleString('ko-KR')}-${to.toLocaleString('ko-KR')} / ${count.toLocaleString('ko-KR')}`
              }
          }}
          sx={{

              '.MuiDataGrid-columnSeparator': {
              display: 'none',
              },
              "& .MuiDataGrid-columnHeader": {
                  borderTopColor:"green",
                  borderBlockColor:"green",
                  color: "#000000",
                  fontSize:13.5,
                  fontWeight: 900,
                  WebkitFontSmoothing: 'antialiased',
              },
              '& .super-app-theme--Open': {
                  '&.Mui-selected': { backgroundColor: 'black'},
              },
              '& .super-app-theme--Filled': {
                  '&.Mui-selected': { backgroundColor: 'black'},
              },
              '& .super-app-theme--PartiallyFilled': {
                  '&.Mui-selected': { backgroundColor: 'black'},
              },
              '& .super-app-theme--Rejected': {
                  '&.Mui-selected': { backgroundColor: 'black'},
              },
              "& .MuiDataGrid-cell": {
                  border: 1,
                  borderColor:"#f4f6f6",
                  borderRight: 0,
                  borderTop: 0,
                  fontSize:13.5,
              },
              '& .MuiMenuItem-root': {
                      fontSize: 1,
                  },
                  '& .MuiTypography-root': {
                      color: 'dodgerblue',
                      fontSize: 1,
                  },
                  '& .MuiDataGrid-filterForm': {
                      bgcolor: 'lightblue',
                  },
              '& .MuiDataGrid-footerContainer': {
                  justifyContent: 'center',
              },
              '& .MuiTablePagination-root': {
                  fontSize: '13.5px',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
              },
              '& .MuiTablePagination-toolbar': {
                  justifyContent: 'center',
                  width: '100%',
              },
              '& .MuiTablePagination-actions': {
                  marginLeft: '0px',
              },
              '& .MuiTablePagination-displayedRows': {
                  fontSize: '13.5px',
              },
              '& .MuiTablePagination-selectLabel': {
                  fontSize: '13.5px',
              },
              '& .MuiTablePagination-select': {
                  fontSize: '13.5px',
              },
          }}
          getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 1 ? 'even' : 'odd'
          }
          style={{

            marginTop:'20px',

          }}

        />

      </div>
   
      <React.Fragment key='bottom'>
      
          <Drawer
              anchor='bottom'
              open={stateBottom}
              onClose={toggleDrawer('bottom', false)}>

              <Box sx={{flexGrow:1, height:750}}>
              <Grid container spacing={0} sx={{backgroundColor:"#034301", height:"100%"}}>
                  <Grid item xs={2.4}>
                      <div style={{height:"100%", paddingLeft:"5px", paddingBottom:"5px", paddingTop:"5px"}}>
                      
                        <UserInfoView userInfo={selectedContent} />

                      </div>
                  </Grid>
                  <Grid item xs={3.6}>
                      <div style={{height:"100%", paddingLeft:"5px", paddingBottom:"5px", paddingTop:"5px"}}>

                        <PointHistoryView pointInfo={selectedContent} />

                      </div>
                  </Grid>
                  <Grid item xs={6}>
                      
                      <div style={{height:"100%", paddingLeft:"5px", paddingTop:"5px", paddingRight:"5px", paddingBottom:"5px"}}>
                          
                        <WalletInfoView walletInfo={selectedContent} />

                      </div>
                  </Grid>
              </Grid>
              </Box>
          </Drawer>
      
      </React.Fragment>

      {/* 로딩 및 필터링 상태 표시 개선 */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoading || isFiltering}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" color="inherit">
          {isFiltering ? '검색 결과를 필터링하는 중...' : '사용자 정보를 불러오는 중...'}
        </Typography>
      </Backdrop>

    </div>
  );
}
