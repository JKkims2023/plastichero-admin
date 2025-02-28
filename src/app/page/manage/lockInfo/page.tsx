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
    const [openDialog, setOpenDialog] = React.useState(false);
    const [newLockInfo, setNewLockInfo] = React.useState({
        address: '',
        mb_name: '',
        mb_id: '',
        email: '',
        unlock_date: '',
        lock_reason: ''
    });

    const [openSearchDialog, setOpenSearchDialog] = React.useState(false);
    const [isManualInput, setIsManualInput] = React.useState(false);
    const [searchKeyword, setSearchKeyword] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [blockMemo, setBlockMemo] = React.useState('');

    const [loading, setLoading] = React.useState(false);

    const [openManageDialog, setOpenManageDialog] = React.useState(false);

    const [searchOption, setSearchOption] = React.useState('address'); // 기본 검색 옵션 설정

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
            lock_reason: ''
        });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            // TODO: API 호출하여 새로운 Lock 정보 등록
            console.log('새로운 Lock 정보:', newLockInfo);
            handleCloseDialog();
            // 등록 후 목록 새로고침
            await get_UserInfo();
        } catch (error) {
            console.error('Lock 정보 등록 실패:', error);
        } finally{
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
                email: ''
            });
        }
    };

    // 검색 다이얼로그 컴포넌트
    const searchDialog = (
        <Dialog open={openSearchDialog} onClose={handleCloseSearchDialog} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                지갑주소 검색
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={searchOption}
                            onChange={(e) => setSearchOption(e.target.value)}
                        >
                            <MenuItem value="address">지갑주소</MenuItem>
                            <MenuItem value="ownerName">이용자명</MenuItem>
                            <MenuItem value="userId">이용자ID</MenuItem>
                            <MenuItem value="email">연결된 이메일</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="키워드를 입력하세요"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        size="small"
                        InputProps={{
                            endAdornment: (
                                searchKeyword && (
                                    <InputAdornment position="end">
                                        <ClearIcon
                                            onClick={() => {
                                              setSearchKeyword('');
                                              setSearchResults([]);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </InputAdornment>
                                )
                            )
                        }}
                    />
                    <Button 
                        variant="contained" 
                        onClick={() => {
                            // TODO: 실제 검색 API 호출
                            console.log('검색:', searchKeyword, '옵션:', searchOption);

                            if(searchKeyword.length > 0){
                              handleSearchTargetInfo(searchOption, searchKeyword);
                            }
                        }}
                    >
                        검색
                    </Button>
                </Box>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontSize: '14px', whiteSpace: 'normal', lineHeight: '1.2', maxWidth: '200px', height: '48px', padding: '0 16px' }}>지갑주소</TableCell>
                                <TableCell style={{ fontSize: '14px', height: '48px', padding: '0 16px', width: '150px' }}>이용자명명</TableCell>
                                <TableCell style={{ fontSize: '14px', height: '48px', padding: '0 16px', width: '100px' }}>이용자ID</TableCell>
                                <TableCell style={{ fontSize: '14px', height: '48px', padding: '0 16px', width: '150px' }}>이메일</TableCell>
                                <TableCell style={{ fontSize: '14px', height: '48px', padding: '0 16px', width: '80px' }}>선택</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {searchResults.map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell style={{ fontSize: '14px', whiteSpace: 'normal', lineHeight: '1.2', maxWidth: '200px' }}>{result.address}</TableCell>
                                    <TableCell style={{ fontSize: '14px' }}>{result.mb_name}</TableCell>
                                    <TableCell style={{ fontSize: '14px' }}>{result.mb_id}</TableCell>
                                    <TableCell style={{ fontSize: '14px' }}>{result.email}</TableCell>
                                    <TableCell>
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
                                            style={{ fontSize: '12px' }}
                                        >
                                            선택
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseSearchDialog}>닫기</Button>
            </DialogActions>
        </Dialog>
    );

    // 등록 다이얼로그 컴포넌트 추가
    const registerDialog = (
        <>
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                    Lock 설정 등록
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                fullWidth
                                label="지갑주소"
                                value={newLockInfo.address}
                                onChange={(e) => {
                                    setNewLockInfo({...newLockInfo, address: e.target.value});
                                }}
                                margin="normal"
                                size="small"
                                disabled={!isManualInput}
                                sx={{ 
                                    backgroundColor: !isManualInput ? '#f5f5f5' : 'white',
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: '#666666',
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        isManualInput && newLockInfo.address && (
                                            <InputAdornment position="end">
                                                <ClearIcon
                                                    onClick={() => setNewLockInfo({ ...newLockInfo, address: '' })}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </InputAdornment>
                                        )
                                    )
                                }}
                            />
                            {newLockInfo.address && ( // 지갑주소가 입력된 경우에만 나머지 항목 보이기
                                <>
                                    <TextField
                                        fullWidth
                                        label="이용자명명"
                                        value={newLockInfo.mb_name}
                                        margin="normal"
                                        size="small"
                                        disabled
                                        sx={{ 
                                            backgroundColor: '#f5f5f5',
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                WebkitTextFillColor: '#666666',
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="이용자 ID"
                                        value={newLockInfo.mb_id}
                                        margin="normal"
                                        size="small"
                                        disabled
                                        sx={{ 
                                            backgroundColor: '#f5f5f5',
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                WebkitTextFillColor: '#666666',
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="연결된 이메일"
                                        value={newLockInfo.email}
                                        margin="normal"
                                        size="small"
                                        disabled
                                        sx={{ 
                                            backgroundColor: '#f5f5f5',
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                WebkitTextFillColor: '#666666',
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Lock 사유"
                                        value={newLockInfo.lock_reason}
                                        onChange={(e) => setNewLockInfo({...newLockInfo, lock_reason: e.target.value})}
                                        margin="normal"
                                        size="small"
                                        multiline
                                        rows={3}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="해지 예정일"
                                        type="date"
                                        value={newLockInfo.unlock_date}
                                        onChange={(e) => setNewLockInfo({...newLockInfo, unlock_date: e.target.value})}
                                        margin="normal"
                                        size="small"
                                        required
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </>
                            )}
                        </Box>
                        <Box sx={{ mt: '16px' }}>
                            <Button 
                                variant="contained" 
                                size="small" 
                                onClick={handleOpenSearchDialog}
                                sx={{ 
                                    mr: 1,
                                    height: '33px',
                                    minWidth: '60px',
                                    padding: '0px 10px',
                                    fontSize: '13px'
                                }}
                            >
                                검색
                            </Button>
                            <Button 
                                variant="contained" 
                                size="small"
                                onClick={handleManualInput}
                                color={isManualInput ? "secondary" : "primary"}
                                sx={{ 
                                    height: '33px',
                                    minWidth: '80px',
                                    padding: '0px 10px',
                                    fontSize: '13px'
                                }}
                            >
                                수기등록
                            </Button>
                        </Box>
                    </Box>
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        취소
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        color="primary" 
                        variant="contained"
                        disabled={!newLockInfo.address}
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
        setSelectedContent(content);
        setOpenManageDialog(true);
    };

    // 관리 다이얼로그 닫기 핸들러
    const handleCloseManageDialog = () => {
        setOpenManageDialog(false);
    };

    const handleEdit = () => {
        console.log('수정');
    };

    const handleDelete = () => {
        console.log('삭제');
    };

    // 관리 다이얼로그 컴포넌트 추가
    const manageDialog = (
        <Dialog open={openManageDialog} onClose={handleCloseManageDialog} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontSize: '18px', fontWeight: 'bold', padding: '16px' }}>
                Lock 대상 정보
            </DialogTitle>
            <DialogContent sx={{ padding: '16px' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>지갑주소:</Typography>
                        {/* @ts-ignore */}
                        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>{selectedContent.address}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>이용자명:</Typography>
                        {/* @ts-ignore */}
                        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>{selectedContent.mb_name}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>이용자ID:</Typography>
                        {/* @ts-ignore */}
                        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>{selectedContent.mb_id}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>연결된 이메일:</Typography>
                        {/* @ts-ignore */}
                        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>{selectedContent.email}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>해지 예정일:</Typography>
                        {/* @ts-ignore */}
                        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>{selectedContent.unlock_date}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>등록일시:</Typography>
                        {/* @ts-ignore */}
                        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>{selectedContent.reg_date}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="메모"
                            value={blockMemo}
                            onChange={(e) => setBlockMemo(e.target.value)}
                            margin="normal"
                            size="small"
                            multiline
                            rows={3}
                            sx={{ marginTop: '8px' }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ padding: '16px' }}>

                <Button 
                    onClick={handleCloseManageDialog} 
                    color="primary" 
                    variant="contained"
                    sx={{ width: '100px', marginLeft:'auto' }}
                >
                    닫기
                </Button>
                <Button 
                    onClick={handleEdit} 
                    color="primary" 
                    variant="contained" 
                    sx={{ width: '100px', marginLeft: 'auto' }}
                >
                    수정
                </Button>
                <Button 
                    onClick={handleDelete} 
                    color="primary" 
                    variant="contained"
                    sx={{ width: '100px', marginLeft: '0px', marginRight: '0px' }}
                >
                    삭제
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

      <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

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
          alignItems:'center',
          
          }}>
            
            <div style={{display:"flex", float:"left"}}>

              <FormControl fullWidth  style={{ width:"175px",marginTop:"0px", marginLeft:"8px", backgroundColor:'white', color:'black'}}>
                  <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  style={{color:'black'}}
                  value={filterContentTypeMethod}
                  size="small"
                  onChange={handleChangeFilterContentType}
                  >
                  <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                  <MenuItem style={{fontSize:13}} value={20}>회사정책</MenuItem>
                  <MenuItem style={{fontSize:13}} value={30}>기타</MenuItem>
                  <MenuItem style={{fontSize:13}} value={40}>해킹</MenuItem>
                  </Select>
              </FormControl>

            </div>


            <div style={{display:"flex", float:"left", marginLeft:"auto", width:"100%"}}>

              <FormControl fullWidth  style={{ width:"110px",marginTop:"0px", marginLeft:"auto", backgroundColor:'white', color:'black'}}>
                  <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  style={{color:'black'}}
                  value={filterSellStatusMethod}
                  size="small"
                  onChange={handleChangeFilterSellStatus}
                  >
                  <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                  <MenuItem style={{fontSize:13}} value={20}>지갑주소</MenuItem>
                  <MenuItem style={{fontSize:13}} value={30}>이용자명</MenuItem>
                  <MenuItem style={{fontSize:13}} value={40}>이용자ID</MenuItem>
                  <MenuItem style={{fontSize:13}} value={50}>연결된 메일</MenuItem>
                  </Select>
              </FormControl>
            </div>

            <Box
              component="form"
              marginLeft="5px"
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

            <Button id="keyBtns" variant="outlined" style={{color:"white",backgroundColor:"#1f1f26", borderColor:"#CBCBCB" ,height:"33px" , marginRight:"5px"}}  onClick={handleClickSearch}>
              검색
            </Button>

            {registerButton}

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
