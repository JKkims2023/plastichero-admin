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
import SettingsIcon from '@mui/icons-material/Settings';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

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

    const page_info = 'Home > 채굴(노드)관리 > 채굴설정';

    // @ts-ignore
    const columns: GridColDef<(typeof rows)[number]>[] = [
      {   
          field: 'id', 
          headerName: 'No', 
          type: 'string',
          flex: 0.2,             
          disableColumnMenu: true, 
      },
      {
          field: 'kc_kiosk_id_text',
          headerName: '키오스크ID',
          type: 'string',
          flex: 0.6,
          disableColumnMenu: true,
          editable: false,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params) => {
              const allRows = params.api.getRowModels();
              const currentId = params.row.id;
              
              const prevRow = allRows.get(currentId - 1);
              const nextRow = allRows.get(currentId + 1);

              const isPrevSame = prevRow && prevRow.kc_kiosk_id_text === params.value;
              const isNextSame = nextRow && nextRow.kc_kiosk_id_text === params.value;

              const cellStyle: React.CSSProperties = {
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTop: 'none',
                  borderBottom: 'none',
                  borderRight: 'none',
                  borderLeft: '0.1px solid #f4f6f6',
              };

              // 값이 이전 행과 같으면 표시하지 않음
              if (isPrevSame) {
                  return <div style={cellStyle}></div>;
              }

              return (
                  <div style={cellStyle}>
                      {params.value}
                  </div>
              );
          }
      },
      {
          field: 'node_type_text',
          headerName: '타입',
          type: 'string',
          flex: 0.3,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'node_name',
          headerName: '노드명',
          type: 'string',
          flex: 0.6,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_email',
          headerName: '유저이메일',
          type: 'string',
          flex: 0.8,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mining_amount',
          headerName: '설정수량',
          type: 'string',
          flex: 0.3,
          align: 'center',
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'node_address',
          headerName: '유저지갑',
          type: 'string',
          flex: 2,
          disableColumnMenu: true,
          editable: false,
      },
      {
        field: 'stop_yn',
        headerName: '상태',
        flex: 0.7,
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
                    {isStopped ? '정지중' : '채굴중'}
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
        
          const response = await fetch('/api/mining/miningSetting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pagingIdx, filterInfo }),
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
                    '.MuiDataGrid-columnSeparator': {
                        display: 'none',
                    },
                    "& .MuiDataGrid-columnHeader": {
                        borderTopColor: "green",
                        borderBlockColor: "green",
                        color: "#000000",
                        fontSize: 13.5,
                        fontWeight: 900,
                        WebkitFontSmoothing: 'antialiased',
                    },
                    "& .MuiDataGrid-cell": {
                        border: 1,
                        borderColor: "#f4f6f6",
                        borderRight: 0,
                        borderTop: 0,
                        fontSize: 13.5,
                    },
                    '& .MuiDataGrid-cell[data-field="kc_kiosk_id_text"]': {
                        borderTop: 'none !important',
                        borderBottom: 'none !important',
                        borderRight: 'none !important',
                        borderLeft: '1px solid #f4f6f6 !important',
                        padding: 0,
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
                    '& .MuiDataGrid-row': {
                        '&:hover': {
                            backgroundColor: 'inherit',
                        },
                    },
                    '& .even': {
                        backgroundColor: theme => theme.palette.grey[50],
                    },
                }}
                getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 1 ? 'even' : 'odd'
                }
                style={{
                    marginTop:'20px',
                }}
                getRowHeight={() => 42}
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

              setFilterContentTypeValueMethod('email');
            }break;
            case 40:{

              setFilterContentTypeValueMethod('address');
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
            setFilterSellStatusValueMethod('N');
          }break;
          case 30:{
            setFilterSellStatusValueMethod('Y');
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
                  user.kc_kiosk_id_text?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'email': {
                filteredList = filteredList.filter((user) => 
                  user.mb_email?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'address': {
                filteredList = filteredList.filter((user) => 
                  user.node_address?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;

            }

          }else{

            filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
          
          }

        } else {
          // sell_status 비교 전에 공백 제거
          const normalizedStatus = filterSellStatusValueMethod.trim();
          
          if(filterInfo.length > 0) {

            switch(filterContentTypeValueMethod) {

              case 'id': {
                filteredList = filteredList.filter((user) => 
                  user.kc_kiosk_id_text?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'email': {
                filteredList = filteredList.filter((user) => 
                  user.mb_email?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'address': {
                filteredList = filteredList.filter((user) => 
                  user.node_address?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;

            }

            switch(filterSellStatusValueMethod) {

              case 'Y': {
                filteredList = filteredList.filter((user) => 
                  user.stop_yn?.toString() == 'Y')
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'N': {
                filteredList = filteredList.filter((user) => 
                  user.stop_yn?.toString() == 'N')
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;

            }

          } else {

             switch(filterSellStatusValueMethod) {

              case 'Y': {
                filteredList = filteredList.filter((user) => 
                  user.stop_yn?.toString() == 'Y')
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'N': {
                filteredList = filteredList.filter((user) => 
                  user.stop_yn?.toString() == 'N')
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;

            }
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

    return (

      <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

        <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

            <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

        </div>

        <div style={{}}>
            <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
                채굴설정
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
            <div style={{display:"flex", float:"left"}}>
                <FormControl fullWidth style={{ width:"175px", marginTop:"0px", marginLeft:"8px", backgroundColor:'white', color:'black'}}>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        style={{color:'black', height: '33px', fontSize: '13px'}}
                        value={filterSellStatusMethod}
                        size="small"
                        onChange={handleChangeFilterSellStatus}
                    >
                        <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                        <MenuItem style={{fontSize:13}} value={20}>채굴중</MenuItem>
                        <MenuItem style={{fontSize:13}} value={30}>정지</MenuItem>

                    </Select>
                </FormControl>
            </div>

            <div style={{display:"flex", float:"left", marginLeft:"auto", width:"100%"}}>
                <FormControl fullWidth style={{ width:"110px", marginTop:"0px", marginLeft:"auto", backgroundColor:'white', color:'black'}}>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        style={{color:'black', height: '33px', fontSize: '13px'}}
                        value={filterContentTypeMethod}
                        size="small"
                        onChange={handleChangeFilterContentType}
                    >
                        <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                        <MenuItem style={{fontSize:13}} value={20}>키오스크ID</MenuItem>
                        <MenuItem style={{fontSize:13}} value={30}>유저이메일</MenuItem>
                        <MenuItem style={{fontSize:13}} value={40}>유저지갑</MenuItem>
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
                    <InputLabel id='keywordLabel' size="small" sx={{height:"33px", fontSize: '13px'}}>키워드를 입력하세요</InputLabel>
                    <OutlinedInput
                        sx={{height:"33px", backgroundColor:'white', fontSize: '13px'}}
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
            <Button 
                id="keyBtns" 
                variant="outlined" 
                style={{
                    color:"white",
                    backgroundColor:"#1f1f26", 
                    borderColor:"#CBCBCB",
                    height:"33px",
                    marginRight:"10px",
                    fontSize: '13px'
                }} 
                onClick={handleClickSearch}
            >
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
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    backgroundColor: '#1976d2',
                    color: 'white',
                    p: 2,
                    flex: '0 0 auto'
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1 
                }}>
                    <SettingsIcon />
                    <Typography 
                        component="span"
                        sx={{ 
                            fontSize: '1.25rem',
                            fontWeight: 'bold'
                        }}
                    >
                        노드 설정
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent 
                sx={{ 
                    p: 3,
                    flex: '1 1 auto',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    marginTop:'20px'
                }}>
                    <TextField
                        label="노드명"
                        // @ts-ignore
                        value={selectedContent.node_name || ''}
                        fullWidth
                        size="small"
                        InputProps={{
                            readOnly: true,
                        }}
                        sx={{
                          '& .MuiInputLabel-root': { fontSize: '13px' },
                          '& .MuiInputBase-input': { fontSize: '13px' }
                        }}
                    />
                    <TextField
                        label="유저이메일"
                        // @ts-ignore
                        value={selectedContent.mb_email || ''}
                        fullWidth
                        size="small"
                        InputProps={{
                            readOnly: true,
                        }}
                        sx={{
                          '& .MuiInputLabel-root': { fontSize: '13px' },
                          '& .MuiInputBase-input': { fontSize: '13px' }
                        }}
                    />
                    <TextField
                        label="유저지갑"
                        // @ts-ignore
                        value={selectedContent.node_address || ''}
                        fullWidth
                        size="small"
                        InputProps={{
                            readOnly: true,
                        }}
                        sx={{
                          '& .MuiInputLabel-root': { fontSize: '13px' },
                          '& .MuiInputBase-input': { fontSize: '13px' }
                        }}
                    />
                </Box>

                <Box sx={{
                    mt: 2,
                    p: 2,
                    marginTop:'0px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                }}>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1976d2',
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <SettingsIcon sx={{ fontSize: 20 }} />
                        노드 상태 설정
                    </Typography>
                    
                    <RadioGroup
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        sx={{
                            '& .MuiFormControlLabel-root': {
                                marginY: 0
                            },
                            '& .MuiFormControlLabel-label': {
                                fontSize: '13px'
                            }
                        }}
                    >
                        <FormControlLabel 
                            value="stop" 
                            control={
                                <Radio 
                                    sx={{
                                        color: '#1976d2',
                                        '&.Mui-checked': {
                                            color: '#1976d2',
                                        }
                                    }}
                                />
                            } 
                            label="정지" 
                        />
                        <FormControlLabel 
                            value="mining" 
                            control={
                                <Radio 
                                    sx={{
                                        color: '#1976d2',
                                        '&.Mui-checked': {
                                            color: '#1976d2',
                                        }
                                    }}
                                />
                            } 
                            label="채굴" 
                        />
                    </RadioGroup>
                </Box>
            </DialogContent>

            <DialogActions 
                sx={{ 
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    borderTop: '1px solid #ddd',
                    flex: '0 0 auto'
                }}
            >
                <Button 
                    onClick={handleCloseDialog} 
                    variant="outlined" 
                    startIcon={<CancelIcon />}
                    sx={{ fontSize: '13px' }}
                >
                    취소
                </Button>
                <Button 
                    onClick={handleApplyStatus} 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    sx={{ fontSize: '13px' }}
                >
                    적용
                </Button>
            </DialogActions>
        </Dialog>

      </div>
    );

  }
