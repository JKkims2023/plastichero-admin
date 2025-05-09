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
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import PaidIcon from '@mui/icons-material/Paid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Divider from '@mui/material/Divider';
import DialogContent from '@mui/material/DialogContent';

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
    const [startDate, setStartDate] = React.useState(dayjs());
    const [endDate, setEndDate] = React.useState(dayjs());
    const [detailSendList, setDetailSendList] = React.useState([]);
    const [isDetailShow, setIsDetailShow] = React.useState(false);
    const [detailMessage, setDetailMessage] = React.useState('');
    const [detailBugTrackKey, setDetailBugTrackKey] = React.useState('');
    const [detailBugTrackMessage, setDetailBugTrackMessage] = React.useState('');
    const [passDialogOpen, setPassDialogOpen] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const [companyList, setCompanyList] = React.useState([]);
    const [scheduleStatus, setScheduleStatus] = React.useState(false);
    const [spreadStatus, setSpreadStatus] = React.useState(false);

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
      /*
      {
          field: 'node_name',
          headerName: '노드명',
          type: 'string',
          flex: 0.1,
          disableColumnMenu: true,
          editable: false,
      },
      */
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
          field: 'mainnet_request_status',
            headerName: '채굴요청',
            type: 'string',
            flex: 0.07,
            disableColumnMenu: true,
            editable: false,
            valueFormatter: (params) => {
                // @ts-ignore
                switch (params) {
                    case 'N':
                        return '요청전';
                    case 'F':
                        return '실패';
                    case 'S':
                        return '완료';
                    default:{
                        // @ts-ignore
                        return params;
                    }
                }
            }
      },
      {
            field: 'done_status_dummy',
            headerName: '채굴결과',
            type: 'string',
            flex: 0.07,
            disableColumnMenu: true,
            editable: false,
            renderCell: (params) => {
            if (params.row.tx_hash !== null && params.row.mainnet_request_status === 'S') {
                return '완료';
            } else if (params.row.tx_hash === null && params.row.mainnet_request_status === 'S') {
                return '채굴중';
            } else {
                return '실패';
            }
        }
      },

      {
          field: 'req_date',
          headerName: '처리일시',
          type: 'string',
          flex: 0.13,
          disableColumnMenu: true,
          editable: false,
      },
      /*
      {
        field: 'detail',
        headerName: '상세정보',
        flex: 0.08,
        hideable:true,
        disableColumnMenu: true,
        renderCell: (params) => {
            const getButtonColor = () => {
                switch(params.row.mainnet_request_status) {
                    case 'S': return '#1976d2';  // Blue
                    case 'N': return '#2e7d32';  // Green
                    case 'F': return '#d32f2f';  // Red
                    default: return '#1976d2';   // 기본값 Blue
                }
            };

            return (
                <Button
                    variant="contained"
                    size="small"
                    sx={{ 
                        fontSize: '12px', 
                        backgroundColor: getButtonColor(),
                        '&:hover': {
                            backgroundColor: getButtonColor(),
                            opacity: 0.9
                        }
                    }}
                    onClick={() => {

                        setSelectedContent(params.row);

                        switch(params.row.mainnet_request_status){
                            
                            case 'N':{
                                
                                setIsDetailShow(false);
                               
                            } break;
                            case 'S':{
                                
                                setIsDetailShow(true);

                            } break;
                            case 'F':{
                                
                                console.log(params.row.mainnet_request_status);
                                setIsDetailShow(false);
                                setDetailMessage('블록체인 서버로 채굴 요청이 실패하였습니다.\채굴 요청 자체 실패로 인하여 관련 지갑들로의 코인전송 또한 수행되지 않았습니다.');
                                setDetailBugTrackKey('장애 추적키 : ' + params.row.result_key);
                                setDetailBugTrackMessage('장애 메세지 : ' + params.row.result_msg);

                            } break;
                            default:{
                                setIsDetailShow(true);
                                break;
                            }
                        }
                        
                        get_Detail_NodeList(params.row.result_key);

                    }}
                >
                    보기
                </Button>
            );
        },
      },
      */
    ];

    const detailColumns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'No',
            flex: 0.1,
            disableColumnMenu: true,
        },
        {
            field: 'node_name',
            headerName: '분배 대상',
            flex: 0.4,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Typography sx={{ 
                    fontSize: '13px',
                    width: '100%',
                    textAlign: 'left'
                }}>
                    {params.value || '노드소유주'}
                </Typography>
            ),
        },
        {
            field: 'amount',
            headerName: '전송수량',
            flex: 0.3,
            disableColumnMenu: true,
        },
        {
            field: 'result',
            headerName: '처리결과',
            flex: 0.2,
            disableColumnMenu: true,
            renderCell: (params) => {

                console.log(params.row);
                const isCompleted = params.row.mainnet_request_status == 'S' && params.row.tx_id == 'testtxid';
                return (
                    <Typography sx={{ 
                        fontSize: '13px',
                        color: isCompleted ? 'green' : 'inherit'
                    }}>
                        {isCompleted ? '완료' : '처리 대기'}
                    </Typography>
                );
            }
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

    React.useEffect(() => {

        if (startDate) {

            get_NodeList();
        
        }

    }, [startDate]);

    const get_NodeList = async() => {
        
        setLoading(true);

        try {
        
          const fromDate = startDate.format('YYYY-MM-DD').replace(/-/g, '');

          setNodeList([]);
          setCompanyList([]);
          setScheduleStatus(false);
          setSpreadStatus(false);

          const response = await fetch('/api/mining/miningList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pagingIdx, fromDate }),
            });

            const data = await response.json();


            if (response.ok) {
              
                setNodeList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
                setFilterNodeList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));

                setCompanyList(data.result_company_list);

                if(data.result_schedule_info.length > 0){

                  setScheduleStatus(data.result_schedule_info[0].scheduled_yn == 'Y');
                  setSpreadStatus(data.result_schedule_info[0].spreaded_yn == 'Y');

                }else{

                  setScheduleStatus(false);
                  setSpreadStatus(false);

                }
            
            } else {
            
                alert(data.message);
            
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const get_Detail_NodeList = async(result_key) => {
        
        setLoading(true);

        try {
        
          const response = await fetch('/api/mining/miningDetailList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // @ts-ignore
                body: JSON.stringify({ target_id: result_key }),
            });

            const data = await response.json();

            console.log(data);

            if (response.ok) {
              
                setDetailSendList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
            
                setDialogOpen(true);

            } else {
            
                setDetailSendList([]);

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
                        fontSize: '13px',
                        color: 'inherit'
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

              setFilterContentTypeValueMethod('address');
            }break;
            case 40:{

              setFilterContentTypeValueMethod('txid');
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
            setFilterSellStatusValueMethod('S');
          }break;
          case 30:{
            setFilterSellStatusValueMethod('N');
          }break;
          case 40:{
            setFilterSellStatusValueMethod('F');
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
              case 'address': {
                filteredList = filteredList.filter((user) => 
                  user.address?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'txid': {
                filteredList = filteredList.filter((user) => 
                  user.tx_hash?.includes(filterInfo))
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
          const normalizedStatus = filterSellStatusValueMethod.trim();
          
          if(filterInfo.length > 0) {

            switch(filterContentTypeValueMethod) {

              case 'id': {
                filteredList = filteredList.filter((user) => 
                  user.kc_kiosk_id?.includes(filterInfo) && 
                  user.done_yn?.toString() == normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'address': {
                filteredList = filteredList.filter((user) => 
                  user.address?.includes(filterInfo) && 
                  user.done_yn?.toString() == normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'txid': {
                filteredList = filteredList.filter((user) => 
                  user.tx_hash?.includes(filterInfo) && 
                  user.tx_hash?.toString() == normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              default: {
                filteredList = filteredList.filter((user) => 
                  user.done_yn?.toString() == normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;

            }

          } else {

            filteredList = filteredList.filter((user) => 
              user.done_yn?.toString() == normalizedStatus)
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

    const handleTestFunc = async() => {
        
        try {

            if(filterInfo.length == 0) {
                alert('키워드를 입력하세요');
                return;
            }

            const response = await axios.post('http://localhost:3002/mining/result', {
                // 전송할 데이터 객체
                result_key: filterInfo,

            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                // 성공적으로 데이터를 받았을 때의 처리
                console.log('Success:', response.data);
                
            }

        } catch (error) {
            console.log(error);
        }
    };

    const handlePassFunc = async() => {

        if(!scheduleStatus){

          alert('채굴 완료 이후 분배가 가능합니다.');
          return;

        }

        if(spreadStatus){

          alert('분배완료 상태입니다.');
          return;

        }
        
        setPassDialogOpen(true);
    };

    const handleAuthSpreadCheck = async() => {


        if(password.length == 0){

          alert('화면잠금 비밀번호를 입력해주세요');
          return;

        }

        setLoading(true);

        try {

          const response = await fetch('/api/mining/authSpreadCheck', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();


            if (data.result == 'success') {
        
                setPassDialogOpen(false);
                setPassword('');

                handleSpreadFunc();
             
            } else {
            
                alert(data.info);
            
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }

    };

    const handleSpreadFunc = async() => {
        
        try {

        //    console.log(process.env.BATCH_LIVE_URL);

            const response = await axios.post('https://port-0-plastichero-batch-m90know96390d9a9.sel4.cloudtype.app' + '/api/mining/spread', {

//            const response = await axios.post(process.env.BATCH_LIVE_URL + '/api/mining/spread', {
         //   const response = await axios.post(process.env.BATCH_LIVE_URL + '/api/mining/spread', {

                round_date: startDate.format('YYYY-MM-DD').replace(/-/g, ''),

            }, {

            
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.result == 'success') {

                get_NodeList();

                alert('분배완료');

            }else{
                alert('분배실패');
            }

        } catch (error) {
            console.log(error);
        }
    };

    const handleExcelFunc = async() => {


        setLoading(true);

        try {

          const response = await fetch('/api/excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();


            if (data.result == 'success') {
        
                alert('엑셀 파일 업로드 완료');
             
            } else {
            
                alert(data.info);
            
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }

    };


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
                <Typography style={{ fontSize: '14x', color: "#1f1f26"  }}>요청된 채굴횟수</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f26" }}>
                    {filterNodeList.length.toLocaleString('ko-KR')}
                </Typography>
            </Paper>
            <Paper style={{ padding: '10px', flex: 1, marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography style={{ fontSize: '14px', color: "#1f1f26"  }}>요청된 채굴수량</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f26" }}>
                    {(filterNodeList
                        .filter(node => node.mainnet_request_status === 'S')
                        .reduce((sum, node) => sum + Number(node.mining_amount || 0), 0)
                    * 2).toLocaleString('ko-KR')} PTH
                </Typography>
            </Paper>
            <Paper style={{ padding: '10px', flex: 1, marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography style={{ fontSize: '14px', color: "#1f1f26"  }}>요청상태</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f26" }}>
                    {scheduleStatus ? '요청완료' : '예정'}
                </Typography>
            </Paper>
            <Paper style={{ padding: '10px', flex: 1, marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography style={{ fontSize: '14px', color: "#1f1f26"  }}>채굴진행중</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                    {filterNodeList.filter(node => (node.mainnet_request_status == 'S' && node.done_yn == 'N')).length.toLocaleString('ko-KR')}
                </Typography>
            </Paper>
            <Paper style={{ padding: '10px', flex: 1, marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography style={{ fontSize: '14px', color: "#1f1f26"  }}>채굴성공</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                    {filterNodeList.filter(node => (node.mainnet_request_status == 'S' && node.done_yn == 'S') && node.tx_hash != null).length.toLocaleString('ko-KR')}
                </Typography>
            </Paper>
            <Paper style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography style={{ fontSize: '14px', color: "#1f1f26"  }}>채굴실패</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                    {filterNodeList.filter(node => (node.mainnet_request_status == 'F' || node.done_yn == 'F')).length.toLocaleString('ko-KR')}
                </Typography>
            </Paper>
            <Paper style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography style={{ fontSize: '14px', color: "#1f1f26"  }}>분배여부</Typography>
                <Typography style={{ fontSize: "24px", fontWeight: "bold", color: true ? 'green' : '#1f1f26'}}>
                    {spreadStatus ? '분배완료' : '분배대기'}
                </Typography>
            </Paper>
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
            
            <div style={{ display: "flex", alignItems: "center", marginRight: "5px",}}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                    <DemoContainer 
                        components={['DatePicker']} 
                        sx={{ 
                            paddingTop:"-5px",
                            alignSelf:'center',
                            alignItems:'center',
                            justifyContent:'center',
                            overflow: 'hidden',  // 스크롤만 제거

                        }}
                    >
                        <DatePicker
                            value={startDate}
                            onChange={(newValue) => {
                                setStartDate(newValue);
                                if (newValue) {
                                    get_NodeList();
                                }
                            }}
                            format="YYYY-MM-DD"
                            slotProps={{
                                textField: {
                                    placeholder: '',
                                }
                            }}
                            sx={{
                                backgroundColor: 'white',
                                width: '150px',
                                alignSelf:'center',
                                alignItems:'center',
                                '& .MuiInputBase-root': {
                                    height: '33px',
                                    fontSize: '13px',
                                },
                                '& .MuiFormLabel-root': {
                                    display: 'none',
                                },
                            }}
                        />
                    </DemoContainer>
                </LocalizationProvider>
            </div>

            <div style={{display:"flex", float:"left"}}>
                <FormControl fullWidth style={{ width:"175px", marginTop:"0px", marginLeft:"0px", backgroundColor:'white', color:'black'}}>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        style={{color:'black', height: '33px', fontSize: '13px'}}
                        value={filterSellStatusMethod}
                        size="small"
                        onChange={handleChangeFilterSellStatus}
                    >
                        <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                        <MenuItem style={{fontSize:13}} value={20}>채굴완료</MenuItem>
                        <MenuItem style={{fontSize:13}} value={30}>채굴중</MenuItem>
                        <MenuItem style={{fontSize:13}} value={40}>채굴실패</MenuItem>
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
                        <MenuItem style={{fontSize:13}} value={30}>지갑주소</MenuItem>
                        <MenuItem style={{fontSize:13}} value={40}>TXID</MenuItem>
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
                    marginRight:"10px",
                    fontSize: '14px'
                }} 
                onClick={handleClickSearch}
            >
                검색
            </Button>
            <Button 
                id="keyBtns" 
                variant="outlined" 
                style={{
                    color:"white",
                    backgroundColor:"blue", 
                    borderColor:"blue",
                    height:"33px",
                    width:'100px',
                    marginRight:"10px",
                    fontSize: '14px'
                }} 
                onClick={handlePassFunc}
            >
                분배
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

        <Dialog 
            open={dialogOpen} 
            onClose={() => {
                setDialogOpen(false);
                setSelectedContent({});
                setDetailSendList([]);
            }}
            PaperProps={{
                style: {
                    width: '550px',
                    padding: '0',
                },
            }}
        >
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
                padding: '20px',
                backgroundColor: '#2C73D2'
            }}>
                <DialogTitle 
                    style={{
                        fontWeight: 'bold', 
                        margin: '0',
                        padding: '0',
                        fontSize: '16px',
                        color: 'white'
                    }}
                >
                    채굴 처리내역
                </DialogTitle>
                <IconButton
                    onClick={() => {
                        setDialogOpen(false);
                        setSelectedContent({});
                        setDetailSendList([]);
                    }}
                    sx={{
                        padding: '0',
                        '&:hover': {
                            backgroundColor: 'transparent'
                        }
                    }}
                >
                    <CloseIcon sx={{ fontSize: '20px', color: 'white' }} />
                </IconButton>
            </div>

            <DialogContent>
                <Box sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    p: 2.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                    mb: 2
                }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <AccountTreeIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                }}>
                                    노드명
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1f1f26',
                                pl: 3
                            }}>
                                {/* @ts-ignore */}
                                {selectedContent.node_name || '-'}
                            </Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <CheckCircleIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                }}>
                                    처리상태
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: '14px',
                                fontWeight: '500',
                                color: (() => {
                                    // @ts-ignore
                                    switch(selectedContent.done_yn) {
                                        case 'S': return '#1976d2';
                                        case 'N': return '#2e7d32';
                                        case 'F': return '#d32f2f';
                                        default: return '#1f1f26';
                                    }
                                })(),
                                pl: 3
                            }}>
                                {/* @ts-ignore */}
                                {selectedContent.done_status || '-'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {isDetailShow ? 
                    <>                 
                        {/* Summary 영역 */}
                        <Box sx={{ mb: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box sx={{ 
                                        p: 2,
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        height: '100%'
                                    }}>
                                        <Typography sx={{ 
                                            color: '#333',
                                            fontSize: '13px',
                                            mb: 1,
                                            fontWeight: 500
                                        }}>
                                            전송수량
                                        </Typography>
                                        <Typography sx={{ 
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: '#1976d2'
                                        }}>
                                            {/* @ts-ignore */}
                                            {(detailSendList?.length > 0 
                                                ? detailSendList.reduce((sum, row) => 
                                                    sum + (Number(row.amount) || 0), 0)
                                                : 0)
                                            } PTH
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ 
                                        p: 2,
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        height: '100%'
                                    }}>
                                        <Typography sx={{ 
                                            color: '#333',
                                            fontSize: '13px',
                                            mb: 1,
                                            fontWeight: 500
                                        }}>
                                            분배수
                                        </Typography>
                                        <Typography sx={{ 
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: '#1976d2'
                                        }}>
                                            {detailSendList?.length || '0'}건
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* DataGrid */}
                        <DataGrid
                            rows={detailSendList || []}
                            columns={detailColumns}
                            disableRowSelectionOnClick={true}
                            hideFooter={true}
                            autoHeight={false}
                            sx={{
                                height: '400px',
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid #f0f0f0',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 16px',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f5f5f5',
                                    borderBottom: 'none',
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontSize: '13px',
                                        fontWeight: 600,
                                    },
                                },
                                '& .MuiDataGrid-row': {
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5',
                                    },
                                },

                            }}
                        />
                 </>
                    :
                    <div>
                        <Typography sx={{   
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#d32f2f',
                            pl: 1,
                            mt: 1,
                            marginTop:'10px'

                        }}>
                            {detailMessage}
                        </Typography>
                        <Typography sx={{   
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#1f1f26',
                            pl: 1,
                            mt: 1,
                            marginTop:'10px'

                        }}>
                            {detailBugTrackMessage}
                        </Typography>
                        <Typography sx={{   
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#1f1f26',
                            pl: 1,
                            mt: 1,
                            marginTop:'5px'

                        }}>
                            {detailBugTrackKey}
                        </Typography>
                    </div>
                }

            </DialogContent>

            <DialogActions style={{ 
                padding: '15px 20px',
                marginTop: '20px', 
                justifyContent: 'flex-end',
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#2C73D2'
            }}>
                <Button 
                    onClick={() => {
                        setDialogOpen(false);
                        setSelectedContent({});
                        setDetailSendList([]);
                    }}
                    variant="outlined" 
                    style={{ 
                        color: 'white',
                        borderColor: 'white',
                        fontSize: '13px',
                        height: '33px',
                        backgroundColor: 'transparent'
                    }}
                    startIcon={<CloseIcon style={{ fontSize: '20px', color: 'white' }} />}
                >
                    닫기
                </Button>
            </DialogActions>
        </Dialog>

        <Dialog 
            open={passDialogOpen} 
            onClose={() => {
                setPassDialogOpen(false);
            }}
            PaperProps={{
                style: {
                    width: '550px',
                    padding: '0',
                },
            }}
        >
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
                padding: '20px',
                backgroundColor: '#2C73D2'
            }}>
                <DialogTitle 
                    style={{
                        fontWeight: 'bold', 
                        margin: '0',
                        padding: '0',
                        fontSize: '16px',
                        color: 'white'
                    }}
                >
                    분배 실행
                </DialogTitle>
                <IconButton
                    onClick={() => {
                        setPassDialogOpen(false);
                        setPassword('');
                    }}
                    sx={{
                        padding: '0',
                        '&:hover': {
                            backgroundColor: 'transparent'
                        }
                    }}
                >
                    <CloseIcon sx={{ fontSize: '20px', color: 'white' }} />
                </IconButton>
            </div>

            <DialogContent>

            <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold' }}>
                분배 예정 정보
            </Typography>
            
            <Box sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    p: 2.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                    mb: 2,
                    marginTop:'10px',
                }}>


                <div style={{padding:'10px', backgroundColor:'#f1f1f1', flex: '0 0 150px', marginTop:'10px' }}>
                    <Typography sx={{fontSize:"13px",  color: '#1f1f26', }}>
                        분배수량 : {filterNodeList
                        .filter(node => node.mainnet_request_status === 'S')
                        .reduce((sum, node) => sum + Number(node.mining_amount || 0), 0)
                        .toLocaleString('ko-KR')} PTH
                    </Typography>

                    <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginTop:'10px'}}>
                        플라스틱히어로 글로벌 : 
                        {(parseInt(companyList[0]?.mining_amount) * nodeList?.length)
                        .toLocaleString('ko-KR')} PTH
                    </Typography>

                    <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginTop:'5px'}}>
                        플라스틱히어로 코리아 : 
                        {(parseInt(companyList[1]?.mining_amount) * nodeList?.length)
                        .toLocaleString('ko-KR')} PTH
                    </Typography>

                    <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginTop:'5px'}}>
                        에코센트레 : 
                        {(parseInt(companyList[2]?.mining_amount) * nodeList?.length)
                        .toLocaleString('ko-KR')} PTH
                    </Typography>

                    <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginTop:'5px'}}>
                        기부 : 
                        {(parseInt(companyList[3]?.mining_amount) * nodeList?.length)
                        .toLocaleString('ko-KR')} PTH
                    </Typography>

                    <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginTop:'5px'}}>
                        브릭스트림 : 
                        {(parseInt(companyList[4]?.mining_amount) * nodeList?.length)
                        .toLocaleString('ko-KR')} PTH
                    </Typography>

                </div>

                </Box>

                <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold' }}>
                    분배 보안정보 입력
                </Typography>

                <Box sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    p: 2.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                    mb: 2,
                    marginTop:'10px',
                }}>

                <FormControl sx={{minWidth: '330px' }} variant="outlined">
                    <OutlinedInput
                        id="keywordInfoField"
                        sx={{
                        height: "33px",
                        backgroundColor: 'white',
                        borderColor: '#e0e0e0',
                        fontSize: '14px'
                        }}
                        placeholder='화면잠금 비밀번호를 입력해주세요'
                        type='text'
                        value={password}
                        onChange={(text) => {

                        setPassword(text.target.value);
                        
                        }}
                    
                        endAdornment={
                        <InputAdornment position="end">
                            <ClearIcon
                            onClick={() => { setPassword(''); 

                            }}
                            />
                        </InputAdornment>
                        }
                    />
                </FormControl> 

                </Box>

            </DialogContent>

            <DialogActions style={{ 
                padding: '15px 20px',
                marginTop: '20px', 

                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#2C73D2'
            }}>
                <Button 
                    onClick={() => {
                        setPassDialogOpen(false);
                        setPassword('');
                    }}
                    variant="outlined" 
                    style={{ 
                        color: 'white',
                        borderColor: 'white',
                        fontSize: '13px',
                        height: '33px',
                        backgroundColor: 'transparent'
                    }}
                    startIcon={<CloseIcon style={{ fontSize: '20px', color: 'white' }} />}
                >
                    닫기
                </Button>
                <Button 
                    onClick={() => {

                        handleAuthSpreadCheck();
                    }}
                    variant="outlined" 
                    style={{ 
                        color: 'white',
                        borderColor: 'white',
                        fontSize: '13px',
                        height: '33px',
                        backgroundColor: 'transparent'
                    }}
                    startIcon={<CheckCircleIcon style={{ fontSize: '20px', color: 'white' }} />}
                >
                    실행
                </Button>
            </DialogActions>
        </Dialog>

        <Backdrop open={loading} sx={{ color: '#fff', display: 'flex', flexDirection: 'column', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <CircularProgress color="inherit" />
            <Typography variant="h6" color="inherit">채굴내역 정보를 불러오는 중입니다</Typography>
        </Backdrop>

      </div>
    );

  }
