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
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
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

                setInfoManagerID(params.row.manager_mail);
                setInfoOwnerID(params.row.owner_id);
                setInfoSellStatus(params.row.sell_status);
                setFinalInfoAddress(params.row.match_address);
                setFinalInfoAddressIdx(params.row.wallet_idx);
                setTargetKioskID(params.row.kc_no);                

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

    React.useEffect(()=>{

      console.log('infoSellStatus : ' + infoSellStatus);
    },[infoSellStatus]);

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

    const handleEditApply = async() => {

      try{

        if(openType == 'register'){

            const infoAddress = finalInfoAddress;
            const infoAddressIdx = finalInfoAddressIdx;
            const infoEmail = infoOwnerID.trim();
            const infoTarget = targetKioskID;


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
            <Typography variant="h6">총 키오스크 수</Typography>
            <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{kioskList.length}</Typography>
          </Paper>
          <Paper style={{ padding: '10px', flex: 1, marginRight: '10px' }}>
            <Typography variant="h6">판매전</Typography>
            <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{kioskList.filter(kiosk => kiosk.sell_status === '0').length}</Typography>
          </Paper>
          <Paper style={{ padding: '10px', flex: 1, marginRight: '10px' }}>
            <Typography variant="h6">판매중</Typography>
            <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{kioskList.filter(kiosk => kiosk.sell_status === '1').length}</Typography>
          </Paper>
          <Paper style={{ padding: '10px', flex: 1, marginRight: '10px' }}>
            <Typography variant="h6">판매완료(직접채굴)</Typography>
            <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>{kioskList.filter(kiosk => kiosk.sell_status === '2').length}</Typography>
          </Paper>
          <Paper style={{ padding: '10px', flex: 1 }}>
            <Typography variant="h6">판매완료(운영지원금)</Typography>
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
            <Button id="keyBtns" variant="outlined" style={{color:"white",backgroundColor:"#1f1f26", borderColor:"#CBCBCB" ,height:"33px" , marginRight:"10px"}}  onClick={handleAutoSetOwnerInfo}>
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

        <Dialog open={editDialogOpen} onClose={() => {
            setEditDialogOpen(false);
            setInfoOwnerID(''); // 값 초기화
            setFilterInfoOwnerList([]); // 목록 비우기
        }}>
            <DialogTitle textAlign="center" sx={{fontSize:"17px",  color: '#1f1f26', marginLeft:"0px", fontWeight:'bold', alignContent:'center', alignItems:'center', justifyContent:'center' }}>{openType == 'edit' ? '수정' : '등록'}</DialogTitle>
            <DialogContent onClick={(e) => {
                // 다이얼로그 클릭 시 목록 비우기, 단 OutlinedInput 클릭 시에는 비우지 않음
                if (!(e.target as HTMLElement).closest('#keywordInfoField')) {
                    setFilterInfoOwnerList([]); // 다이얼로그 클릭 시 목록 비우기
                }
            }}>
              <div>
                <div style={{display: openType == 'edit' ? 'flex' : 'none', flexDirection:'column'}}>
                <div style={{width:'100%', height:'1px', backgroundColor:'#edccd4'}}/>
                <div style={{display:'flex', flexDirection:'row', width:'100%', }}>
                  <div style={{flex:1, padding:'10px', backgroundColor:'#f1f1f1', paddingRight:'35px', paddingLeft:'35px', alignItems:'center', alignContent:'center', justifyContent:'center'}}>
                    <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginLeft:"0px", fontWeight:'bold' }}>
                        키오스크 상태
                    </Typography>
                  </div>
                  <div style={{display:'flex', flexDirection:'row', padding:'15px', paddingRight:'35px', paddingLeft:'25px', paddingBottom:'10px', backgroundColor:'white'}}>
                    <FormControl component="fieldset">
                        <RadioGroup row aria-label="sell-status" name="sell-status" value={infoSellStatus} onChange={(e) => {
                            const selectedValue = e.target.value;

                            if(selectedValue === '운영지원금'){
                              setInfoSellStatus('3');
                            } else {
                              setInfoSellStatus('2');
                            }
                        }}>
                            <FormControlLabel value="운영지원금" checked={infoSellStatus == '3'} control={<Radio />} label="판매완료(운영지원금)" />
                            <FormControlLabel value="직접채굴" checked={infoSellStatus == '2'} control={<Radio />} label="판매완료(직접채굴)" />
                        </RadioGroup>
                    </FormControl>
                  </div>
                </div>
                </div>
                <div style={{width:'100%', height:'1px', backgroundColor:'#edccd4'}}/>
                <div style={{display:'flex', flexDirection:'row', width:'100%', }}>
                  <div style={{padding:'10px', backgroundColor:'#f1f1f1', alignItems:'center', alignContent:'center', justifyContent:'center'}}>
                    <Typography sx={{fontSize:"13px",  color: '#1f1f26', padding:'10px', paddingRight:'55px', paddingLeft:'25px', marginLeft:"0px", fontWeight:'bold' }}>
                        관리자ID
                    </Typography>
                  </div>
                  <div style={{display:'flex', flexDirection:'row', padding:'15px', paddingRight:'35px', paddingLeft:'35px', backgroundColor:'white'}}>
 
                      <div style={{flex:1, width:'100%', marginLeft:'-10px', borderRadius:'5px', borderWidth:'1px', borderColor:'#edccd4', backgroundColor:"#e9ecef", padding:'10px', }}>

                        <Typography sx={{fontSize:"13px", width:'250px',  color: '#1f1f26', marginLeft:"0px", fontWeight:'bold' }}>
                            {infoManagerID}
                        </Typography>
                        
                      </div>

                  </div>
                </div>
                <div style={{width:'100%', height:'1px', backgroundColor:'#edccd4'}}/>
                <div style={{display:'flex', flexDirection:'row', width:'100%', }}>
                  <div style={{padding:'10px', backgroundColor:'#f1f1f1', alignItems:'center', alignContent:'center', justifyContent:'center'}}>
                    <Typography sx={{fontSize:"13px",  color: '#1f1f26', padding:'0px', paddingRight:'55px', paddingLeft:'25px', marginLeft:"0px", fontWeight:'bold' }}>
                        소유자ID
                    </Typography>
                  </div>
                  <div style={{display:'flex', flexDirection:'row', padding:'15px', paddingRight:'35px', paddingLeft:'25px',  backgroundColor:'white'}}>
 
                      <FormControl sx={{minWidth: '273px' }} variant="outlined">
                        <OutlinedInput
                          id="keywordInfoField"
                          sx={{
                            height: "33px",
                            backgroundColor: 'white',
                            borderColor: '#edccd4'
                          }}
                          type='text'
                          value={infoOwnerID}
                          onChange={(text) => {

                            setInfoOwnerID(text.target.value);

                            if(text.target.value.length == 0){

                              setFilterInfoOwnerList([]); // 선택 후 목록 비우기
                              return;
                              
                            }

                            setFilterInfoOwnerList(infoOwnerList.filter((item) => item.mb_email.includes(text.target.value)));
                          
                          }}
                          onFocus={() => {

                            console.log('editDialogOpen : ' + editDialogOpen);
                            if (!editDialogOpen) {

                              setFilterInfoOwnerList([]); // 목록 비우기
                            
                            } else {

                              if(infoOwnerID.length == 0){

                                return;

                              }

                              setFilterInfoOwnerList(infoOwnerList.filter((item) => item.mb_email.includes(infoOwnerID)));

                            }
                          }}
                          endAdornment={
                            <InputAdornment position="end">
                              <ClearIcon
                                onClick={() => { setInfoOwnerID(''); }}
                              />
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                      {/* 자동완성 목록 */}
                      {filterInfoOwnerList.length > 0 && (
                          <Box sx={{ position: 'absolute', zIndex: 1, backgroundColor: 'white', border: '1px solid #edccd4', width: '273px', marginTop: '35px', maxHeight: '150px', overflowY: 'auto' }} onClick={() => {
                              setFilterInfoOwnerList([]); // 목록 비우기
                          }}>
                              {filterInfoOwnerList.map((item) => (
                                  <MenuItem key={item.id} onClick={() => {

                                      setInfoOwnerID(item.mb_email);
                                      setFinalInfoAddress(item.wallet_address);
                                      setFinalInfoAddressIdx(item.wallet_idx);
                                      setFilterInfoOwnerList([]); // 선택 후 목록 비우기
                                  }}>
                                      {item.mb_email}
                                  </MenuItem>
                              ))}
                          </Box>
                      )}
                  </div>
                </div>
                <div style={{width:'100%', height:'1px', backgroundColor:'#edccd4'}}/>
                <div style={{display:'flex', flexDirection:'row', width:'100%', }}>
                  <div style={{padding:'10px', backgroundColor:'#f1f1f1', alignItems:'center', alignContent:'center', justifyContent:'center'}}>
                    <Typography sx={{fontSize:"13px",  color: '#1f1f26', padding:'10px', paddingRight:'55px', paddingLeft:'25px', marginLeft:"0px", fontWeight:'bold' }}>
                        매칭주소
                    </Typography>
                  </div>
                  <div style={{display:'flex', flexDirection:'row', padding:'15px', paddingRight:'35px', paddingLeft:'35px', backgroundColor:'white'}}>
 
                      <div style={{flex:1, width:'100%', marginLeft:'-10px', borderRadius:'5px', borderWidth:'1px', borderColor:'#edccd4', backgroundColor:"#e9ecef", padding:'10px', }}>

                        <Typography sx={{fontSize:"13px", width:'250px',  color: '#1f1f26', marginLeft:"0px", fontWeight:'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {finalInfoAddress}
                        </Typography>
                        
                      </div>

                  </div>
                </div>
                <div style={{width:'100%', height:'1px', backgroundColor:'#edccd4'}}/>

                <div style={{display:'flex', flexDirection:'column',  width:'100%', backgroundColor:'#f6f6f6', padding:'20px', borderRadius:'10px', marginTop:'20px' }}>
                  <Typography sx={{fontSize:"13px",  color: '#1f1f26', padding:'0px',  paddingLeft:'0px', fontWeight:'bold' }}>
                      [유의사항]
                  </Typography>
                  <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginTop:'10px' }}>
                  1. 노드구매사이트에 가입한 회원만 소유자를 등록할 수 있습니다.
                  </Typography>
                  <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginTop:'0px' }}>
                  2. 채굴시간 중에는 소유자 등록이 불가합니다.
                  </Typography>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {

                  // 수정 다이얼로그 적용 로직
                  setEditDialogOpen(false);
                  setInfoOwnerID(''); // 값 초기화
                  setInfoOwnerIdx(-1);
                  setFinalInfoAddress('');
                  setFinalInfoAddressIdx(-1);
                  setTargetKioskID(-1);
                  setFilterInfoOwnerList([]); // 목록 비우기
                  
                }} color="primary">닫기</Button>
                <Button onClick={handleEditApply} color="primary">적용</Button>
            </DialogActions>
        </Dialog>

      </div>
    );

  }
