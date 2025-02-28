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
import * as cheerio from 'cheerio';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';

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
    const [nodeList, setNodeList] = React.useState([]);
    const [filterNodeList, setFilterNodeList] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState({});

    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('all');
    const [filterSellStatusMethod, setFilterSellStatusMethod] = React.useState(10);
    const [filterSellStatusValueMethod, setFilterSellStatusValueMethod] = React.useState('all');
    const [stateBottom, setStateBottom] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedStatus, setSelectedStatus] = React.useState('');

    const page_info = 'Home > 채굴(노드)관리 > 채굴내역';

    // @ts-ignore
    const columns: GridColDef<(typeof rows)[number]>[] = [
      {   
          field: 'id', 
          headerName: 'No', 
          type: 'string',
          flex: 0.05,
          disableColumnMenu: true, 
      },
      {
          field: 'kc_kiosk_id',
          headerName: '키오스크아이디',
          type: 'string',
          flex: 0.15,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'node_name',
          headerName: '노드명',
          type: 'string',
          flex: 0.15,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'address',
          headerName: '지갑주소',
          type: 'string',
          flex: 0.35,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mining_amount',
          headerName: '채굴수량',
          type: 'string',
          flex: 0.07,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'done_status',
          headerName: '처리상태',
          type: 'string',
          flex: 0.07,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'tx_id',
          headerName: 'TXID',
          type: 'string',
          flex: 0.2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'req_date',
          headerName: '채굴일시',
          type: 'string',
          flex: 0.17,
          disableColumnMenu: true,
          editable: false,
      },
      {
        field: 'detail',
        headerName: '상세정보',
        flex: 0.08,
        disableColumnMenu: true,
        renderCell: (params) => {
            const isStopped = params.row.stop_yn === 'Y';
            return (
                <Button
                    variant="contained"
                    size="small"
                    sx={{ fontSize: '12px', backgroundColor: isStopped ? 'red' : 'green' }}
                    onClick={() => {
                        console.log(params.row);
                        handleStatusChangeClick(params.row.stop_yn);
                        setSelectedContent(params.row);
                    }}
                >
                    보기
                </Button>
            );
        },
      },
    ];

    React.useEffect(()=>{
  
      try{

          if (ref_Div.current) {

            const offsetHeight = ref_Div.current.offsetHeight;
            const offsetWidth = ref_Div.current.offsetWidth;
            
            console.log('Height:', offsetHeight, 'Width:', offsetWidth);

            ref_Grid.current = offsetHeight - 0;

            get_NodeList();

          }

      }catch(error){

        console.error('Error getting dimensions:', error);

      }

    },[]);

    React.useEffect(()=>{

    },[nodeList]);

    React.useEffect(()=>{

    },[filterNodeList]);

    const get_NodeList = async() => {
        
        setLoading(true);

        try {
        
          let fromDate = '';
          let toDate = '';

          const response = await fetch('/api/mining/miningList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pagingIdx, fromDate, toDate }),
            });

            const data = await response.json();

            if (response.ok) {
              
                setNodeList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
                setFilterNodeList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
            
            } else {
            
                alert(data.message);
            
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const renderNodeGrid = (nodeList) => {
        
        return (
            <DataGrid
                rows={filterNodeList}
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
                    width: '100%',
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
        );
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
            case 40:{

              setFilterContentTypeValueMethod('owner');
            }break;
            case 50:{

              setFilterContentTypeValueMethod('name');
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

    const handleClickSearch = async() => {

      try{

        let filteredList = [...nodeList];

        if(filterSellStatusValueMethod === 'all') {
          if(filterInfo.length > 0) {
            switch(filterContentTypeValueMethod) {
              case 'id': {
                filteredList = filteredList.filter((user) => 
                  user.kc_kiosk_id?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'location': {
                filteredList = filteredList.filter((user) => 
                  user.kc_addr?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'owner': {
                filteredList = filteredList.filter((user) => 
                  user.owner_id?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'name': {
                filteredList = filteredList.filter((user) => 
                  user.mb_name?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              default: {
                filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
            }
          }
        } else {
          // sell_status 비교 전에 공백 제거
          const normalizedStatus = filterSellStatusValueMethod.trim();
          
          if(filterInfo.length > 0) {
            switch(filterContentTypeValueMethod) {
              case 'id': {
                filteredList = filteredList.filter((user) => 
                  user.kc_kiosk_id?.includes(filterInfo) && 
                  user.sell_status?.toString() === normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'location': {
                filteredList = filteredList.filter((user) => 
                  user.kc_addr?.includes(filterInfo) && 
                  user.sell_status?.toString() === normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'owner': {
                filteredList = filteredList.filter((user) => 
                  user.owner_id?.includes(filterInfo) && 
                  user.sell_status?.toString() === normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'name': {
                filteredList = filteredList.filter((user) => 
                  user.mb_name?.includes(filterInfo) && 
                  user.sell_status?.toString() === normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              default: {
                filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
            }
          } else {
            filteredList = filteredList.filter((user) => 
              user.sell_status?.toString() === normalizedStatus)
              .map((user, idx) => ({ ...user, id: idx + 1 }));
          }
        }

        setFilterNodeList(filteredList);
          
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

    // 상태 변경 버튼 클릭 시 다이얼로그 열기
    const handleStatusChangeClick = (stop_yn) => {
        setSelectedStatus(stop_yn === 'Y' ? 'stop' : 'mining');
        setDialogOpen(true);
    };

    // 다이얼로그 닫기 및 초기화
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedStatus('');
    };

    // 상태 적용
    const handleApplyStatus = async() => {
     
        try{

          let node_status = '';

          switch(selectedStatus){
            case 'stop': {
              node_status = 'Y';
            } break;
            case 'mining': {
              node_status = 'N';
            } break;
            default: {
              node_status = '';
            } break;
          }

          console.log(selectedContent);

          const response = await fetch('/api/mining/miningUpdate', {

              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                // @ts-ignore
                node_no : selectedContent.node_no, 
                status : node_status }),
          });

          const data = await response.json();

          if (response.ok) {

            get_NodeList();
          
            } else {
          
              console.log(data);
              alert(data.message);
          
            }

          handleCloseDialog();

        }catch(error){

          console.log(error);
        }
    };

    const handleTestFunc = async() => {

      try{

        const response = await fetch('/api/batch', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              // @ts-ignore
              node_no : '', 
              status : '' }),
        });

      const data = await response.json();

        if (response.ok) {

          console.log('success');
        
        } else {
      
          console.log('fail');
          alert(data.message);

        }

      }catch(error){

        console.log(error);

      }

    }

    return (

      <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

        <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

            <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

        </div>

        <div style={{}}>
            <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
                채굴내역
            </Typography>
        </div>

        <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Paper style={{ padding: '10px', flex: 1, marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography style={{ fontSize: '14x', color: "#1f1f26"  }}>총 채굴횟수</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f26" }}>{nodeList.length}</Typography>
            </Paper>
            <Paper style={{ padding: '10px', flex: 1, marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography style={{ fontSize: '14px', color: "#1f1f26"  }}>채굴완료</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f26" }}>{nodeList.filter(node => node.done_yn === 'Y').length}</Typography>
            </Paper>
            <Paper style={{ padding: '10px', flex: 1, marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography style={{ fontSize: '14px', color: "#1f1f26"  }}>채굴중</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{nodeList.filter(node => node.done_yn === 'N').length}</Typography>
            </Paper>
            <Paper style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography style={{ fontSize: '14px', color: "#1f1f26"  }}>채굴실패</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{nodeList.filter(node => node.done_yn === 'F').length}</Typography>
            </Paper>
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
                  <MenuItem style={{fontSize:13}} value={40}>소유자ID</MenuItem>
                  <MenuItem style={{fontSize:13}} value={50}>소유자명</MenuItem>
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
            <Button id="keyBtns" variant="outlined" style={{color:"white",backgroundColor:"#1f1f26", borderColor:"#CBCBCB" ,height:"33px" , marginRight:"10px"}}  onClick={handleTestFunc}>
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

          {renderNodeGrid(filterNodeList)}

        </div>


        <Backdrop open={loading} sx={{ color: '#fff', display: 'flex', flexDirection: 'column', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <CircularProgress color="inherit" />
            <Typography variant="h6" color="inherit">키오스크 소유자 정보를 불러오는 중입니다</Typography>
        </Backdrop>

        <Dialog 
            open={dialogOpen} 
            onClose={handleCloseDialog} 
            PaperProps={{
                style: {
                    width: '500px', // 다이얼로그 너비 조정
                    padding: '20px', // 좌우 패딩 적용
                },
            }}
        >
            <DialogTitle style={{fontWeight:'bold', marginLeft:'0px', paddingLeft:'0px' }}>노드 설정</DialogTitle>
            <div>
                <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #ccc' }}>
                    {/* @ts-ignore */}
                    <p>노드명 : {selectedContent.node_name || '정보 없음'}</p>
                </div>
                <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #ccc' }}>
                    {/* @ts-ignore */}
                    <p>유저이메일 : {selectedContent.mb_email || '정보 없음'}</p>
                </div>
                <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #ccc' }}>
                    {/* @ts-ignore */}
                    <p>유저지갑 : {selectedContent.node_address || '정보 없음'}</p>
                </div>
            </div>
            <RadioGroup
                value={selectedStatus}
                onChange={(e) => {
                  

                  setSelectedStatus(e.target.value);

                }}
            >
                <FormControlLabel value="stop" control={<Radio />} label="정지" />
                <FormControlLabel value="mining" control={<Radio />} label="채굴" />
            </RadioGroup>
            <DialogActions>
                <Button 
                    onClick={handleCloseDialog} 
                    variant="outlined" 
                    style={{ color: '#1f1f26', borderColor: '#CBCBCB', marginRight: '10px' }}
                >
                    닫기
                </Button>
                <Button 
                    onClick={handleApplyStatus} 
                    variant="contained" 
                    style={{ backgroundColor: '#1f1f26', color: 'white' }}
                >
                    적용
                </Button>
            </DialogActions>
        </Dialog>

      </div>
    );

  }
