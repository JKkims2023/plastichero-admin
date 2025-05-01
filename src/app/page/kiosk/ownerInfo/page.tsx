'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
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
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Paper from '@mui/material/Paper';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [pagingIdx, setPaginIdx] = React.useState('0');
    const [filterInfo, setFilterInfo] = React.useState('');
    const [kioskList, setKioskList] = React.useState([]);
    const [filterKioskList, setFilterKioskList] = React.useState([]);


    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('all');
    const [filterSellStatusMethod, setFilterSellStatusMethod] = React.useState(10);
    const [filterSellStatusValueMethod, setFilterSellStatusValueMethod] = React.useState('all');
    const [stateBottom, setStateBottom] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [infoManagerID, setInfoManagerID] = React.useState('');
    const [infoOwnerID, setInfoOwnerID] = React.useState('');
    const [infoOwnerIdx, setInfoOwnerIdx] = React.useState(-1);
    const [infoSellStatus, setInfoSellStatus] = React.useState('0');
    const [finalInfoAddress, setFinalInfoAddress] = React.useState('');
    const [finalInfoAddressIdx, setFinalInfoAddressIdx] = React.useState(-1);
    const [targetKioskID, setTargetKioskID] = React.useState(-1);
    const [infoOwnerList, setInfoOwnerList] = React.useState([]);
    const [infoMatchAddress, setInfoMatchAddress] = React.useState('');
    const [filterInfoOwnerList, setFilterInfoOwnerList] = React.useState([]);
    const [openType, setOpenType] = React.useState('register');
    const [walletList, setWalletList] = React.useState([]);
    const [walletDialogOpen, setWalletDialogOpen] = React.useState(false);
    const [selectedOwnerInfo, setSelectedOwnerInfo] = React.useState(null);
    const [selectedWalletIdx, setSelectedWalletIdx] = React.useState(-1);

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
          field: 'sell_status_text',
          headerName: '상태',
          type: 'string',
          flex: 1.2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'match_address',
          headerName: '마이그레이션',
          type: 'string',
          flex: 0.8,
          disableColumnMenu: true,
          editable: false,
          renderCell: (params) => {
              const isCompleted = params.row.match_address || params.row.match_address === '';
              return (
                  <div style={{ 
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '13px',
                      color: isCompleted ? 'blue' : 'red'
                  }}>
                      {isCompleted ? '완료' : '미완료'}
                  </div>
              );
          }
      },
      {
          field: 'kc_kiosk_id',
          headerName: '키오스크ID',
          type: 'string',
          flex: 1.3,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'kc_addr',
          headerName: '배치장소',
          type: 'string',
          flex: 3,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'mb_name',
          headerName: '소유자명',
          type: 'string',
          flex: 0.5,
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
        flex: 0.5,
        disableColumnMenu: true,
        renderCell: (params) => {
          
            const isSellStatusZero = params.row.sell_status === '0';
            const handleButtonClick = (event) => {
                
                event.stopPropagation();
                
                
                // 다이얼로그 열기
                if (isSellStatusZero) {
                    
                    // 등록 다이얼로그 열기
                    setOpenType('register');

                
                } else {

                    // 수정 다이얼로그 열기
                    setOpenType('edit');

                }

                console.log(params.row);

                setInfoManagerID(params.row.manager_mail || '');
                setInfoOwnerID(params.row.owner_id || '');
                setInfoOwnerIdx(params.row.owner_key || -1);
                setInfoSellStatus(params.row.sell_status || '0');
                setFinalInfoAddress(params.row.match_address || '');
                setFinalInfoAddressIdx(params.row.wallet_idx || -1);
                setSelectedWalletIdx(params.row.wallet_idx || -1);
                setTargetKioskID(params.row.kc_no || -1);                

                setEditDialogOpen(true);
            };

            return (
                <Button
                    variant="contained"
                    size="small"
                    sx={{ 
                        fontSize: '12px', 
                        backgroundColor: isSellStatusZero ? 'green' : 'gray',
                        color: 'white'
                    }}
                    onClick={handleButtonClick}
                >
                    {isSellStatusZero ? '등록' : '수정'}
                </Button>
            );
        },
      },
    ];

    // 디바운스 함수 - 모든 디바운싱에 사용
    const debounce = useCallback((callback: Function, delay: number = 300) => {
        
        try{
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
            callback();
            }, delay);
        } catch(error) {
            console.log(error);
        }
    }, []);

    // useEffect 훅들
    useEffect(() => {
        try {
            if (ref_Div.current) {
                const offsetHeight = ref_Div.current.offsetHeight;
                const offsetWidth = ref_Div.current.offsetWidth;
                
                console.log('Height:', offsetHeight, 'Width:', offsetWidth);

                ref_Grid.current = offsetHeight - 0;

                get_UserInfo();
            }
        } catch(error) {
            console.error('Error getting dimensions:', error);
        }
    }, []);

    useEffect(() => {
        // kioskList useEffect
    }, [kioskList]);

    useEffect(() => {
        // filterKioskList useEffect
    }, [filterKioskList]);

    useEffect(() => {
        console.log('infoSellStatus : ' + infoSellStatus);
    }, [infoSellStatus]);

    // API 호출 함수
    const get_UserInfo = async() => {
        setLoading(true);

        try {
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
                setInfoOwnerList(data.result_node_member_data.map((data, idx) => ({ id: idx + 1, ...data })));
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // 지갑 정보 조회 함수
    const get_WalletInfo = async(user_idx) => {
        try {
            const response = await fetch('/api/kiosk/walletInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_idx }),
            });

            const data = await response.json();

            if (response.ok) {
                setWalletList(data.result_data);
                if (data.result_data && data.result_data.length > 0) {
                    setWalletDialogOpen(true);
                } else {
                    alert('해당 사용자의 지갑 정보가 존재하지 않습니다.');
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert('지갑 정보 조회 중 오류가 발생했습니다.');
        }
    };

    // 소유자 정보 필터링 함수
    const get_FilterTargetInfo = async(keyword) => {
        try {

          console.log('keyword : ' + keyword);
            const response = await fetch('/api/kiosk/filterList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filterInfo: keyword }),
            });

            const data = await response.json();

            if (response.ok) {

              setFilterInfoOwnerList(data.result_node_member_data.map((data, idx) => ({ id: idx + 1, ...data })));

            } else {

              setFilterInfoOwnerList([]);

            }
        } catch (error) {
            console.log(error);
            alert('지갑 정보 조회 중 오류가 발생했습니다.');
        }
    };

    // 필터 변경 핸들러
    const handleChangeFilterContentType = (event: SelectChangeEvent<number>) => {
        try {
            setFilterContentTypeMethod(Number(event.target.value)); 

            switch(event.target.value) {
                case 10: {
                    setFilterContentTypeValueMethod('all');
                } break;
                case 20: {
                    setFilterContentTypeValueMethod('id');
                } break;
                case 30: {
                    setFilterContentTypeValueMethod('location');
                } break;
                case 40: {
                    setFilterContentTypeValueMethod('owner');
                } break;
                case 50: {
                    setFilterContentTypeValueMethod('name');
                } break;
                default: { 
                    setFilterContentTypeValueMethod('all');
                } break;
            }
        } catch(error) {
            console.log(error);
        }
    };

    const handleChangeFilterSellStatus = (event: SelectChangeEvent<number>) => {
        try {
            setFilterSellStatusMethod(Number(event.target.value));

            switch(event.target.value) {
                case 10: {
                    setFilterSellStatusValueMethod('all');
                } break;
                case 20: {
                    setFilterSellStatusValueMethod('0 ');
                } break;
                case 30: {
                    setFilterSellStatusValueMethod('1');
                } break;
                case 40: {
                    setFilterSellStatusValueMethod('2');
                } break;
                case 50: {
                    setFilterSellStatusValueMethod('3');
                } break;
                default: {
                    setFilterSellStatusValueMethod('all');
                } break;
            }
        } catch(error) {
            console.log(error);
        }
    };

    // 검색어 삭제 핸들러 - 디바운싱 적용
    const handleClickDeleteKeyword = useCallback(() => {
        setFilterInfo('');
        // 삭제 후 바로 검색 실행
        debounce(() => {
            let filteredList = [...kioskList];
            // 빈 필터로 검색 실행
            if(filterSellStatusValueMethod !== 'all') {
                const normalizedStatus = filterSellStatusValueMethod.trim();
                filteredList = filteredList.filter((user) => 
                    user.sell_status?.toString() == normalizedStatus.toString())
                    .map((user, idx) => ({ ...user, id: idx + 1 }));
            }
            setFilterKioskList(filteredList);
        }, 150);
    }, [kioskList, filterSellStatusValueMethod, debounce]);

    // 필터 정보 변경 핸들러 - 직접 상태 업데이트
    const handleFilterInfoChange = useCallback((value: string) => {
        setFilterInfo(value);
    }, []);

    // 검색 버튼 클릭 핸들러 - 디바운싱 적용
    const handleClickSearch = useCallback(() => {
        try {
            debounce(() => {
                let filteredList = [...kioskList];

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

                    console.log('normalizedStatus : ' + normalizedStatus);
                    
                    if(filterInfo.length > 0) {
                        switch(filterContentTypeValueMethod) {
                            case 'id': {
                                filteredList = filteredList.filter((user) => 
                                    user.kc_kiosk_id?.includes(filterInfo) && 
                                    user.sell_status?.toString() == normalizedStatus.toString())
                                    .map((user, idx) => ({ ...user, id: idx + 1 }));
                            } break;
                            case 'location': {
                                filteredList = filteredList.filter((user) => 
                                    user.kc_addr?.includes(filterInfo) && 
                                    user.sell_status?.toString() == normalizedStatus.toString())
                                    .map((user, idx) => ({ ...user, id: idx + 1 }));
                            } break;
                            case 'owner': {
                                filteredList = filteredList.filter((user) => 
                                    user.owner_id?.includes(filterInfo) && 
                                    user.sell_status?.toString() == normalizedStatus.toString())
                                    .map((user, idx) => ({ ...user, id: idx + 1 }));
                            } break;
                            case 'name': {
                                filteredList = filteredList.filter((user) => 
                                    user.mb_name?.includes(filterInfo) && 
                                    user.sell_status?.toString() == normalizedStatus.toString())
                                    .map((user, idx) => ({ ...user, id: idx + 1 }));
                            } break;
                            default: {
                                filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
                            } break;
                        }
                    } else {
                        filteredList = filteredList.filter((user) => 
                            user.sell_status?.toString() == normalizedStatus.toString())
                            .map((user, idx) => ({ ...user, id: idx + 1 }));
                    }
                }

                setFilterKioskList(filteredList);
            }, 150); // 검색은 더 짧은 디바운스 시간 적용
        } catch(error) {
            console.log(error);
        }
    }, [kioskList, filterSellStatusValueMethod, filterContentTypeValueMethod, filterInfo, debounce]);

    // 소유자 ID 필터링 함수 - 디바운싱 적용
    const debouncedFilter = useCallback((text: string) => {
       
        setInfoOwnerID(text);
        
        if(text.length === 0) {
            setFilterInfoOwnerList([]);
            return;
        }
        
        debounce(() => {

          get_FilterTargetInfo(text);

        }, 300);
    }, [debounce]);

    // 페이지네이션 컴포넌트
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

    const handleEditApply = async() => {

      try{

        if(openType == 'register'){

            const infoAddress = finalInfoAddress;
            const infoAddressIdx = finalInfoAddressIdx;
            const infoEmail = infoOwnerID.trim();
            const infoTarget = targetKioskID;

/*
            console.log('infoAddress : ' + infoAddress);
            console.log('infoEmail : ' + infoEmail);
            console.log('infoTarget : ' + infoTarget);
            console.log('infoAddressIdx : ' + finalInfoAddressIdx);

            if(infoOwnerID.length == 0){

              alert('소유자ID 정보를 입력해주세요');
              return;

            }

            const index = infoOwnerList.findIndex(item => item.mb_email.trim() == infoOwnerID.trim());

            if (index == -1) {
              
              console.log('index : ' + index);

              alert('소유자ID 정보를 확인할 수 없습니다. 다시 입력바랍니다.');                
              return;
            
            }
*/

            const response = await fetch('/api/kiosk/addOwnerInfo', {
              
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ infoAddress, infoAddressIdx, infoOwnerIdx, infoEmail, infoTarget }),
            });

            const data = await response.json();

            if (response.ok) {

              setEditDialogOpen(false);
              setInfoOwnerID(''); 
              setInfoSellStatus('0');
              setFinalInfoAddress('');
              setFinalInfoAddressIdx(-1);
              setTargetKioskID(-1);
              setFilterInfoOwnerList([]); 

              get_UserInfo();

            } else {

                alert(data.message);
            
            }

        }else{

          const infoAddress = finalInfoAddress;
          const infoAddressIdx = finalInfoAddressIdx;
          const infoEmail = infoOwnerID.trim();
          const infoTarget = targetKioskID;

/*
          console.log('infoAddress : ' + infoAddress);
          console.log('infoEmail : ' + infoEmail);
          console.log('infoTarget : ' + infoTarget);
          console.log('infoAddressIdx : ' + finalInfoAddressIdx);
          console.log('infoSellStatus : ' + infoSellStatus);

          if(infoOwnerID.length == 0){

            alert('소유자ID 정보를 입력해주세요');
            return;

          }

          const index = infoOwnerList.findIndex(item => item.mb_email.trim() == infoOwnerID.trim());

          if (index == -1) {
            
            console.log('index : ' + index);

            alert('소유자ID 정보를 확인할 수 없습니다. 다시 입력바랍니다.');                
            return;
          
          }

*/
          const response = await fetch('/api/kiosk/changeOwnerInfo', {
            
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ infoAddress, infoAddressIdx, infoOwnerIdx, infoEmail, infoTarget, infoSellStatus }),
          });

          const data = await response.json();

          if (response.ok) {

            setEditDialogOpen(false);
            setInfoOwnerID(''); 
            setInfoSellStatus('0');
            setFinalInfoAddress('');
            setFinalInfoAddressIdx(-1);
            setTargetKioskID(-1);
            setFilterInfoOwnerList([]); 

            get_UserInfo();


          } else {

              alert(data.message);
          
          }

        }

      }catch(error){

        console.log(error);

      }
    };

    const handleChangeMiningInfo = async() => {

      try{
        

        console.log('infoOwnerID : ' + infoOwnerID);
        console.log('finalInfoAddress : ' + finalInfoAddress);
        console.log('finalInfoAddressIdx : ' + finalInfoAddressIdx);
        console.log('infoOwnerIdx : ' + infoOwnerIdx);
        console.log('selectedWalletIdx : ' + selectedWalletIdx);
        console.log('targetKioskID : ' + targetKioskID);
        console.log('infoSellStatus : ' + infoSellStatus);


        const infoAddress = finalInfoAddress;
        const infoAddressIdx = finalInfoAddressIdx;
        const infoEmail = infoOwnerID.trim();
        const infoTarget = targetKioskID;
        
        let finalInfoSellStatus = infoSellStatus;

        if(finalInfoSellStatus == '0' || finalInfoSellStatus == '' || finalInfoSellStatus == 'undefined'){

            finalInfoSellStatus = '1';

        }

        console.log('finalInfoSellStatus : ' + finalInfoSellStatus);

      //  return;

        const response = await fetch('/api/kiosk/changeOwnerInfo', {
              
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({infoOwnerID, infoAddress, infoAddressIdx, infoOwnerIdx, infoEmail, infoTarget, infoSellStatus : finalInfoSellStatus }),
        });

        const data = await response.json();

        if (response.ok) {

          setEditDialogOpen(false);
          setInfoOwnerID(''); 
          setInfoSellStatus('0');
          setFinalInfoAddress('');
          setFinalInfoAddressIdx(-1);
          setTargetKioskID(-1);
          setFilterInfoOwnerList([]); 

          get_UserInfo();


        } else {

            alert(data.message);
        
        }

      }catch(error){

        console.log(error);
        alert(error);

      }

    };

    const handleCallBackInfo = async() => {

      try{


        const response = await fetch('/api/kiosk/callBackInfo', {
              
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({infoTarget : targetKioskID}),
        });

        const data = await response.json();

        if (response.ok) {

          setEditDialogOpen(false);
          setInfoOwnerID(''); 
          setInfoSellStatus('0');
          setFinalInfoAddress('');
          setFinalInfoAddressIdx(-1);
          setTargetKioskID(-1);
          setFilterInfoOwnerList([]); 

          get_UserInfo();

          alert('키오스크 초기화가 완료되었습니다');


        } else {

            alert(data.message);
        
        }

      }catch(error){

        console.log(error);
      }

    };

    const handleAutoSetOwnerInfo = async() => {

      try{

        console.log('kioskList.length : ' + kioskList.length);

        for(let i = 0; i < kioskList.length; i++){

          console.log(`compare before : ${i}`);

          if(kioskList[i].owner_id == null || kioskList[i].owner_id == ''){

            console.log('kioskList[i].owner_id : ' + kioskList[i].owner_id + ' 제외');
            console.log(kioskList[i]);
            continue;

          }

          /*
          if(kioskList[i].owner_id == 'a01085448384@gmail.com'){ // 소유자 지갑  DB미존재, Explorer 는 존재(PTH5m1hUmGBNKjWoLddy5ie9eEbz27vj9QBai82cgrUubseUFrKAM)

            console.log('kioskList[i].owner_id : ' + kioskList[i].owner_id + ' 제외');
            continue;
          }

          if(kioskList[i].owner_id == 'a45842387@gmail.com'){ // 소유자 지갑  DB미존재, Explorer 는 존재(PTH5SJ8YD5XFDnaWTvqBEeSSWc2ruG1VGEFRb9x4NBkNFRctKxvhS)

            console.log('kioskList[i].owner_id : ' + kioskList[i].owner_id + ' 제외');
            continue;
          }

          if(kioskList[i].owner_id == 'a01030085007@gmail.com'){ // 소유자 지갑  DB미존재, Explorer 는 존재(PTH7wXrCSMRRRsfqa93if6vusrYMSKJChmKPFrpMyqcNhUH2Ps8jW)

            console.log('kioskList[i].owner_id : ' + kioskList[i].owner_id + ' 제외');
            continue;
          }

          if(kioskList[i].owner_id == 'a01026431145@gmail.com'){ // 소유자 지갑  DB미존재, Explorer 는 존재(PTH6GpJRay4omJS1JeMpzDBYjH2hzHgGWSjVyv2CogLSnt46wVKV6)

            console.log('kioskList[i].owner_id : ' + kioskList[i].owner_id + ' 제외');
            continue;
          }

          if(kioskList[i].owner_id == 's01065572049@gmail.com'){ // 소유자 지갑  DB미존재, Explorer 는 존재(PTH5hc95npcTccRDXt9CDtZ7UVADjNzW3vqQSk887qYazrKt5kE9o)

            console.log('kioskList[i].owner_id : ' + kioskList[i].owner_id + ' 제외');
            continue;
          }
          */

          console.log(`compare after : ${i}`);


          const index = infoOwnerList.findIndex(item => item.mb_email.trim() == kioskList[i].owner_id.trim());

          let infoAddress = '';
          let infoAddressIdx = -1;  
          let infoOwnerIdx = -999;
          let infoEmail = '';
          let infoTarget = '';


          if (index == -1) {
            

            switch(kioskList[i].owner_id){

              case 'a01085448384@gmail.com':{

                infoAddress = kioskList[i].wallet_address;
                infoAddressIdx = 8634;  
                infoOwnerIdx =  -1;
                infoEmail = kioskList[i].owner_id;
                infoTarget = kioskList[i].kc_no;

              }break;
              case 'a45842387@gmail.com':{

                infoAddress = kioskList[i].wallet_address;
                infoAddressIdx = 8635;  
                infoOwnerIdx =  -2;
                infoEmail = kioskList[i].owner_id;
                infoTarget = kioskList[i].kc_no;

              }break;
              case 'a01030085007@gmail.com':{

                infoAddress = kioskList[i].wallet_address;
                infoAddressIdx = 8636;  
                infoOwnerIdx =  -3;
                infoEmail = kioskList[i].owner_id;
                infoTarget = kioskList[i].kc_no;

              }break;
              case 'a01026431145@gmail.com':{

                infoAddress = kioskList[i].wallet_address;
                infoAddressIdx = 8637;  
                infoOwnerIdx =  -4;
                infoEmail = kioskList[i].owner_id;
                infoTarget = kioskList[i].kc_no;

              }break;
              case 's01065572049@gmail.com':{

                infoAddress = kioskList[i].wallet_address;
                infoAddressIdx = 8638;  
                infoOwnerIdx =  -5;
                infoEmail = kioskList[i].owner_id;
                infoTarget = kioskList[i].kc_no;

              }break;
              default:{

                console.log('index : ' + index);
                console.log(kioskList[i]);
                console.log('소유자ID 정보를 확인할 수 없습니다. 다시 입력바랍니다.');

                
                alert('소유자ID 정보를 확인할 수 없습니다. 다시 입력바랍니다.');  
            
                break;

              }break;
                
                
            }


          }else{

            infoAddress = infoOwnerList[index].wallet_address;
            infoAddressIdx = infoOwnerList[index].wallet_idx;  
            infoOwnerIdx =  infoOwnerList[index].user_idx;
            infoEmail = infoOwnerList[index].mb_email;
            infoTarget = kioskList[i].kc_no;
  
          }


          const response = await fetch('/api/kiosk/addOwnerInfo', {
                
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ infoAddress, infoAddressIdx, infoOwnerIdx, infoEmail, infoTarget }),

          });

          const data = await response.json();

          if (response.ok) {

            console.log(`result :  + ${i} +  인덱스 성공` );

          } else {

              alert(data.message);
              break;
          
          }

        }

        console.log('뭐지????');

      }catch(error){

        console.log(error);
      }

    };

    // 지갑 선택 핸들러
    const handleWalletSelect = (wallet) => {
        setInfoOwnerID(selectedOwnerInfo.mb_id);
        setFinalInfoAddress(wallet.new_address);
        setFinalInfoAddressIdx(wallet.idx);
        setInfoOwnerIdx(selectedOwnerInfo.user_idx);
        setSelectedWalletIdx(wallet.idx);
        setWalletDialogOpen(false);
        setFilterInfoOwnerList([]);
    };

    // 자동완성 항목 클릭 핸들러 수정
    const handleOwnerSelect = (owner) => {
        setSelectedOwnerInfo(owner);
        get_WalletInfo(owner.user_idx);
    };

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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px',}}>
          <Paper style={{ padding: '10px', flex: 1, marginRight: '10px' }}>
            <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>총 키오스크 수</Typography>
            <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{kioskList.length}</Typography>
          </Paper>
          <Paper style={{ padding: '10px', flex: 1, marginRight: '10px' }}>
            <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>판매전</Typography>
            <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{kioskList.filter(kiosk => kiosk.sell_status === '0').length}</Typography>
          </Paper>
          <Paper style={{ padding: '10px', flex: 1, marginRight: '10px' }}>
            <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>판매중</Typography>
            <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{kioskList.filter(kiosk => kiosk.sell_status === '1').length}</Typography>
          </Paper>
          <Paper style={{ padding: '10px', flex: 1, marginRight: '10px' }}>
            <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>판매완료(직접채굴)</Typography>
            <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{kioskList.filter(kiosk => kiosk.sell_status === '2').length}</Typography>
          </Paper>
          <Paper style={{ padding: '10px', flex: 1 }}>
            <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>판매완료(운영지원금)</Typography>
            <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{kioskList.filter(kiosk => kiosk.sell_status === '3').length}</Typography>
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
                          handleFilterInfoChange(text.target.value);
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
                marginRight:"5px",
                fontSize: '14px'
              }}  
              onClick={handleClickSearch}
            >
              검색
            </Button>

        </div>

        <div ref={ref_Div} style={{
          flex: 1, 
          marginTop: '0px', 
          paddingLeft: "0px",
          width: '100%',
          overflow: 'hidden'
        }}>

          <StripedDataGrid 

          rows={filterKioskList}
          columns={columns}

          initialState={{
              pagination: {
                  paginationModel: {
                  pageSize: 10,
                  },
              },
          }}
          pageSizeOptions={[10]}
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
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  border: 1,
                  borderColor:"#f4f6f6",
                  borderRight: 0,
                  borderTop: 0,
                  fontSize:13.5,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
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
          getRowHeight={() => 'auto'}
          getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 1 ? 'even' : 'odd'
          }
          style={{
            marginTop:'20px',
            height: '80%',
          }}

          />

        </div>


        <Backdrop open={loading} sx={{ color: '#fff', display: 'flex', flexDirection: 'column', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <CircularProgress color="inherit" />
            <Typography variant="h6" color="inherit">키오스크 소유자 정보를 불러오는 중입니다</Typography>
        </Backdrop>

        <Dialog 
            open={editDialogOpen} 
            onClose={() => {
                setEditDialogOpen(false);
                setInfoOwnerID(''); // 값 초기화
                setFilterInfoOwnerList([]); // 목록 비우기
            }}
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    backgroundColor: '#1976d2',
                    color: 'white',
                    p: 2,
                    flex: '0 0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1 
                }}>
                    <Typography 
                        component="span"
                        sx={{ 
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {openType == 'edit' ? '수정' : '등록'}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent 
                sx={{
                    p: 3,
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    backgroundColor: '#f9f9f9',
                }}
                onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('#keywordInfoField')) {
                        setFilterInfoOwnerList([]); // 다이얼로그 클릭 시 목록 비우기
                    }
                }}
            >
                <Box sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    marginTop:'20px',
                    p: 2.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                }}>
                    <div style={{display: openType == 'edit' ? 'flex' : 'none', flexDirection:'column'}}>
                    <div style={{display:'flex', width:'100%', height:'1px', backgroundColor:'#e0e0e0'}}/>
                    <div style={{display:'flex', flexDirection:'row', width:'100%', alignItems: 'center'}}>
                      <div style={{padding:'10px', backgroundColor:'#f1f1f1', flex: '0 0 150px', textAlign: 'center'}}>
                      <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold' }}>
                            키오스크 상태
                        </Typography>
                      </div>
                      <div style={{display:'flex', flexDirection:'row', padding:'15px', backgroundColor:'white', flex: '1'}}>
                        <FormControl component="fieldset">
                            <RadioGroup row aria-label="sell-status" name="sell-status" value={infoSellStatus} onChange={(e) => {
                                const selectedValue = e.target.value;

                                if(selectedValue === '운영지원금'){
                                  setInfoSellStatus('3');
                                } else {
                                  setInfoSellStatus('2');
                                }
                            }}>
                                <FormControlLabel 
                                    value="운영지원금" 
                                    checked={infoSellStatus == '3'} 
                                    control={<Radio size="small" />} 
                                    label="판매완료(운영지원금)"
                                    sx={{
                                        '& .MuiFormControlLabel-label': {
                                            fontSize: '14px'
                                        },
                                        '& .MuiRadio-root': {
                                            padding: '4px'
                                        }
                                    }}
                                />
                                <FormControlLabel 
                                    value="직접채굴" 
                                    checked={infoSellStatus == '2'} 
                                    control={<Radio size="small" />} 
                                    label="판매완료(직접채굴)"
                                    sx={{
                                        '& .MuiFormControlLabel-label': {
                                            fontSize: '14px'
                                        },
                                        '& .MuiRadio-root': {
                                            padding: '4px'
                                        }
                                    }}
                                />
                            </RadioGroup>
                        </FormControl>
                      </div>
                    </div>
                    </div>
                    <div style={{width:'100%', height:'1px', backgroundColor:'#e0e0e0'}}/>
                    <div style={{display:'none', flexDirection:'row', width:'100%', alignItems: 'center'}}>
                      <div style={{padding:'10px', backgroundColor:'#f1f1f1', flex: '0 0 150px', textAlign: 'center'}}>
                        <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold' }}>
                            관리자ID
                        </Typography>
                      </div>
                      <div style={{display:'flex', flexDirection:'row', padding:'15px', backgroundColor:'white', flex: '1'}}>
                          <div style={{flex:1, borderRadius:'5px', borderWidth:'1px', borderColor:'#e0e0e0', backgroundColor:"#e9ecef", padding:'10px'}}>
                            <Typography sx={{fontSize:"13px", color: '#1f1f26', fontWeight:'bold' }}>
                                {infoManagerID}
                            </Typography>
                          </div>
                      </div>
                    </div>
                    <div style={{display:'none',width:'100%', height:'1px', backgroundColor:'#e0e0e0'}}/>
                    <div style={{display:'flex', flexDirection:'row', width:'100%', alignItems: 'center'}}>
                      <div style={{padding:'10px', backgroundColor:'#f1f1f1', flex: '0 0 150px', textAlign: 'center'}}>
                        <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold' }}>
                            소유자 ID
                        </Typography>
                      </div>
                      <div style={{display:'flex', flexDirection:'row', padding:'15px', backgroundColor:'white', flex: '1'}}>
                          <FormControl sx={{minWidth: '330px' }} variant="outlined">
                            <OutlinedInput
                              id="keywordInfoField"
                              sx={{
                                height: "33px",
                                backgroundColor: 'white',
                                borderColor: '#e0e0e0',
                                fontSize: '14px'
                              }}
                              type='text'
                              value={infoOwnerID || ''}
                              onChange={(text) => {

                                if(text.target.value.length > 0){

                                  debouncedFilter(text.target.value);
                                
                                } else {
                                
                                  setInfoOwnerID('');
                                  setFilterInfoOwnerList([]);
                                
                                }
                                
                              }}
                              onFocus={() => {
                                /*
                                if (!editDialogOpen) {
                                  setFilterInfoOwnerList([]); // 목록 비우기
                                } else {
                                  if(infoOwnerID.length === 0){
                                    return;
                                  }
                                  // 포커스 시에도 디바운스 적용
                                  debounce(() => {
                                    console.log('infoOwnerID : ' + infoOwnerID);
                                    setFilterInfoOwnerList(infoOwnerList.filter((item) => item.mb_id.includes(infoOwnerID)));
                                  }, 300);
                                }
                                */
                              }}
                              endAdornment={
                                <InputAdornment position="end">
                                  <ClearIcon
                                    onClick={() => { setInfoOwnerID(''); setFilterInfoOwnerList([]); }}
                                  />
                                </InputAdornment>
                              }
                            />
                          </FormControl>
                          {/* 자동완성 목록 */}
                          {filterInfoOwnerList.length > 0 && (
                              <Box sx={{ position: 'absolute', zIndex: 1, backgroundColor: 'white', border: '1px solid #e0e0e0', width: '273px', marginTop: '35px', maxHeight: '150px', overflowY: 'auto' }} onClick={(e) => {
                                  e.stopPropagation(); // 상위 이벤트 중지
                                  setFilterInfoOwnerList([]); // 목록 비우기
                              }}>
                                  {filterInfoOwnerList.map((item) => (
                                      <MenuItem key={item.id} onClick={(e) => {
                                          e.stopPropagation(); // 상위 이벤트 중지
                                          handleOwnerSelect(item);
                                      }}>
                                          {item.mb_id}
                                      </MenuItem>
                                  ))}
                              </Box>
                          )}
                      </div>
                    </div>
                    <div style={{width:'100%', height:'1px', backgroundColor:'#e0e0e0'}}/>
                    <div style={{display:'flex', flexDirection:'row', width:'100%', alignItems: 'center'}}>
                      <div style={{padding:'10px', backgroundColor:'#f1f1f1', flex: '0 0 150px', textAlign: 'center'}}>
                        <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold' }}>
                            채굴지갑주소
                        </Typography>
                      </div>
                      <div style={{display:'flex', padding:'15px', backgroundColor:'white', flex: '1'}}>
                          <div style={{
                              flex: 1, 
                              borderRadius: '5px', 
                              borderWidth: '1px', 
                              borderColor: '#e0e0e0', 
                              backgroundColor: "#e9ecef", 
                              padding: '10px',
                              overflow: 'hidden'
                          }}>
                            <Typography sx={{
                                fontSize:"13px", 
                                color: '#1f1f26', 
                                fontWeight:'bold', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                maxWidth: '40ch' // 최대 40자까지만 표시
                            }}>
                                {finalInfoAddress}
                            </Typography>
                          </div>
                      </div>
                    </div>
                    <div style={{width:'100%', height:'1px', backgroundColor:'#e0e0e0'}}/>
                    <div style={{display:'flex', flexDirection:'column', width:'100%', backgroundColor:'#f6f6f6', padding:'20px', borderRadius:'10px', marginTop:'20px' }}>
                      <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold' }}>
                          [유의사항]
                      </Typography>
                      <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginTop:'10px' }}>
                      1. 노드구매사이트에 가입한 회원만 소유자를 등록할 수 있습니다.
                      </Typography>
                      <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginTop:'0px' }}>
                      2. 채굴시간 중에는 소유자 등록이 불가합니다.
                      </Typography>
                    </div>
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
                    onClick={() => {
                        setEditDialogOpen(false);
                        setInfoOwnerID(''); // 값 초기화
                        setInfoOwnerIdx(-1);
                        setFinalInfoAddress('');
                        setFinalInfoAddressIdx(-1);
                        setTargetKioskID(-1);
                        setFilterInfoOwnerList([]); // 목록 비우기
                    }} 
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
                <div style={{display:'flex', flexDirection:'row', alignItems: 'center'}}>
                <Button 
                    onClick={handleCallBackInfo} 
                    variant="contained" 
                    startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                    sx={{ 
                        fontSize: '13px',
                        height: '32px',
                        padding: '0 16px',
                        marginLeft: '10px',
                        backgroundColor: '#1976d2',
                        '&:hover': {
                            backgroundColor: '#1565c0'
                        }
                    }}
                >
                    회수
                </Button>
                <Button 
                    onClick={handleChangeMiningInfo} 
                    variant="contained" 
                    startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                    sx={{ 
                        fontSize: '13px',
                        height: '32px',
                        padding: '0 16px',
                        marginLeft: '10px',
                        backgroundColor: '#1976d2',
                        '&:hover': {
                            backgroundColor: '#1565c0'
                        }
                    }}
                >
                    적용
                </Button>
                </div>
            </DialogActions>
        </Dialog>

        {/* 지갑 선택 다이얼로그 추가 - 완전히 새로 작성 */}
        <Dialog 
            open={walletDialogOpen} 
            onClose={() => {
                setWalletDialogOpen(false);
            }}
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    backgroundColor: '#1976d2',
                    color: 'white',
                    p: 2,
                    flex: '0 0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1 
                }}>
                    <Typography 
                        component="span"
                        sx={{ 
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        지갑 선택
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent 
                sx={{
                    p: 3,
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    backgroundColor: '#f9f9f9',
                }}
            >
                <Box sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    p: 2.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                    marginTop:'20px'
                }}>
                    <Typography sx={{fontSize:"15px", color: '#1f1f26', fontWeight:'bold', mb: 2 }}>
                        {selectedOwnerInfo?.mb_id} 님의 지갑 목록
                    </Typography>
                    
                    {/* 목록을 일반 div로 변경하여 ListItem 대신 사용 */}
                    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {walletList.map((wallet) => (
                            <Box 
                                key={wallet.idx}
                                onClick={() => handleWalletSelect(wallet)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottom: '1px solid #f0f0f0',
                                    padding: '8px 4px',
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5',
                                        cursor: 'pointer'
                                    },
                                    backgroundColor: selectedWalletIdx === wallet.idx ? '#e3f2fd' : 'inherit'
                                }}
                            >
                                <Box sx={{ flex: 1, pr: 2 }}>
                                    <Typography sx={{ fontSize: '14px', fontWeight: wallet.is_main === 'Y' ? 'bold' : 'normal' }}>
                                        {wallet.name || '이름 없음'} {wallet.is_main === 'Y' && '(메인 지갑)'}
                                    </Typography>
                                    <Typography 
                                        sx={{ 
                                            fontSize: '12px', 
                                            color: 'text.secondary',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '400px'
                                        }}
                                    >
                                        {wallet.new_address}
                                    </Typography>
                                </Box>
                                {selectedWalletIdx === wallet.idx && (
                                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                )}
                            </Box>
                        ))}
                    </Box>
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
                    onClick={() => {
                        setWalletDialogOpen(false);
                    }} 
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

      </div>
    );

  }
