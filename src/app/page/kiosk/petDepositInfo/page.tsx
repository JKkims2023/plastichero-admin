'use client';

import React from "react";
import { DataGrid, GridToolbar, GridRowsProp, GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, gridClasses} from '@mui/x-data-grid';
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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import { 
    gridPageCountSelector, 
    gridPageSelector, 
    useGridApiContext, 
    useGridSelector,
    GridPagination
} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';

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
      field: 'memo',
      headerName: '키오스크 ID',
      type: 'string',
      flex: 1,
      disableColumnMenu: true,
      editable: false,
  },
  {
      field: 'mb_id',
      headerName: '투입계정 ID',
      type: 'string',
      flex: 1,
      disableColumnMenu: true,
      editable: false,
  },
  {
      field: 'tx_id',
      headerName: 'TXID',
      type: 'string',
      flex: 1.2,
      disableColumnMenu: true,
      editable: false,
  },
  {
      field: 'amount',
      headerName: 'PTH 수량',
      type: 'string',
      flex: 0.8,
      disableColumnMenu: true,
      editable: false,
      renderCell: (params) => {
          const amount = parseFloat(params.value);
          return amount.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
      }
  },
  {
      field: 'reg_date_text',
      headerName: '투입일',
      type: 'string',
      flex: 0.8,
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
        <Box sx={{ 
            width: '100%', 
            height: '100%',  // 높이를 100%로 설정
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center'  // 수직 중앙 정렬 추가
        }}>
            <Button
                variant="contained"
                size="small"
                sx={{ fontSize: '12px' }}
                onClick={(event) => {
                    event.stopPropagation();
                //    setSelectedContent(filterPointList[params.row.id - 1]);
                //    handleOpenDialog();
                }}
            >
                보기
            </Button>
        </Box>
    ),
},
  
];

// Custom Pagination Component
function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
                onClick={() => apiRef.current.setPage(0)}
                disabled={page === 0}
                sx={{ padding: '4px' }}
            >
                <FirstPageIcon />
            </IconButton>
            <GridPagination />
        </div>
    );
}

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

    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('all');
    const [stateBottom, setStateBottom] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState(dayjs());

    const page_info = 'Home > 키오스크 관리 > 플라스틱 수거현황';

    const [summaryData, setSummaryData] = React.useState({
        totalAmount: 0,
        totalDeposits: 0,
        totalUsers: 0
    });

    const [isLoading, setIsLoading] = React.useState(false);

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

    React.useEffect(()=>{

    },[userList]);

    React.useEffect(()=>{

    },[filterUserList]);

    React.useEffect(()=>{

      get_UserInfo();

    },[selectedDate]);

    React.useEffect(() => {
        if (filterUserList.length > 0) {
            // 총 수량 계산
            const totalAmount = filterUserList.reduce((sum, item) => sum + parseFloat(item.amount), 0);
            
            // 중복되지 않은 사용자 ID 배열 생성
            const uniqueUsers = [...new Set(filterUserList.map(item => item.mb_id))];
            
            setSummaryData({
                totalAmount: totalAmount,
                totalDeposits: filterUserList.length,
                totalUsers: uniqueUsers.length
            });
        } else {
            // 데이터가 없을 경우 초기화
            setSummaryData({
                totalAmount: 0,
                totalDeposits: 0,
                totalUsers: 0
            });
        }
    }, [filterUserList]);

    const get_UserInfo = async() => {
        try {
            setIsLoading(true); // 로딩 시작
            
            const response = await fetch('/api/kiosk/petDepositInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    pagingIdx, 
                    filterInfo, 
                    fromDate: selectedDate.subtract(1,'day'),
                    toDate: selectedDate.add(1,'day') 
                }),
            });

            const data = await response.json(); 

            if (response.ok) {
                setUserList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
                setFilterUserList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
            } else {
                alert(data.message);
            }
        } catch(error) {
            console.log(error);
            alert('데이터 로딩 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    const toggleDrawer = (anchor: Anchor, open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        
      if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
          
        return;
        
      }
    
      setStateBottom(false);
   
    };
    
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

    // @ts-ignore    
    const handleClickContentList : GridEventListener<'rowClick'> = (params) => {

      try{

          let rIdx = parseInt(params.row.id) - 1;
          
          setSelectedContent(filterUserList[rIdx]);
          
          setStateBottom(true);

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

    const handleClickSearch = async () => {
        try {
            setIsLoading(true); // 로딩 시작
            
            if(filterInfo.length > 0) {
                switch(filterContentTypeValueMethod) {
                    case 'id': {
                        setFilterUserList(userList.filter((user) => user.mb_id.includes(filterInfo))
                            .map((user, idx) => ({ ...user, id: idx + 1 })));
                    } break;
                    case 'name':{
                      setFilterUserList(userList.filter((user) => user.mb_name.includes(filterInfo))
                        .map((user, idx) => ({ ...user, id: idx + 1 })));
                    }break;
                    case 'email':{
                      setFilterUserList(userList.filter((user) => user.mb_email.includes(filterInfo))
                        .map((user, idx) => ({ ...user, id: idx + 1 })));
                    }break;
                    case 'wallet':{
                      setFilterUserList(userList.filter((user) => user.mb_wallet.includes(filterInfo))
                        .map((user, idx) => ({ ...user, id: idx + 1 })));
                    }break;
                    default:{
                      setFilterUserList(userList.map((user, idx) => ({ ...user, id: idx + 1 })));
                    }break;
                }
            } else {
                setFilterUserList(userList);
            }
        } catch(error) {
            console.log(error);
            alert('검색 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

  return (

    <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

      <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

          <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

      </div>

      <div style={{}}>
          <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
              플라스틱 수거현황
          </Typography>
      </div>

      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '5px',
        marginBottom: '5px'
      }}>
        <div style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <Typography sx={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>
            총 보상 PTH
          </Typography>
          <Typography sx={{fontSize: '24px', fontWeight: 'bold', color: '#1f1f26'}}>
            {(summaryData?.totalAmount || 0).toLocaleString('ko-KR', { maximumFractionDigits: 2 })} PTH
          </Typography>
        </div>
        
        <div style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <Typography sx={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>
            투입 횟수
          </Typography>
          <Typography sx={{fontSize: '24px', fontWeight: 'bold', color: '#1f1f26'}}>
            {summaryData.totalDeposits.toLocaleString('ko-KR')}회
          </Typography>
        </div>
        
        <div style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <Typography sx={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>
            이용자 수
          </Typography>
          <Typography sx={{fontSize: '24px', fontWeight: 'bold', color: '#1f1f26'}}>
            {summaryData.totalUsers.toLocaleString('ko-KR')}명
          </Typography>
        </div>
      </div>

      <div style={{
        
        display:"flex", 
        float:"left",  
        marginTop:'10px', 
        paddingTop:"15px", 
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
                    
          <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker 

                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  format="YYYY-MM-DD"
                  slotProps={{ 
                      textField: { 
                          size: 'small',
                          sx: { 
                              backgroundColor: 'white',
                              width: '150px',
                              marginRight: '10px'
                          }
                      }
                  }}
              />
          </LocalizationProvider>

          <div style={{display:"flex", float:"left", marginLeft:"auto", alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                
              <div style={{display:"flex", float:"left"}}>

                  <FormControl fullWidth  style={{ width:"110px",marginTop:"0px", marginLeft:"8px", backgroundColor:'white', color:'black'}}>
                      <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      style={{color:'black'}}
                      value={filterContentTypeMethod}
                      size="small"
                      onChange={handleChangeFilterContentType}
                      >
                      <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                      <MenuItem style={{fontSize:13}} value={20}>유저 아이디</MenuItem>
                      <MenuItem style={{fontSize:13}} value={30}>유저명</MenuItem>
                      <MenuItem style={{fontSize:13}} value={40}>이메일</MenuItem>
                      <MenuItem style={{fontSize:13}} value={50}>지갑주소</MenuItem>


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
              <InputLabel id='keywordLabel' size="small" sx={{height:"40px",}}>키워드를 입력하세요</InputLabel>
              <OutlinedInput
                sx={{height:"33px", backgroundColor:'white'}}
                id="keywordInfoField"
                type='text'
                value={filterInfo}
                onChange={(text)=>{

                  setFilterInfo(text.target.value);

                }}
                endAdornment={
                  <InputAdornment position="end">
                    <ClearIcon

                      onClick={handleClickDeleteKeyword}
                    />
                
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
          </Box>
          <Button id="keyBtns" variant="outlined" style={{color:"white",backgroundColor:"#1f1f26", borderColor:"#CBCBCB" ,height:"33px" , marginRight:"10px"}}  onClick={handleClickSearch}>
            검색
          </Button>

      </div>

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
                  '& .MuiTablePagination-root': {
                      fontSize: '14px',
                  },
                  '& .MuiTablePagination-selectLabel': {
                      fontSize: '14px',
                  },
                  '& .MuiTablePagination-displayedRows': {
                      fontSize: '14px',
                  },
                  '& .MuiTablePagination-select': {
                      fontSize: '14px',
                  },
                  '& .MuiTablePagination-menuItem': {
                      fontSize: '14px',
                  },
              }}
              getRowClassName={(params) =>
                  params.indexRelativeToCurrentPage % 2 === 1 ? 'even' : 'odd'
              }
              style={{

                marginTop:'20px',

              }}
              onRowClick={handleClickContentList}
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

      <Backdrop
        sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={isLoading}
      >
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
        }}>
            <CircularProgress color="inherit" />
            <Typography sx={{ color: 'white', mt: 2 }}>
                플라스틱 수거 정보를 불러오는 중입니다.
            </Typography>
        </div>
      </Backdrop>

    </div>
  );
}
