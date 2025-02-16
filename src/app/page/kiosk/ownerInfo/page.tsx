'use client';

import React from "react";
// Import 추가
import FirstPageIcon from '@mui/icons-material/FirstPage';
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
    const [kioskList, setKioskList] = React.useState([]);
    const [filterKioskList, setFilterKioskList] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState({

        contentID : '',
        contentTitle : '',
    
    });

    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('all');
    const [filterSellStatusMethod, setFilterSellStatusMethod] = React.useState(10);
    const [filterSellStatusValueMethod, setFilterSellStatusValueMethod] = React.useState('all');
    const [stateBottom, setStateBottom] = React.useState(false);

    const page_info = 'Home > 키오스크 관리 > 소유자 관리';

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
          field: 'kc_name',
          headerName: '국가',
          type: 'string',
          flex: 0.5,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'sell_status',
          headerName: '상태',
          type: 'string',
          flex: 0.6,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'kc_kiosk_id',
          headerName: '키오스크ID',
          type: 'string',
          flex: 1.5,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'kc_addr',
          headerName: '배치장소',
          type: 'string',
          flex: 5,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'manager_mail',
          headerName: '관리자ID',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'owner_id',
          headerName: '소유자ID',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_today_login',
          headerName: '만료일',
          type: 'string',
          flex: 0.7,
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
                    
                    setSelectedContent(filterKioskList[params.row.id - 1]);
                    setStateBottom(true);
                }}
            >
                관리
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

    },[kioskList]);

    React.useEffect(()=>{

    },[filterKioskList]);

    const get_UserInfo = async() => {

      try{

        const response = await fetch('/api/kiosk/ownerInfo', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({ pagingIdx, filterInfo }),
        
        });
  
        const data = await response.json(); 
  
        if (response.ok) {

          setKioskList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));

          setFilterKioskList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
          
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

              setFilterContentTypeValueMethod('all');
            }break;
            case 20:{

              setFilterContentTypeValueMethod('id');
            }break;
            case 30:{

              setFilterContentTypeValueMethod('location');
            }break;
            default:{ 

              setFilterContentTypeValueMethod('all');
            }break;  

          }

        }catch(error){

            console.log(error);

        }
    };

    const handleChangeFilterSellStatus = (event: SelectChangeEvent<number>) => {

      try{

        setFilterSellStatusMethod(Number(event.target.value));

        switch(event.target.value){

          case 10:{
            setFilterSellStatusValueMethod('all');
          }break;
          case 20:{
            setFilterSellStatusValueMethod('0 ');
          }break;
          case 30:{
            setFilterSellStatusValueMethod('1');
          }break;
          case 40:{
            setFilterSellStatusValueMethod('2');
          }break;
          case 50:{
            setFilterSellStatusValueMethod('3');
          }break;
          default:{
            setFilterSellStatusValueMethod('all');
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
              setFilterKioskList(kioskList.filter((user) => user.mb_id.includes(filterInfo))
                .map((user, idx) => ({ ...user, id: idx + 1 })));
            }break;
            case 'location':{
              setFilterKioskList(kioskList.filter((user) => user.kc_addr.includes(filterInfo))
                .map((user, idx) => ({ ...user, id: idx + 1 })));
            }break;
            default:{
              setFilterKioskList(kioskList.map((user, idx) => ({ ...user, id: idx + 1 })));
            }break;
          
          }

        }else{

          setFilterKioskList(kioskList);

        } 
        
      }catch(error){

        console.log(error);

      }

    };

    // Custom Pagination Component 추가
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


  return (

    <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

      <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

          <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

      </div>

      <div style={{}}>
          <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
              소유자 관리
          </Typography>
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
          
          <a style={{fontSize:14, marginRight:"10px", color:'black', marginLeft:'10px', fontWeight:900, width:100}}>총 : {kioskList.length}</a>
    
          <div style={{display:"flex", float:"left"}}>

            <FormControl fullWidth  style={{ width:"175px",marginTop:"0px", marginLeft:"8px", backgroundColor:'white', color:'black'}}>
                <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                style={{color:'black'}}
                value={filterSellStatusMethod}
                size="small"
                onChange={handleChangeFilterSellStatus}
                >
                <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                <MenuItem style={{fontSize:13}} value={20}>판매전</MenuItem>
                <MenuItem style={{fontSize:13}} value={30}>판매중</MenuItem>
                <MenuItem style={{fontSize:13}} value={40}>판매완료(직접채굴)</MenuItem>
                <MenuItem style={{fontSize:13}} value={50}>판매완료(운영지원금)</MenuItem>
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
                <MenuItem style={{fontSize:13}} value={20}>키오스크ID</MenuItem>
                <MenuItem style={{fontSize:13}} value={30}>배치장소</MenuItem>

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

              rows={filterKioskList}
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
                  width: '100%',
                  '& .MuiDataGrid-main': {
                    width: '100%'
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    width: '100%'
                  },
                  '& .MuiDataGrid-columnSeparator': {
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

                      "& .MuiTablePagination-root": {
                        fontSize: "14px",
                    },
                    "& .MuiTablePagination-selectLabel": {
                        fontSize: "14px",
                    },
                    "& .MuiTablePagination-displayedRows": {
                        fontSize: "14px",
                    },
                    "& .MuiTablePagination-select": {
                        fontSize: "14px",
                    },
                    "& .MuiTablePagination-menuItem": {
                        fontSize: "14px",
                    },
              }}
              slots={{
                pagination: CustomPagination,
            }}
            
            localeText={{
                toolbarExportCSV: "CVS 파일 저장",
                toolbarColumns: "헤더설정",
                toolbarFilters: "내부필터링",
                toolbarExport: "다운로드",
                MuiTablePagination: {
                    labelDisplayedRows: ({ from, to, count }) => 
                        `${from?.toLocaleString('ko-KR') || 0}-${to?.toLocaleString('ko-KR') || 0} / ${count?.toLocaleString('ko-KR') || 0}`
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
                        `${from?.toLocaleString('ko-KR') || 0}-${to?.toLocaleString('ko-KR') || 0} / ${count?.toLocaleString('ko-KR') || 0}`
                }
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

    </div>
  );
}
