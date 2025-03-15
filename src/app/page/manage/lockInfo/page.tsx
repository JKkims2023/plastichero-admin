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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import LockIcon from '@mui/icons-material/Lock';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Divider from '@mui/material/Divider';

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
        idx: '',
        address: '',
        mb_name: '',
        mb_id: '',
        email: '',
        unlock_date: '',
        lock_type: '0',
        lock_type_text: '',
        lock_balance: '0'
    });

    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('all');
    const [filterSellStatusMethod, setFilterSellStatusMethod] = React.useState(10);
    const [filterSellStatusValueMethod, setFilterSellStatusValueMethod] = React.useState('all');
    const [stateBottom, setStateBottom] = React.useState(false);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [newLockInfo, setNewLockInfo] = React.useState({
        address: '',
        mb_name: '',
        mb_id: '',
        email: '',
        unlock_date: '',
        lock_type: '',
        lock_balance: '0'
    });

    const [openSearchDialog, setOpenSearchDialog] = React.useState(false);
    const [isManualInput, setIsManualInput] = React.useState(false);
    const [searchKeyword, setSearchKeyword] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [blockMemo, setBlockMemo] = React.useState('');

    const [loading, setLoading] = React.useState(false);

    const [openManageDialog, setOpenManageDialog] = React.useState(false);

    const [searchOption, setSearchOption] = React.useState('address'); // 기본 검색 옵션 설정

    const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);

    const page_info = 'Home > 운영관리 > Lock 설정';

    // @ts-ignore
    const columns: GridColDef<(typeof rows)[number]>[] = [
      {   
          field: 'id', 
          headerName: 'No', 
          type: 'string',
          width: 70,             // flex 대신 고정 너비 사용
          disableColumnMenu: true, 
      },
      {
          field: 'address',
          headerName: '지갑주소',
          type: 'string',
          flex: 3.5,              // 비율 조정
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'lock_type_text',
          headerName: 'Lock 타입',
          type: 'string',
          flex: 1,              // 비율 조정
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_name',
          headerName: '이용자명',
          type: 'string',
          flex: 1,              // 비율 조정
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_id',
          headerName: '이용자 ID',
          type: 'string',
          flex: 1,              // 비율 조정
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'email',
          headerName: '연결된 이메일',
          type: 'string',
          flex: 1.5,           // 비율 조정
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'unlock_date',
          headerName: '해지 예정일',
          type: 'string',
          flex: 1.5,             // 비율 조정
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'reg_date',
          headerName: '등록일시',
          type: 'string',
          flex: 1,           // 비율 조정
          disableColumnMenu: true,
          renderCell: (params) => (
              <span>{params.value?.substring(0, 10)}</span>
          ),
      },
      {
        field: 'detail',
        headerName: '상세정보',
        width: 100,          // flex 대신 고정 너비 사용
        disableColumnMenu: true,
        renderCell: (params) => (
            <Button
                variant="contained"
                size="small"
                sx={{ fontSize: '12px' }}
                onClick={(event) => {

                    event.stopPropagation();

                    console.log('jk1');
                    handleOpenManageDialog(filterKioskList[params.row.id - 1]);
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

        setLoading(true);

        const response = await fetch('/api/manage/lockInfo', {

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

      }finally{
        setLoading(false);
      }

    };

    const toggleDrawer = (anchor: 'top' | 'left' | 'bottom' | 'right', open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' && (event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Escape'
      ) {
        return;
      }

      setStateBottom(open);

      if (!open) { // 다이얼로그가 닫힐 때 항목 초기화
        setFilterInfo('');
        setSearchResults([]); // 검색 결과 초기화
        // 추가적인 항목 초기화가 필요하다면 여기에 추가
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
              setFilterContentTypeValueMethod('1');
            }break;
            case 30:{
              setFilterContentTypeValueMethod('0');
            }break;
            case 40:{
              setFilterContentTypeValueMethod('2');
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
            setFilterSellStatusValueMethod('address');
          }break;
          case 30:{
            setFilterSellStatusValueMethod('name');
          }break;
          case 40:{
            setFilterSellStatusValueMethod('id');
          }break;
          case 50:{
            setFilterSellStatusValueMethod('mail');
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
        setSearchResults([]);

      }catch(error){

        console.log(error);

      }

    };

    const handleClickSearch = () => {

      try{

        let filteredList = [...kioskList];

        if(filterContentTypeValueMethod != 'all') {

          if(filterInfo.length > 0) {

            switch(filterSellStatusValueMethod) {
              case 'address': {
                filteredList = filteredList.filter((user) => 
                  user.address?.includes(filterInfo) && user.lock_type == filterContentTypeValueMethod)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'name': {
                filteredList = filteredList.filter((user) => 
                  user.mb_name?.includes(filterInfo) && user.lock_type == filterContentTypeValueMethod)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'id': {
                filteredList = filteredList.filter((user) => 
                  user.mb_id?.includes(filterInfo) && user.lock_type == filterContentTypeValueMethod)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'mail': {
                filteredList = filteredList.filter((user) => 
                  user.email?.includes(filterInfo) && user.lock_type == filterContentTypeValueMethod)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              default: {
                filteredList = filteredList.filter((user) => 
                  user.lock_type == filterContentTypeValueMethod)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
            
            }
          
          }else{

            filteredList = filteredList.filter((user) => 
              user.lock_type == filterContentTypeValueMethod)
              .map((user, idx) => ({ ...user, id: idx + 1 }));
          
            }

        } else {

          console.log('here2');

          if(filterInfo.length > 0) {

            switch(filterSellStatusValueMethod) {
              case 'address': {
                filteredList = filteredList.filter((user) => 
                  user.address?.includes(filterInfo) )
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'name': {
                filteredList = filteredList.filter((user) => 
                  user.mb_name?.includes(filterInfo) )
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'id': {
                filteredList = filteredList.filter((user) => 
                  user.mb_id?.includes(filterInfo) )
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'mail': {
                filteredList = filteredList.filter((user) => 
                  user.email?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              default: {
                filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
            
            }
          
          }else{

            filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
          
            }
          
        }

        setFilterKioskList(filteredList);
          
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

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewLockInfo({
            address: '',
            mb_name: '',
            mb_id: '',
            email: '',
            unlock_date: '',
            lock_type: '',
            lock_balance: '0'
        });
    };

    const handleSubmit = () => {
        // 유효성 검사
        if (!newLockInfo.address) {
            alert('지갑주소를 입력해주세요.');
            return;
        }

        if (!newLockInfo.lock_type) {
            alert('Lock 타입을 선택해주세요.');
            return;
        }

        if (newLockInfo.lock_type === 'amount_lock' && 
            (!newLockInfo.lock_balance || newLockInfo.lock_balance === '0' || newLockInfo.lock_balance === '')) {
            alert('Lock 금액을 입력해주세요.');
            return;
        }

        if (!newLockInfo.unlock_date) {
            alert('해지 예정일을 선택해주세요.');
            return;
        }

        // API 호출 로직
        handleRegister();
    };

    // 새로운 함수 추가: 버튼 클릭 시 유효성 검사
    const handleButtonClick = () => {
        if (!newLockInfo.address) {
            alert('지갑주소를 입력해주세요.');
            return;
        }

        if (!newLockInfo.lock_type) {
            alert('Lock 타입을 선택해주세요.');
            return;
        }

        if (newLockInfo.lock_type === 'amount_lock' && 
            (!newLockInfo.lock_balance || newLockInfo.lock_balance === '0' || newLockInfo.lock_balance === '')) {
            alert('Lock 금액을 입력해주세요.');
            return;
        }

        if (!newLockInfo.unlock_date) {
            alert('해지 예정일을 선택해주세요.');
            return;
        }

        handleSubmit();
    };

    // 실제 등록 처리 함수
    const handleRegister = async () => {
        
        try {

            setLoading(true);
            
            // 날짜를 MySQL datetime 형식으로 변환
            const date = new Date(newLockInfo.unlock_date);
            const formattedDate = date.getFullYear() + '-' + 
                                String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                                String(date.getDate()).padStart(2, '0') + ' ' + 
                                '00:00:00';
            
            const response = await fetch('/api/manage/lockInfo/register', {

              method: 'POST',
              headers: {
              
                'Content-Type': 'application/json',
              
              },
              
              body: JSON.stringify({ 
                address: newLockInfo.address, 
                memo: '', 
                unlock_date: formattedDate, // MySQL datetime 형식으로 변환된 날짜
                lock_type: newLockInfo.lock_type === 'amount_lock' ? '1' : '0', 
                lock_balance: newLockInfo.lock_type === 'amount_lock' ? newLockInfo.lock_balance : '0' 
              }),
            
            });
      
            const data = await response.json(); 
      
            if (response.ok) {

              handleCloseDialog();
              // 등록 후 목록 새로고침
              get_UserInfo();
              
            } else {
      
              alert(data.message);
            
            }


        } catch (error) {
            console.error('Lock 정보 등록 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 버튼 클릭 핸들러 수정
    const registerButton = (
        <Button 
            variant="outlined" 
            style={{
                backgroundColor:"green", 
                height:"33px",
                color:"white",
                marginRight: "10px"
            }}
            onClick={handleOpenDialog}
        >
            등록
        </Button>
    );

    // 검색 다이얼로그 핸들러
    const handleOpenSearchDialog = () => {
        setOpenSearchDialog(true);
    };

    const handleCloseSearchDialog = () => {
        setOpenSearchDialog(false);
        setSearchKeyword('');
        setSearchResults([]);

        setSearchOption('address')
    };

    // 수기등록 핸들러
    const handleManualInput = () => {
        setIsManualInput(!isManualInput);
        if (!isManualInput) {
            setNewLockInfo({
                ...newLockInfo,
                address: '',
                mb_name: '',
                mb_id: '',
                email: '',
                lock_balance: '0'
            });
        }
    };

    // 검색 다이얼로그 컴포넌트
    const searchDialog = (
            <Dialog 
            open={openSearchDialog} 
            onClose={handleCloseSearchDialog} 
            maxWidth="lg" 
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
                    <SearchIcon sx={{ fontSize: 20 }} />
                        <Typography 
                            component="span"
                            sx={{ 
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                        지갑주소 검색
                        </Typography>
                    </Box>
                </DialogTitle>
            <DialogContent sx={{ p: 2.5 }}>
                    <Box sx={{ 
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        p: 2.5,
                        marginTop:'15px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                        border: '1px solid #eaeaea',
                    }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <FormControl 
                                    size="small"
                                    sx={{ 
                                minWidth: 120,
                                '& .MuiInputBase-root': {
                                            fontSize: '13px',
                                    height: '32px'
                                }
                            }}
                        >
                            <Select
                                value={searchOption}
                                onChange={(e) => setSearchOption(e.target.value)}
                            >
                                <MenuItem value="address" sx={{ fontSize: '13px' }}>지갑주소</MenuItem>
                                <MenuItem value="ownerName" sx={{ fontSize: '13px' }}>이용자명</MenuItem>
                                <MenuItem value="userId" sx={{ fontSize: '13px' }}>이용자ID</MenuItem>
                                <MenuItem value="email" sx={{ fontSize: '13px' }}>연결된 이메일</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            placeholder="키워드를 입력하세요"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            size="small"
                        sx={{
                                '& .MuiInputBase-root': {
                                    fontSize: '13px',
                                    height: '32px'
                                }
                            }}
                            InputProps={{
                                endAdornment: (
                                    searchKeyword && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => {
                                                    setSearchKeyword('');
                                                    setSearchResults([]);
                                                }}
                                                edge="end"
                        size="small"
                                            >
                                                <ClearIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                )
                            }}
                        />
                        <Button 
                            variant="contained" 
                            onClick={() => {
                                if(searchKeyword.length > 0){
                                    handleSearchTargetInfo(searchOption, searchKeyword);
                                }
                            }}
                            startIcon={<SearchIcon sx={{ fontSize: 18 }} />}
                            sx={{ 
                                height: '32px',
                                fontSize: '13px',
                                padding: '0 16px',
                                minWidth: '80px'
                            }}
                        >
                            검색
                        </Button>
                    </Box>
                    <TableContainer 
                        component={Paper}
                        sx={{ 
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px'
                        }}
                    >
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell sx={{ 
                                        fontSize: '13px', 
                                        fontWeight: 600,
                                        color: '#444',
                                        height: '40px',
                                        padding: '0 16px'
                                    }}>
                                        지갑주소
                                    </TableCell>
                                    <TableCell sx={{ 
                                        fontSize: '13px', 
                                        fontWeight: 600,
                                        color: '#444',
                                        height: '40px',
                                        padding: '0 16px',
                                        width: '150px'
                                    }}>
                                        이용자명
                                    </TableCell>
                                    <TableCell sx={{ 
                                        fontSize: '13px', 
                                        fontWeight: 600,
                                        color: '#444',
                                        height: '40px',
                                        padding: '0 16px',
                                        width: '120px'
                                    }}>
                                        이용자ID
                                    </TableCell>
                                    <TableCell sx={{ 
                                        fontSize: '13px', 
                                        fontWeight: 600,
                                        color: '#444',
                                        height: '40px',
                                        padding: '0 16px',
                                        width: '180px'
                                    }}>
                                        이메일
                                    </TableCell>
                                    <TableCell sx={{ 
                                        fontSize: '13px', 
                                        fontWeight: 600,
                                        color: '#444',
                                        height: '40px',
                                        padding: '0 16px',
                                        width: '80px'
                                    }}>
                                        선택
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {searchResults.map((result, index) => (
                                    <TableRow 
                                        key={index}
                                        sx={{
                                            '&:nth-of-type(even)': {
                                                backgroundColor: '#f8f9fa',
                                            },
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ 
                                            fontSize: '13px',
                                            padding: '8px 16px',
                                            color: '#333'
                                        }}>
                                            {result.address}
                                        </TableCell>
                                        <TableCell sx={{ 
                                            fontSize: '13px',
                                            padding: '8px 16px',
                                            color: '#333'
                                        }}>
                                            {result.mb_name}
                                        </TableCell>
                                        <TableCell sx={{ 
                                            fontSize: '13px',
                                            padding: '8px 16px',
                                            color: '#333'
                                        }}>
                                            {result.mb_id}
                                        </TableCell>
                                        <TableCell sx={{ 
                                            fontSize: '13px',
                                            padding: '8px 16px',
                                            color: '#333'
                                        }}>
                                            {result.email}
                                        </TableCell>
                                        <TableCell sx={{ 
                                            padding: '8px 16px'
                                        }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => {
                                                    setNewLockInfo({
                                                        ...newLockInfo,
                                                        address: result.address,
                                                        mb_name: result.mb_name,
                                                        mb_id: result.mb_id,
                                                        email: result.email
                                                    });
                                                    handleCloseSearchDialog();
                                                }}
                                                sx={{ 
                                                    fontSize: '12px',
                                                    minWidth: '60px',
                                                    height: '28px'
                                                }}
                                            >
                                                선택
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </DialogContent>
            <DialogActions 
                sx={{ 
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderTop: '1px solid #eaeaea'
                }}
            >
                <Button 
                    onClick={handleCloseSearchDialog}
                    variant="outlined"
                    startIcon={<CancelIcon sx={{ fontSize: 18 }} />}
                    sx={{ 
                        fontSize: '13px',
                        height: '32px',
                        padding: '0 16px',
                        color: '#666',
                        borderColor: '#ccc',
                        '&:hover': {
                            borderColor: '#999',
                            backgroundColor: '#f5f5f5'
                        }
                    }}
                >
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    );

    // 등록 다이얼로그 컴포넌트 추가
    const registerDialog = (
        <>
            <Dialog 
                open={openDialog} 
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
                        <LockIcon sx={{ fontSize: 20 }} />
                        <Typography 
                            component="span"
                            sx={{ 
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            Lock 설정 등록
                        </Typography>
                    </Box>
                </DialogTitle>
                
                <DialogContent 
                    sx={{ 
                        p: 2.5,
                        flex: '1 1 auto',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Box sx={{ 
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        marginTop:'15px',
                        p: 2.5,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                        border: '1px solid #eaeaea',
                    }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                    <AccountBalanceWalletIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                    <Typography variant="subtitle2" sx={{ 
                                        color: '#444',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                    }}>
                                        지갑주소
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                    <TextField
                                        fullWidth
                                        value={newLockInfo.address}
                                        onChange={(e) => setNewLockInfo({...newLockInfo, address: e.target.value})}
                                        size="small"
                                        disabled={!isManualInput}
                                        sx={{ 
                                            mt: 1,
                                            backgroundColor: !isManualInput ? '#f5f5f5' : 'white',
                                            '& .MuiInputBase-input': {
                                                fontSize: '13px',
                                                padding: '8px 12px',
                                                height: '16px',
                                            },
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                WebkitTextFillColor: '#666666',
                                                fontSize: '13px',
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: isManualInput && newLockInfo.address && (
                                                <InputAdornment position="end">
                                                    <ClearIcon
                                                        onClick={() => setNewLockInfo({ ...newLockInfo, address: '' })}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        size="small" 
                                        onClick={handleOpenSearchDialog}
                                        startIcon={<SearchIcon sx={{ fontSize: 18 }} />}
                                        sx={{ 
                                            height: '32px',
                                            width: '100px',
                                            fontSize: '13px',
                                            padding: '0 16px',
                                            marginTop: '8px',
                                            minHeight: '32px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        검색
                                    </Button>
                                </Box>
                                <Divider sx={{ mt: 2, mb: 1 }} />
                            </Grid>

                            {newLockInfo.address && (
                                <>
                                    <Grid item xs={12}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            gap: 2 
                                        }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                                    <PersonIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                                    <Typography variant="subtitle2" sx={{ 
                                                        color: '#444',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                    }}>
                                                        이용자명
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth
                                                    value={newLockInfo.mb_name}
                                                    size="small"
                                                    disabled
                                                    sx={{ 
                                                        mt: 1,
                                                        backgroundColor: '#f5f5f5',
                                                        '& .MuiInputBase-input.Mui-disabled': {
                                                            WebkitTextFillColor: '#666666',
                                                            fontSize: '13px',
                                                        }
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                                    <BadgeIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                                    <Typography variant="subtitle2" sx={{ 
                                                        color: '#444',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                    }}>
                                                        이용자 ID
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth
                                                    value={newLockInfo.mb_id}
                                                    size="small"
                                                    disabled
                                                    sx={{ 
                                                        mt: 1,
                                                        backgroundColor: '#f5f5f5',
                                                        '& .MuiInputBase-input.Mui-disabled': {
                                                            WebkitTextFillColor: '#666666',
                                                            fontSize: '13px',
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                        <Divider sx={{ mt: 2, mb: 1 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                            <EmailIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                            <Typography variant="subtitle2" sx={{ 
                                                color: '#444',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                            }}>
                                                연결된 이메일
                                            </Typography>
                                        </Box>
                                                <TextField
                                                    fullWidth
                                                    value={newLockInfo.email}
                                                    size="small"
                                                    disabled
                                                    sx={{ 
                                                        mt: 1,
                                                        backgroundColor: '#f5f5f5',
                                                        '& .MuiInputBase-input.Mui-disabled': {
                                                            WebkitTextFillColor: '#666666',
                                                            fontSize: '13px',
                                                        }
                                                    }}
                                                />
                                                <Divider sx={{ mt: 2, mb: 1 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                            <DescriptionIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                            <Typography variant="subtitle2" sx={{ 
                                                color: '#444',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                            }}>
                                                Lock 타입 설정
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <FormControl 
                                                fullWidth
                                                size="small"
                                            >
                                                <Select
                                                    value={newLockInfo.lock_type === '0' ? '지갑' : '금액'}
                                                    onChange={(e) => {
                                                        const newLockType = e.target.value === '지갑' ? '0' : '1';
                                                        const newLockBalance = newLockType === '1' ? 
                                                            (newLockInfo.lock_balance === '') ? '' : newLockInfo.lock_balance : 
                                                            '0';
                                                        
                                                        setNewLockInfo({
                                                            ...newLockInfo,
                                                            lock_type: newLockType,
                                                            //@ts-ignore
                                                            lock_type_text: e.target.value === '지갑' ? '지갑 Lock' : '금액 Lock',
                                                            lock_balance: newLockBalance
                                                        });
                                                    }}
                                                    sx={{ 
                                                        mt: 1,
                                                        backgroundColor: 'white',
                                                        height: '32px',
                                                        '& .MuiInputBase-input': {
                                                            fontSize: '13px',
                                                            padding: '8px 12px',
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="지갑" sx={{ fontSize: '13px' }}>지갑</MenuItem>
                                                    <MenuItem value="금액" sx={{ fontSize: '13px' }}>금액</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Divider sx={{ mt: 2, mb: 1 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                            <EventIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                            <Typography variant="subtitle2" sx={{ 
                                                color: '#444',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                            }}>
                                                해지 예정일
                                            </Typography>
                                        </Box>
                                                <TextField
                                                    fullWidth
                                                    type="date"
                                                    value={newLockInfo.unlock_date}
                                                    onChange={(e) => setNewLockInfo({...newLockInfo, unlock_date: e.target.value})}
                                                    size="small"
                                                    required
                                                    sx={{ 
                                                        mt: 1,
                                                        '& .MuiInputBase-input': {
                                                            fontSize: '13px',
                                                            padding: '8px 12px',
                                                            height: '16px'
                                                        }
                                                    }}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                        <Divider sx={{ mt: 2, mb: 1 }} />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>

                    <Box sx={{ display: 'none', gap: 1, justifyContent: 'flex-end' }}>
                        <Button 
                            variant="contained" 
                            size="small"
                            onClick={handleManualInput}
                            startIcon={<EditIcon />}
                            color={isManualInput ? "secondary" : "primary"}
                            sx={{ 
                            height: '32px',
                            fontSize: '13px',
                                padding: '0 16px'
                            }}
                        >
                            수기등록
                        </Button>
                    </Box>
                </DialogContent>

                <DialogActions 
                    sx={{ 
                        p: 2,
                        backgroundColor: '#f8f9fa',
                        borderTop: '1px solid #eaeaea',
                        gap: 1
                    }}
                >
                    <Button 
                        onClick={handleCloseDialog} 
                        variant="outlined" 
                        startIcon={<CancelIcon sx={{ fontSize: 18 }} />}
                        sx={{ 
                            fontSize: '13px',
                            height: '32px',
                            padding: '0 16px',
                            color: '#666',
                            borderColor: '#ccc',
                            '&:hover': {
                                borderColor: '#999',
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        취소
                    </Button>
                    <Button 
                        onClick={handleButtonClick}
                        variant="contained" 
                        startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
                        sx={{ 
                            fontSize: '13px',
                            height: '32px',
                            padding: '0 16px',
                            backgroundColor: '#1976d2',
                            '&:hover': {
                                backgroundColor: '#1565c0'
                            }
                        }}
                    >
                        등록
                    </Button>
                </DialogActions>
            </Dialog>
            {searchDialog}
        </>
    );

    // 관리 다이얼로그 열기 핸들러
    const handleOpenManageDialog = (content) => {
        try {
            console.log('content', content);
            setSelectedContent({
                ...selectedContent,
                ...content,
                address: content?.address || '',
                mb_name: content?.mb_name || '',
                mb_id: content?.mb_id || '',
                email: content?.email || '',
                unlock_date: content?.unlock_date || '',
                lock_type: content?.lock_type || '0',
                lock_type_text: content?.lock_type_text || '',
                lock_balance: content?.lock_balance || '0'
            });
            setOpenManageDialog(true);
        } catch (error) {
            console.error('관리 다이얼로그 열기 중 오류 발생:', error);
            alert('관리 다이얼로그 열기 중 오류가 발생했습니다.');
        }
    };

    // 관리 다이얼로그 닫기 핸들러
    const handleCloseManageDialog = () => {
        setOpenManageDialog(false);
    };

    const handleEdit = async () => {
        try {
            // 날짜가 유효한지 확인
            //@ts-ignore
            if (!selectedContent.unlock_date) {
                alert('유효한 날짜를 선택해주세요.');
                return;
            }

            // 날짜 변환 시 안전하게 처리
            //@ts-ignore
            const date = new Date(selectedContent.unlock_date);
            if (isNaN(date.getTime())) {
                alert('유효하지 않은 날짜 형식입니다.');
                return;
            }

            // 오늘 날짜와 비교
            const today = new Date();
            today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정하여 날짜만 비교

            if (date < today) {
                alert('해지 예정일은 오늘 날짜보다 이후여야 합니다.');
                return;
            }

            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} 00:00:00`;

            const response = await fetch('/api/manage/lockInfo/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                //@ts-ignore
                body: JSON.stringify({
                    //@ts-ignore
                    idx: selectedContent.idx,
                    unlock_date: formattedDate,
                    lock_type: selectedContent.lock_type,
                    lock_balance: selectedContent.lock_type === '1' ? (selectedContent.lock_balance || '0') : '0'
                }),
            });

            if (response.ok) {
                alert('Lock 정보가 수정되었습니다.');
                handleCloseManageDialog();
                get_UserInfo(); // 목록 새로고침
            } else {
                alert('Lock 정보 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('수정 중 오류 발생:', error);
            alert('수정 중 오류가 발생했습니다.');
        }
    };

    // 핸들러 함수들을 먼저 정의
    const handleCloseConfirmDialog = React.useCallback(() => {
        setOpenConfirmDialog(false);
    }, []);


    const handleDelete = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('/api/manage/lockInfo/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    //@ts-ignore
                    idx: selectedContent.idx 
                }),
            });

            if (response.ok) {
                alert('Lock이 해제되었습니다.');
                handleCloseManageDialog();
                get_UserInfo(); // 목록 새로고침
            } else {
                alert('Lock 해제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Lock 해제 중 오류 발생:', error);
            alert('Lock 해제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 관리 다이얼로그 컴포넌트 추가
    const manageDialog = (
        <Dialog 
            open={openManageDialog} 
            onClose={handleCloseManageDialog} 
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
                    <LockIcon sx={{ fontSize: 20 }} />
                    <Typography 
                        component="span"
                        sx={{ 
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Lock 대상 정보
                </Typography>
                </Box>
            </DialogTitle>
            <DialogContent 
                        sx={{
                    p: 2.5,
                    flex: '1 1 auto',
                    overflow: 'hidden',
                                display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <Box sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    marginTop:'15px',
                    p: 2.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <AccountBalanceWalletIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    지갑주소
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                //@ts-ignore
                                value={selectedContent?.address}
                                size="small"
                                disabled
                        sx={{
                                    mt: 1,
                                    backgroundColor: '#f5f5f5',
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: '#666666',
                                        fontSize: '13px',
                                    }
                                }}
                            />
                            <Divider sx={{ mt: 2, mb: 1 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2 
                            }}>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                        <PersonIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                        <Typography variant="subtitle2" sx={{ 
                                            color: '#444',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                        }}>
                                            이용자명
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        //@ts-ignore
                                        value={selectedContent?.mb_name}
                                        size="small"
                                        disabled
                                        sx={{ 
                                            mt: 1,
                                            backgroundColor: '#f5f5f5',
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                WebkitTextFillColor: '#666666',
                                                fontSize: '13px',
                                            }
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                        <BadgeIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                        <Typography variant="subtitle2" sx={{ 
                                            color: '#444',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                        }}>
                                            이용자 ID
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        //@ts-ignore
                                        value={selectedContent?.mb_id}
                                        size="small"
                                        disabled
                                        sx={{
                                            mt: 1,
                                            backgroundColor: '#f5f5f5',
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                WebkitTextFillColor: '#666666',
                                                fontSize: '13px',
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Divider sx={{ mt: 2, mb: 1 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <EmailIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    연결된 이메일
                      </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                //@ts-ignore
                                value={selectedContent?.email}
                                size="small"
                                disabled
                                sx={{ 
                                    mt: 1,
                                    backgroundColor: '#f5f5f5',
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: '#666666',
                                        fontSize: '13px',
                                    }
                                }}
                            />
                            <Divider sx={{ mt: 2, mb: 1 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <EventIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    해지 예정일
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                //@ts-ignore
                                value={selectedContent?.unlock_date?.substring(0, 10) || ''}
                                size="small"
                                type="date"
                                onChange={(e) => setSelectedContent({
                                    ...selectedContent,
                                    //@ts-ignore
                                    unlock_date: e.target.value
                                })}
                                sx={{ 
                                    mt: 1,
                                    backgroundColor: 'white',
                                    '& .MuiInputBase-input': {
                                        fontSize: '13px',
                                        padding: '8px 12px',
                                        height: '16px',
                                        color: '#666666'
                                    }
                                }}
                            />
                            <Divider sx={{ mt: 2, mb: 1 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2 
                            }}>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                        <DescriptionIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                        <Typography variant="subtitle2" sx={{ 
                                            color: '#444',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                        }}>
                                            Lock 타입
                                        </Typography>
                                    </Box>
                                    <FormControl 
                                        fullWidth
                                        size="small"
                                    >
                                        <Select
                                            //@ts-ignore
                                            value={selectedContent?.lock_type === '0' ? '지갑' : '금액'}
                                            onChange={(e) => {
                                                const newLockType = e.target.value === '지갑' ? '0' : '1';
                                                setSelectedContent({
                                                    ...selectedContent,
                                                    //@ts-ignore
                                                    lock_type: newLockType,
                                                    //@ts-ignore
                                                    lock_type_text: e.target.value === '지갑' ? '지갑 Lock' : '금액 Lock',
                                                    //@ts-ignore
                                                    lock_balance: newLockType === '1' ? (selectedContent?.lock_balance || '') : '0'
                                                });
                                            }}
                                            sx={{ 
                                                mt: 1,
                                                backgroundColor: 'white',
                                                height: '32px',
                                                '& .MuiInputBase-input': {
                                                    fontSize: '13px',
                                                    padding: '8px 12px',
                                                }
                                            }}
                                        >
                                            <MenuItem value="지갑" sx={{ fontSize: '13px' }}>지갑</MenuItem>
                                            <MenuItem value="금액" sx={{ fontSize: '13px' }}>금액</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                {
                                //@ts-ignore
                                selectedContent.lock_type === '1' && (
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                            <AccountBalanceWalletIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                            <Typography variant="subtitle2" sx={{ 
                                                color: '#444',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                            }}>
                                                설정 금액
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            //@ts-ignore
                                            value={selectedContent.lock_type === '1' ? (selectedContent?.lock_balance || '') : ''}
                                            size="small"
                                            type="number"
                                            onChange={(e) => setSelectedContent({
                                                ...selectedContent,
                                                //@ts-ignore
                                                lock_balance: e.target.value
                                            })}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">PTH</InputAdornment>,
                                                sx: {
                                                    height: '32px'
                                                }
                                            }}
                                            sx={{ 
                                                mt: 1,
                                                backgroundColor: 'white',
                                                '& .MuiInputBase-input': {
                                                    fontSize: '13px',
                                                    padding: '8px 12px',
                                                    height: '16px',
                                                    color: '#666666'
                                                },
                                                '& .MuiInputAdornment-root': {
                                                    '& .MuiTypography-root': {
                                                        fontSize: '13px',
                                                        color: '#666666'
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                            <Divider sx={{ mt: 2, mb: 1 }} />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions 
                sx={{ 
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderTop: '1px solid #eaeaea',
                    gap: 1,
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                <Button 
                    onClick={handleDelete}
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon sx={{ fontSize: 18 }} />}
                    sx={{ 
                        fontSize: '13px',
                        height: '32px',
                        padding: '0 16px'
                    }}
                >
                    Lock 해제
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                        onClick={handleCloseManageDialog}
                        variant="outlined" 
                        startIcon={<CancelIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            fontSize: '13px',
                            height: '32px',
                            padding: '0 16px',
                            color: '#666',
                            borderColor: '#ccc',
                            '&:hover': {
                                borderColor: '#999',
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        닫기
                    </Button>
                    <Button 
                        onClick={handleEdit}
                        variant="contained" 
                        startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                        sx={{ 
                            fontSize: '13px',
                            height: '32px',
                            padding: '0 16px'
                        }}
                    >
                        수정
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );

    // 확인 다이얼로그 컴포넌트
    const confirmDialog = (
        <Dialog
            open={openConfirmDialog}
            onClose={handleCloseConfirmDialog}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle sx={{ 
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #eaeaea',
                p: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockIcon sx={{ color: '#dc3545', fontSize: 20 }} />
                    <Typography sx={{ 
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#444'
                    }}>
                        Lock 해제 확인
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: '14px', color: '#444' }}>
                    정말 Lock을 해제하시겠습니까?
                </Typography>
                <Box sx={{ mt: 2, color: '#666', fontSize: '13px' }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />
                        {/* @ts-ignore */}
                        지갑주소: {selectedContent.address}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <LockIcon sx={{ fontSize: 16 }} />
                        {/* @ts-ignore */}
                        Lock 타입: {selectedContent.lock_type_text}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ 
                p: 2,
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #eaeaea',
                gap: 1
            }}>
                <Button
                    onClick={handleCloseConfirmDialog}
                    variant="outlined"
                    sx={{ 
                        fontSize: '13px',
                        height: '32px',
                        color: '#666',
                        borderColor: '#ccc',
                        '&:hover': {
                            borderColor: '#999',
                            backgroundColor: '#f5f5f5'
                        }
                    }}
                >
                    취소
                </Button>
                <Button
                    onClick={handleDelete}
                    variant="contained"
                    color="error"
                    sx={{ 
                        fontSize: '13px',
                        height: '32px'
                    }}
                >
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    );

    const handleSearchTargetInfo = async (filterInfo, keyword) => {

      if (!keyword) { // 키워드가 없을 경우 검색 결과 초기화
        setSearchResults([]); // 검색 결과 초기화
        return;
      }

      try{

        const response = await fetch('/api/manage/lockInfo/findTargetInfo', {

          method: 'POST',
          body: JSON.stringify({ filterInfo, keyword })

        });

        const data = await response.json();

        setSearchResults(data.result_data); // 데이터 매핑

        console.log(data);

      }catch(error){

        console.error('Error:', error);
      }

    };

    return (

      <div style={{
        display:'flex', 
        flexDirection:'column',  
        width:'100%', 
        height:'100vh',  
        paddingLeft:'20px', 
        paddingRight:'20px'
      }}>

        <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

            <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

        </div>

        <div style={{}}>
            <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
                Lock 설정
            </Typography>
        </div>

        <div style={{ marginTop: '5px' }}>

            <Grid container spacing={2}>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>

                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          총 대상 수
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                          {filterKioskList.length.toLocaleString()}
                        </Typography>
                        
                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>

                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          회사정책
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                          {filterKioskList.filter(user => user.lock_type === '1').length.toLocaleString()}
                        </Typography>

                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>
                        
                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                            기타
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                            {filterKioskList.filter(user => user.lock_type === '0').length.toLocaleString()}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>
                        
                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                            해킹
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                            {filterKioskList.filter(user => user.lock_type === '2').length.toLocaleString()}
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
          alignItems:'center'
        }}>
            
            <div style={{display:"flex", float:"left"}}>
                <FormControl fullWidth sx={{ 
                    width: "175px", 
                    marginTop: "0px", 
                    marginLeft: "8px",
                    '& .MuiOutlinedInput-root': {
                        height: '33px',
                        backgroundColor: 'white'
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '14px'
                    }
                }}
                >
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
                        <MenuItem style={{fontSize:14}} value={20}>회사정책</MenuItem>
                        <MenuItem style={{fontSize:14}} value={30}>기타</MenuItem>
                        <MenuItem style={{fontSize:14}} value={40}>해킹</MenuItem>
                    </Select>
                </FormControl>
            </div>

            <div style={{display:"flex", float:"left", marginLeft:"auto", width:"100%"}}>
                <FormControl fullWidth sx={{ 
                    width: "110px", 
                    marginTop: "0px", 
                    marginLeft: "auto",
                    '& .MuiOutlinedInput-root': {
                        height: '33px',
                        backgroundColor: 'white'
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '14px'
                    }
                }}
                >
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
                        value={filterSellStatusMethod}
                        size="small"
                        onChange={handleChangeFilterSellStatus}
                    >
                        <MenuItem style={{fontSize:14}} value={10}>전체</MenuItem>
                        <MenuItem style={{fontSize:14}} value={20}>지갑주소</MenuItem>
                        <MenuItem style={{fontSize:14}} value={30}>이용자명</MenuItem>
                        <MenuItem style={{fontSize:14}} value={40}>이용자ID</MenuItem>
                        <MenuItem style={{fontSize:14}} value={50}>연결된 메일</MenuItem>
                    </Select>
                </FormControl>

                <Button 
                    variant="contained" 
                    style={{
                      color:"white", 
                      backgroundColor:"#1f1f26", 
                      borderColor:"#CBCBCB",
                      height:"33px",
                      marginLeft:"5px",
                      marginRight:"5px",
                      fontSize: '14px'
                    }}  
                    onClick={handleClickSearch}
                >
                    검색
                </Button>

                {registerButton}
            </div>
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
            '& .MuiDataGrid-columnHeaders': {
              width: '100%',
              minWidth: '100%',
            },
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
                onClose={toggleDrawer('bottom', false)}
                style={{ fontSize: '16px' }}
            >
                <div style={{ padding: '20px' }}>
                    <h2 style={{ fontSize: '1.5em' }}>검색</h2>
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
                </div>
            </Drawer>
        
        </React.Fragment>

        {registerDialog}

        {manageDialog}
        {confirmDialog}

        <Backdrop
            sx={{ color: '#fff',  display: 'flex', flexDirection: 'column', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
        >
            <CircularProgress color="inherit" />
            <Typography sx={{ color: 'white', mt: 2 }}>
                  Lock 대상 정보를 불러오는 중입니다.
              </Typography>
        </Backdrop>

      </div>
    );

  }
