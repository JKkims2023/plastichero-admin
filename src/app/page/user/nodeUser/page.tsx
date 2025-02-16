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
    const [stateBottom, setStateBottom] = React.useState(false);

    const [file, setFile] = React.useState(null);
    const [message, setMessage] = React.useState('');

    const page_info = 'Home > 회원관리 > 노드 사용자 관리';

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
          field: 'mb_email',
          headerName: '이메일',
          type: 'string',
          flex: 1.2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'wallet_address',
          headerName: '지갑주소(노드)',
          type: 'string',
          flex: 2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'invite_code',
          headerName: '추천코드',
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
                    setStateBottom(true);
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

        const matchInfo = ref_matchInfo.current;
        const response = await fetch('/api/user/nodeUser', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({ pagingIdx, filterInfo, matchInfo }),
        
        });
  
        const data = await response.json(); 
  
        if (response.ok) {

          setUserList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));

          setFilterUserList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
          
        } else {
  
          alert(data.message);
        
        }

      }catch(error){

        console.log(error);

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

    const handleClickDeleteKeyword = () => {

      try{

        setFilterInfo('');

      }catch(error){

        console.log(error);

      }

    };

    const handleClickSearch = () => {
      
      try{


        if(filterInfo.length > 0){

          switch(filterContentTypeValueMethod){

            case 'id':{
              setFilterUserList(userList.filter((user) => user.mb_id.includes(filterInfo))
                .map((user, idx) => ({ ...user, id: idx + 1 })));
            }break;
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

        }else{

          setFilterUserList(userList);

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
  

  return (

    <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

      <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

          <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

      </div>

      <div style={{}}>
          <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
              노드 사용자 관리
          </Typography>
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
              
          <a style={{fontSize:14, marginRight:"10px", color:'black', marginLeft:'10px', fontWeight:900}}>총 가입자 : {userList.length}</a>

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
              
              sx={{

                  '.MuiDataGrid-columnSeparator': {
                  display: 'none',
                  },
                  "& .MuiDataGrid-columnHeader": {
//                      backgroundColor: "#f0f0f0",
                      borderTopColor:"green",
                      borderBlockColor:"green",
                      color: "#000000",
                      fontSize:13.5,
                      fontFamily:'bold',
                      fontWeight: "bold",
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
              }}

              localeText={{
                  toolbarExportCSV: "CVS 파일 저장",
                  toolbarColumns: "헤더설정",
                  toolbarFilters: "내부필터링",
                  toolbarExport: "다운로드"
                  
              }}
              slotProps={{
                  toolbar: {
                      printOptions: { disableToolbarButton: true },
                      csvOptions: { disableToolbarButton: true },
                      
              }}}
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

    </div>
  );
}
