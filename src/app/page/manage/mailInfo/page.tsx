'use client';

import React from "react";
// Import 추가
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
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

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
    const [mailList, setMailList] = React.useState([]);
    const [filterMailList, setFilterMailList] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState({

        contentID : '',
        contentTitle : '',
    
    });

    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('all');
    const [filterStatusMethod, setFilterStatusMethod] = React.useState(10);
    const [filterStatusValueMethod, setFilterStatusValueMethod] = React.useState('all');
    const [stateBottom, setStateBottom] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const page_info = 'Home > 운영관리 > 메일 인증내역';

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
          field: 'auth_type_text',
          headerName: '요청타입',
          type: 'string',
          flex: 1.3,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'target',
          headerName: '이메일주소',
          type: 'string',
          flex: 2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'code',
          headerName: '인증코드',
          type: 'string',
          flex: 0.8,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'status',
          headerName: '인증상태',
          type: 'string',
          flex: 0.8,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_id',
          headerName: '사용자ID',
          type: 'string',
          flex: 1.2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_name',
          headerName: '사용자명',
          type: 'string',
          flex: 1.2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'reg_dt',
          headerName: '발송일시',
          type: 'string',
          flex: 5,
          disableColumnMenu: true,
          editable: false,
      },
      {
        field: 'detail',
        headerName: '상세정보',
        flex: 0.7,
        disableColumnMenu: true,
        renderCell: (params) => (
            <Button
                variant="contained"
                size="small"
                sx={{ fontSize: '12px' }}
                onClick={(event) => {
                    event.stopPropagation();
                    handleOpenDialog(filterMailList[params.row.id - 1]);
                }}
            >
                보기
            </Button>
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

    React.useEffect(()=>{

    },[mailList]);

    React.useEffect(()=>{

    },[filterMailList]);

    const get_UserInfo = async() => {
        setLoading(true);
        try {
            const response = await fetch('/api/manage/mailInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pagingIdx, filterInfo }),
            });

            const data = await response.json();

            if (response.ok) {
                setMailList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
                setFilterMailList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
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

              setFilterContentTypeValueMethod('all');
            }break;
            case 20:{

              setFilterContentTypeValueMethod('phone');
            }break;
            case 30:{

              setFilterContentTypeValueMethod('mb_id');
            }break;
            case 40:{

              setFilterContentTypeValueMethod('mb_name');
            }break;
            default:{ 

              setFilterContentTypeValueMethod('all');
            }break;  

          }

        }catch(error){

            console.log(error);

        }
    };

    const handleChangeFilterType = (event: SelectChangeEvent<number>) => {

      try{

        setFilterStatusMethod(Number(event.target.value));

        switch(event.target.value){

          case 10:{
            setFilterStatusValueMethod('all');
          }break;
          case 20:{
            setFilterStatusValueMethod('0');
          }break;
          case 30:{
            setFilterStatusValueMethod('1');
          }break;
          case 40:{
            setFilterStatusValueMethod('2');
          }break;
          case 50:{
            setFilterStatusValueMethod('3');
          }break;
          default:{
            setFilterStatusValueMethod('all');
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

    const handleClickSearch = () => {

      try{

        let filteredList = [...mailList];

        if(filterStatusValueMethod === 'all') {

          if(filterInfo.length > 0) {
            
            switch(filterContentTypeValueMethod) {
              case 'target': {
                filteredList = filteredList.filter((user) => 
                  user.phone?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'mb_id': {
                filteredList = filteredList.filter((user) => 
                  user.mb_id?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'mb_name': {
                filteredList = filteredList.filter((user) => 
                  user.mb_name?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;

              default: {
                filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
            }
          
          }else{

            filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
          
          }

        } else {
          // sell_status 비교 전에 공백 제거
          const normalizedStatus = filterStatusValueMethod.trim();

          
          if(filterInfo.length > 0) {

            switch(filterContentTypeValueMethod) {
              case 'target': {
                filteredList = filteredList.filter((user) => 
                  user.target?.includes(filterInfo) && 
                  user.auth_type?.toString() === normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'mb_id': {
                filteredList = filteredList.filter((user) => 
                  user.mb_id?.includes(filterInfo) && 
                  user.auth_type?.toString() === normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'mb_name': {
                filteredList = filteredList.filter((user) => 
                  user.mb_name?.includes(filterInfo) && 
                  user.auth_type?.toString() === normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              default: {
                filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
            }
          } else {


            filteredList = filteredList.filter((user) => 
              user.auth_type?.toString() == normalizedStatus)
              .map((user, idx) => ({ ...user, id: idx + 1 }));
          }
        }

        setFilterMailList(filteredList);
          
      }catch(error){

        console.log(error);

      }

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

    const handleOpenDialog = (user) => {
        setSelectedContent(user);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    return (

      <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

        <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

            <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

        </div>

        <div style={{}}>
            <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
                메일 인증내역
            </Typography>
        </div>

        <div style={{ marginTop: '5px' }}>

            <Grid container spacing={2}>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>

                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          총 요청수
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                          {mailList.length.toLocaleString()}
                        </Typography>
                        
                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>

                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          지갑생성
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                          {mailList.filter(user => user.auth_type === '0').length.toLocaleString()}
                        </Typography>

                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>
                        
                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          지갑 불러오기
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                            {mailList.filter(user => user.auth_type === '1').length.toLocaleString()}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>
                        
                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                            기타
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                            {mailList.filter(user => user.auth_type === '2').length.toLocaleString()}
                        </Typography>
                        
                    </Box>
                </Grid>
            </Grid>
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
      
            <div style={{display:"flex", float:"left"}}>

              <FormControl fullWidth  style={{ width:"175px",marginTop:"0px", marginLeft:"8px", backgroundColor:'white', color:'black'}}>
                  <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  style={{color:'black'}}
                  value={filterStatusMethod}
                  size="small"
                  onChange={handleChangeFilterType}
                  >
                  <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                  <MenuItem style={{fontSize:13}} value={20}>지갑생성</MenuItem>
                  <MenuItem style={{fontSize:13}} value={30}>지갑 불러오기</MenuItem>
                  <MenuItem style={{fontSize:13}} value={40}>기타</MenuItem>
                  </Select>
              </FormControl>

            </div>


            <div style={{display:"flex", float:"left", marginLeft:"auto", width:"100%"}}>

              <FormControl fullWidth  style={{ width:"110px",marginTop:"0px", marginLeft:"auto", backgroundColor:'white', color:'black'}}>
                  <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  style={{color:'black'}}
                  value={filterContentTypeMethod}
                  size="small"
                  onChange={handleChangeFilterContentType}
                  >
                  <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                  <MenuItem style={{fontSize:13}} value={20}>이메일주소</MenuItem>
                  <MenuItem style={{fontSize:13}} value={30}>사용자ID</MenuItem>
                  <MenuItem style={{fontSize:13}} value={40}>사용자명</MenuItem>
                  </Select>
              </FormControl>
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

        <div ref={ref_Div} style={{
          flex: 1, 
          height: '100%', 
          marginTop: '0px', 
          paddingLeft: "0px",
          width: '100%'
        }}>

          <StripedDataGrid 

          rows={filterMailList}
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
          columnHeaderHeight={60}

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


        <Backdrop open={loading} sx={{ color: '#fff', display: 'flex', flexDirection: 'column', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <CircularProgress color="inherit" />
            <Typography variant="h6" color="inherit">메일 인증 정보를 불러오는 중입니다</Typography>
        </Backdrop>

        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
            <DialogTitle>상세정보</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ border: '1px solid #ccc', backgroundColor: '#f9f9f9', borderRadius: '4px', padding: '16px' }}>
                    <Grid item xs={12}>
                        {/*@ts-ignore*/}
                        <Typography>사용자명: {selectedContent.mb_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ borderBottom: '1px solid #ccc', marginBottom: '8px', paddingBottom: '8px' }} />
                    <Grid item xs={12}>
                        {/*@ts-ignore*/}
                        <Typography>사용자ID: {selectedContent.mb_id}</Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ borderBottom: '1px solid #ccc', marginBottom: '8px', paddingBottom: '8px' }} />
                    <Grid item xs={12}>
                        {/*@ts-ignore*/}
                        <Typography>핸드폰 번호: {selectedContent.phone}</Typography>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog} color="primary">닫기</Button>
            </DialogActions>
        </Dialog>

      </div>
    );

  }
