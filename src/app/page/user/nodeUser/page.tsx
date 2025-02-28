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
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { 
    gridPageCountSelector, 
    gridPageSelector, 
    useGridApiContext, 
    useGridSelector,
    GridPagination
} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from "@mui/material/Backdrop";


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
    const ref_matchInfo = React.useRef('');

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
    const [filterTypeMethod, setFilterTypeMethod] = React.useState(10);
    const [filterTypeValueMethod, setFilterTypeValueMethod] = React.useState('');
    const [stateBottom, setStateBottom] = React.useState(false);

    const [file, setFile] = React.useState(null);
    const [message, setMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const page_info = 'Home > 회원관리 > 노드 회원리스트트';

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
          field: 'not_match_user_text',
          headerName: '매칭 여부',
          type: 'string',
          flex: 0.5,
          disableColumnMenu: true,
          editable: false,
          renderCell: (params) => (
              <span style={{ color: params.value === '미 매칭 사용자' ? 'red' : 'blue' }}>
                  {params.value}
              </span>
          ),
      },
      {
          field: 'mb_email',
          headerName: '이메일(신청)',
          type: 'string',
          flex: 0.8,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'wallet_address',
          headerName: '지갑주소(노드)',
          type: 'string',
          flex: 2.1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_id',
          headerName: '사용자ID',
          type: 'string',
          flex: 0.4,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_name',
          headerName: '사용자명',
          type: 'string',
          flex: 0.4,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'real_email',
          headerName: '실제 이메일',
          type: 'string',
          flex: 0.8,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'invite_code',
          headerName: '추천코드',
          type: 'string',
          flex: 0.4,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_datetime',
          headerName: '가입일',
          type: 'string',
          flex: 0.7,
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
            <Button
                variant="contained"
                size="small"
                sx={{ 
                    fontSize: '12px',
                    margin: '0 auto'  // 버튼 자체를 중앙 정렬
                }}
                onClick={(event) => {

                    event.stopPropagation();
                    setSelectedContent(filterUserList[params.row.id - 1]);

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

    },[userList]);

    React.useEffect(()=>{

    },[filterUserList]);

    const get_UserInfo = async() => {

      try{
        setIsLoading(true);  // 로딩 시작
        const matchInfo = ref_matchInfo.current;
        const response = await fetch('/api/user/nodeUser', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({ pagingIdx, filterInfo, matchInfo }),
        
        });
  
        const data = await response.json(); 

        // 중복 이메일 체크 로직 추가
        const emailSet = new Set();
        const duplicateEmails = new Set();
        data.result_data.forEach(user => {
          if (emailSet.has(user.mb_email)) {
            duplicateEmails.add(user.mb_email);
          } else {
            emailSet.add(user.mb_email);
          }
        });
        if (duplicateEmails.size > 0) {
          console.log('중복된 이메일:', Array.from(duplicateEmails));
        }

        if (response.ok) {

          setUserList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));

          setFilterUserList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
          
        } else {
  
          alert(data.message);
        
        }

      }catch(error){

        console.log(error);

      } finally {
        setIsLoading(false);  // 로딩 종료
      }

    };

    const toggleDrawer = (anchor: Anchor, open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        
      if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
          
        return;
        
      }
    
      setStateBottom(false);
   
    };
    
    const handleChangeFilterType = (event: SelectChangeEvent<number>) => {

      try{

        setFilterTypeMethod(Number(event.target.value));

        switch(event.target.value){

        case 10:{
          setFilterTypeValueMethod('all');
        }break;
        case 20:{
          setFilterTypeValueMethod('matching');
        }break;
        case 30:{
          setFilterTypeValueMethod('non-matching');
        }break; 
        default:{
          setFilterTypeValueMethod('all');
        }break;

        }

      }catch(error){

        console.log(error);

      }

    };  

    const handleChangeFilterContentType = (event: SelectChangeEvent<number>) => {

        try{

          setFilterContentTypeMethod(Number(event.target.value)); 

          switch(event.target.value){

            case 10:{
              setFilterContentTypeValueMethod('all');
            }break;
            case 20:{
              setFilterContentTypeValueMethod('id');
            }break;
            case 30:{
              setFilterContentTypeValueMethod('name');
            }break;
            case 40:{
              setFilterContentTypeValueMethod('email');
            }break;
            case 50:{
              setFilterContentTypeValueMethod('wallet');
            }break;
            default:{ 
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

    const handleClickSearch = () => {
      
      try{

        let filteredList = []

        
        if(filterTypeValueMethod == 'all'){

          if(filterInfo.length > 0){

            switch(filterContentTypeValueMethod){

              case 'id':{
                filteredList = userList.filter((user) => {
                  
                  if(user.mb_id == null || user.mb_id == 'undefined' || user.mb_id == '')
                    return false;

                  if(user.mb_id.includes(filterInfo || '')){
                    return true;
                  }else{
                    return false;
                  }

                })
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              }break;
              case 'name':{ 
                filteredList = userList.filter((user) => {

                  if(user.mb_name == null || user.mb_name == 'undefined' || user.mb_name == '')
                    return false;

                  if(user.mb_name.includes(filterInfo || ''))
                    return true;
                })
              }break;
              case 'email':{
                filteredList = userList.filter((user) => {

                  if(user.mb_email == null || user.mb_email == 'undefined' || user.mb_email == '')
                    return false;

                  if(user.mb_email.includes(filterInfo || ''))
                    return true;
                })
              }break;
              case 'wallet':{
                filteredList = userList.filter((user) => {

                  if(user.mb_wallet == null || user.mb_wallet == 'undefined' || user.mb_wallet == '')
                    return false;

                  if(user.mb_wallet.includes(filterInfo || ''))
                    return true;
                })
              }break;
              default:{
                filteredList = userList.map((user, idx) => ({ ...user, id: idx + 1 }));
              }break;
            
            }

            switch(filterTypeValueMethod){

              case 'all':{
                filteredList = filteredList;
              }break;
              // @ts-ignore
              case 'matching':{
                filteredList = filteredList.filter(user => user.not_match_user === 'N');
              }break;
              // @ts-ignore
              case 'non-matching':{
                filteredList = filteredList.filter(user => user.not_match_user === 'Y');
              }break;
              default:{
                filteredList = filteredList;
              }break;

            }

            setFilterUserList(filteredList);

          }else{

            switch(filterTypeValueMethod){

              case 'all':{
                filteredList = userList;
              }break;
              // @ts-ignore
              case 'matching':{
                filteredList = userList.filter(user => user.not_match_user === 'N');
              }break;
              // @ts-ignore
              case 'non-matching':{
                filteredList = userList.filter(user => user.not_match_user === 'Y');
              }break;
              default:{
                filteredList = userList;
              }break;

            }

            setFilterUserList(userList);

          } 
          
        }else{

          
          if(filterInfo.length > 0){
            
            switch(filterContentTypeValueMethod){

              case 'id':{
                filteredList = userList.filter((user) => {
                  
                  if(user.mb_id == null || user.mb_id == 'undefined' || user.mb_id == '')
                    return false;

                  if(user.mb_id.includes(filterInfo || '')){
                    return true;
                  }else{
                    return false;
                  }

                })
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              }break;
              case 'name':{ 
                filteredList = userList.filter((user) => {

                  if(user.mb_name == null || user.mb_name == 'undefined' || user.mb_name == '')
                    return false;

                  if(user.mb_name.includes(filterInfo || ''))
                    return true;
                })
              }break;
              case 'email':{
                filteredList = userList.filter((user) => {

                  if(user.mb_email == null || user.mb_email == 'undefined' || user.mb_email == '')
                    return false;

                  if(user.mb_email.includes(filterInfo || ''))
                    return true;
                })
              }break;
              case 'wallet':{
                filteredList = userList.filter((user) => {

                  if(user.mb_wallet == null || user.mb_wallet == 'undefined' || user.mb_wallet == '')
                    return false;

                  if(user.mb_wallet.includes(filterInfo || ''))
                    return true;
                })
              }break;
              default:{
                filteredList = userList.map((user, idx) => ({ ...user, id: idx + 1 }));
              }break;
            
            }

            switch(filterTypeValueMethod){

              case 'all':{
                filteredList = filteredList;
              }break;
              // @ts-ignore
              case 'matching':{
                filteredList = filteredList.filter(user => user.not_match_user === 'N');
              }break;
              // @ts-ignore
              case 'non-matching':{
                filteredList = filteredList.filter(user => user.not_match_user === 'Y');
              }break;
              default:{
                filteredList = filteredList;
              }break;

            }

            setFilterUserList(filteredList);

          }else{

            switch(filterTypeValueMethod){

              case 'all':{
                filteredList = userList;
              }break;
              // @ts-ignore
              case 'matching':{
                filteredList = userList.filter(user => user.not_match_user === 'N');
              }break;
              // @ts-ignore
              case 'non-matching':{
                filteredList = userList.filter(user => user.not_match_user === 'Y');
              }break;
              default:{
                filteredList = userList;
              }break;

            }

            setFilterUserList(filteredList);

          } 
          
        }

      }catch(error){

        console.log(error);

      }

    };

    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!file) {
        setMessage('Please select a file.');
        return;
      }
  
      const formData = new FormData();
      formData.append('excelFile', file); // 'excelFile'은 API Route에서 사용하는 필드 이름
  
      try {
        const response = await fetch('/api/excel', {
          method: 'POST',
          body: formData,
        });
  
        const data = await response.json();
        setMessage(data.message);
  
      } catch (error) {
        console.error(error);
        setMessage('Error uploading file.');
      }
    };

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
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

      <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

        <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

            <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

        </div>

        <div style={{}}>
            <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
                노드 회원리스트
            </Typography>
        </div>

        <div style={{ marginTop: '5px' }}>

            <Grid container spacing={2}>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>

                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          총 사용자 수
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                          {filterUserList.length.toLocaleString()}
                        </Typography>
                        
                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>

                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          매칭된 사용자 수
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                          {filterUserList.filter(user => user.not_match_user === 'N').length.toLocaleString()}
                        </Typography>

                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>
                        
                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          미 매칭된 사용자 수
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                            {filterUserList.filter(user => user.not_match_user === 'Y').length.toLocaleString()}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </div>

        <form style={{display:'none'}} onSubmit={handleSubmit}>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
          <button type="submit">Upload</button>
        </form>

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


                
            <div style={{display:"flex", float:"left", alignContent:'center', alignItems:'center', width:"100%"}}>
                  
                <FormControl fullWidth  style={{ width:"110px",marginTop:"0px", marginLeft:"8px", backgroundColor:'white', color:'black'}}>
                    <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    style={{color:'black'}}
                    value={filterTypeMethod}
                    size="small"
                    onChange={handleChangeFilterType}
                    >
                    <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                    <MenuItem style={{fontSize:13}} value={20}>매칭 사용자</MenuItem>
                    <MenuItem style={{fontSize:13}} value={30}>미 매칭 사용자</MenuItem>

                    </Select>
                </FormControl>
                <div style={{display:"flex", float:"left", marginLeft:"auto"}}>

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
                        <MenuItem style={{fontSize:13}} value={20}>사용자ID</MenuItem>
                        <MenuItem style={{fontSize:13}} value={30}>사용자명</MenuItem>
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
                      <ClearIcon onClick={handleClickDeleteKeyword} />
                    </InputAdornment>
                  }
                  label="키워드를 입력하세요"
                />
              </FormControl>
            </Box>
            <Button id="keyBtns" variant="outlined" style={{color:"white", backgroundColor:"#1f1f26", borderColor:"#CBCBCB" ,height:"33px" , marginRight:"10px"}}  onClick={handleClickSearch}>
              검색
            </Button>

        </div>

        <div ref={ref_Div} style={{flex:1, height:'100%', marginTop:'0px', paddingLeft:"0px", position: 'relative'}}>
        
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

        {/* 로딩 Backdrop 추가 */}
        <Backdrop

          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
          open={isLoading}
          >
          <CircularProgress color="inherit" />
          <Typography variant="h6" color="inherit">노드 사용자 정보를 불러오는 중입니다</Typography>

        </Backdrop>

      </div>
    );
}
