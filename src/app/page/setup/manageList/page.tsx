'use client';

import React, { useState } from "react";
import { DataGrid, GridToolbar, GridRowsProp, GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, gridClasses} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { alpha, styled } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import UserInfoView from '../../../components/UserInfoView';
import PointHistoryView from '../../../components/PointHistoryView';
import WalletInfoView from '../../../components/WalletInfoView';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { 
    gridPageCountSelector, 
    gridPageSelector, 
    useGridApiContext, 
    useGridSelector,
    GridPagination
} from '@mui/x-data-grid';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Stack } from '@mui/material';
import { FormControlLabel, Checkbox, Divider } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';

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


const menuList = [

  {
    label: '회원관리',
    children: [
      { href: '/page/user/normalUser', label: '• 일반 회원리스트' },
      { href: '/page/user/nodeUser', label: '• 노드 회원리스트' },
      { href: '/page/user/kycInfo', label: '• KYC 정보관리' },

    ],
  },
  {
    label: '채굴(노드)관리',
    children: [
      { href: '/page/mining/setup', label: '• 채굴설정' },
      { href: '/page/mining/history', label: '• 채굴내역' },
      { href: '/page/mining/monitoring', label: '• 모니터링 / 재처리' },
    ],
  },
  {
    label: '포인트관리',
    children: [
      { href: '/page/point/pointRewardInfo', label: '• 포인트 제공내역' },
      { href: '/page/point/pointHistoryInfo', label: '• 포인트 사용내역' },
      { href: '/page/point/pointSwapInfo', label: '• 포인트 전환내역' },
    ],
  },
  {
    label: '코인전송관리',
    children: [
      { href: '/page/point/pointRewardInfo', label: '• 개별전송' },
      { href: '/page/point/pointHistoryInfo', label: '• 노드전송' },
      { href: '/page/point/pointSwapInfo', label: '• 대량전송' },
      { href: '/page/point/pointSwapInfo', label: '• 전송내역 관리' },
    ],
  },
  {
    label: '운영관리',
    children: [
      { href: '/page/manage/noticeInfo', label: '• 공지 관리' },
      { href: '/page/manage/mailInfo', label: '• 메일 인증내역' },
      { href: '/page/manage/mailInfo', label: '• 메일 발송관리' },
      { href: '/page/manage/smsInfo', label: '• SMS 인증내역' },
      { href: '/page/manage/lockInfo', label: '• Lock 설정' },
      { href: '/page/user/blackList', label: '• 블랙리스트 관리' },
      { href: '/page/manage/appInfo', label: '• 앱 관리' },
    ],
  },
  {
    label: '키오스크관리',
    children: [
      { href: '/page/kiosk/ownerInfo', label: '• 소유자 관리' },
      { href: '/page/kiosk/petDepositInfo', label: '• 플라스틱 수거현황' },
    ],
  },
  {
    label: '설정',
    children: [
      { href: '/page/setup/manageList', label: '• 시스템 사용자 관리' },
      { href: '/page/setup/menuAuth', label: '• 메뉴권한 관리' },
    ],
  },
  
];


// 타입 정의 개선
interface KYCContent {
  kyc_path: string;
  kyc_path2: string;
  kyc_path3: string;
  kyc_name: string;
  kyc_birth: string;
  approval_yn: string;
  // ... other fields
}

// 메뉴 권한 관련 인터페이스 추가
interface MenuAuthItem {
  label: string;
  checked: boolean;
  show_yn: 'show' | 'hide';
  children?: {
    href: string;
    label: string;
    checked: boolean;
  }[];
}

// 스타일 상수 추가
const MenuAuthStyles = {
  menuContainer: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    height: '400px', // 고정 높이 설정
  },
  menuHeader: {
    backgroundColor: '#f5f5f5',
    p: 2,
    borderBottom: '1px solid #e0e0e0',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  menuContent: {
    flex: 1,
    overflowY: 'auto',
    p: 2,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '4px',
    },
  },
  parentMenu: {
    mb: 2,
    p: 1.5,
    borderRadius: '6px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  childrenContainer: {
    ml: 3,
    mt: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 1,
  },
  childMenuItem: {
    display: 'flex',
    alignItems: 'center',
    p: 0.5,
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
  }
};

// 공통 MenuAuthSection 컴포넌트
interface MenuAuthSectionProps {
  menuItems: MenuAuthItem[];
  onMenuChange: (newMenuItems: MenuAuthItem[]) => void;
}

const MenuAuthSection: React.FC<MenuAuthSectionProps> = ({ menuItems, onMenuChange }) => {
  const handleParentCheck = (parentIndex: number, checked: boolean) => {
    onMenuChange(menuItems.map((menu, idx) => 
      idx === parentIndex ? {
        ...menu,
        checked,
        children: menu.children?.map(child => ({
          ...child,
          checked
        })),
        show_yn: checked ? 'show' : 'hide'  // 부모 체크 시 show_yn 업데이트
      } : menu
    ));
  };

  const handleChildCheck = (parentIndex: number, childIndex: number, checked: boolean) => {
    onMenuChange(menuItems.map((menu, idx) => {
      if (idx === parentIndex) {
        const newChildren = menu.children?.map((child, cIdx) => 
          cIdx === childIndex ? { ...child, checked } : child
        );
        const hasCheckedChild = newChildren?.some(child => child.checked) ?? false;
        return {
          ...menu,
          checked: newChildren?.every(child => child.checked) ?? false,
          children: newChildren,
          show_yn: hasCheckedChild ? 'show' : 'hide'  // 자식 체크 상태에 따라 show_yn 업데이트
        };
      }
      return menu;
    }));
  };

  return (
    <Box sx={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      height: '400px'
    }}>
      <Box sx={{
        p: 2,
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography component="div" sx={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#1976d2',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <FolderIcon sx={{ fontSize: 20 }} />
          메뉴 권한 설정
        </Typography>
      </Box>

      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '4px' },
        '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' }
      }}>
        {menuItems.map((menu, parentIndex) => (
          <Box key={parentIndex} sx={{
            mb: 2,
            backgroundColor: '#fff',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Box
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #eee'
              }}
              onClick={(e) => e.preventDefault()}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={menu.checked || false}
                    onChange={(e) => handleParentCheck(parentIndex, e.target.checked)}
                    size="small"
                    sx={{
                      color: '#1976d2',
                      '&.Mui-checked': { color: '#1976d2' }
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {menu.label}
                  </Typography>
                }
                sx={{ margin: 0, flex: 1 }}
              />
              <Chip
                size="small"
                label={`${menu.children?.filter(c => c.checked).length || 0}/${menu.children?.length || 0}`}
                sx={{
                  backgroundColor: menu.checked ? '#e3f2fd' : '#f5f5f5',
                  color: menu.checked ? '#1976d2' : '#666',
                  fontSize: '12px'
                }}
              />
            </Box>

            <Box sx={{ p: 1.5 }}>
              <Grid container spacing={1}>
                {menu.children?.map((child, childIndex) => (
                  <Grid item xs={12} sm={6} key={childIndex}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={child.checked || false}
                          onChange={(e) => handleChildCheck(parentIndex, childIndex, e.target.checked)}
                          size="small"
                          sx={{
                            color: '#78909c',
                            '&.Mui-checked': { color: '#1976d2' }
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: '13px' }}>
                          {child.label.replace('• ', '')}
                        </Typography>
                      }
                      sx={{ margin: 0 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// createInitialMenuAuth 함수를 컴포넌트 외부로 이동
const createInitialMenuAuth = (menuListData: any[]) => {
  return menuListData.map(menu => ({
        label: menu.label,
        checked: false,
        show_yn: 'hide',
        children: menu.children?.map(child => ({
          href: child.href,
          label: child.label,
          checked: false
        })) || []
  }));
};

export default function Home() {

    const ref_Div = React.useRef<HTMLDivElement>(null);
    const ref_Grid = React.useRef(0);
    const ref_SelectedContent = React.useRef(null);
    const ref_SelectedFiles = React.useRef([]);

    const [pagingIdx, setPaginIdx] = React.useState('0');
    const [filterInfo, setFilterInfo] = React.useState('');
    const [userList, setUserList] = React.useState([]);
    const [filterUserList, setFilterUserList] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState(null);    
    

    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('');
    const [filterUserTypeMethod, setFilterUserTypeMethod] = React.useState(10);
    const [filterUserTypeValueMethod, setFilterUserTypeValueMethod] = React.useState('');


    const page_info = 'Home > 설정 > 사용자 관리';

    const [openDialog, setOpenDialog] = React.useState(false);

    const [loading, setLoading] = React.useState(false);

    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userType, setUserType] = useState('');
    const [isIdChecked, setIsIdChecked] = useState(false);

    // 메뉴 권한 상태 관리
    // @ts-ignore
    const [menuAuth, setMenuAuth] = useState<MenuAuthItem[]>(() => createInitialMenuAuth(menuList));
    // @ts-ignore
    const [editMenuAuth, setEditMenuAuth] = useState<MenuAuthItem[]>(() => createInitialMenuAuth(menuList));

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editUserId, setEditUserId] = useState('');
    const [editUserName, setEditUserName] = useState('');
    const [editUserType, setEditUserType] = useState('');

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

        setLoading(true);  // 로딩 시작

        const response = await fetch('/api/setup/manageList', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({ 

            pagingIdx : 0 

          }),
        
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

      } finally {
        
        setLoading(false);  // 로딩 종료
      
      }

    };
    
    const handleChangeFilterContentType = (event: SelectChangeEvent<number>) => {

        try{

          setFilterContentTypeMethod(Number(event.target.value)); 

          switch(event.target.value){

            case 10:{

              setFilterContentTypeValueMethod('ALL');
            }break;
            case 20:{
              setFilterContentTypeValueMethod('A');
            }break;
            case 30:{
              setFilterContentTypeValueMethod('M');
            }break;
            case 40:{
              setFilterContentTypeValueMethod('N');
            }break;

          }

        }catch(error){

            console.log(error);

        }
    };

    const handleChangeFilterUserType = (event: SelectChangeEvent<number>) => {

      try{

        setFilterUserTypeMethod(Number(event.target.value));

        switch(event.target.value){

          case 10:{
            setFilterUserTypeValueMethod('id');
          }break;
          case 20:{
            setFilterUserTypeValueMethod('name');
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
      
      try {

        let filteredList = [];
        
        if(filterInfo.length > 0){

          if(filterContentTypeValueMethod != 'ALL'){

              switch(filterUserTypeValueMethod){

                case 'id':{
                  filteredList = userList.filter((user) => user.user_id.includes(filterInfo))
                    .map((user, idx) => ({ ...user, id: idx + 1 }));
                }break;
                case 'name':{
                  filteredList = userList.filter((user) => user.user_name.includes(filterInfo))
                    .map((user, idx) => ({ ...user, id: idx + 1 }));
                }break;
              
              }

              switch(filterContentTypeValueMethod){

                case '':{
                  filteredList = filteredList.map((data, idx) => ({ ...data, id: idx + 1 }));
                }break;
                case 'A':{
                  filteredList = filteredList.filter((data) => data.user_type == 'A')
                    .map((data, idx) => ({ ...data, id: idx + 1 }));
                }break;
                case 'M':{
                  filteredList = filteredList.filter((data) => data.user_type == 'M')
                    .map((data, idx) => ({ ...data, id: idx + 1 }));
                }break;
                case 'N':{
                  filteredList = filteredList.filter((data) => data.user_type == 'N')
                    .map((data, idx) => ({ ...data, id: idx + 1 }));
                }break;
                default:{
                  filteredList = filteredList.map((data, idx) => ({ ...data, id: idx + 1 }));
                }break;
            
            }

          }else{

            switch(filterUserTypeValueMethod){

              case 'id':{
                filteredList = userList.filter((user) => user.user_id.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              }break;
              case 'name':{
                filteredList = userList.filter((user) => user.user_name.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              }break;
            
            }

          }

        }else{

          if(filterContentTypeValueMethod != 'ALL'){

            switch(filterContentTypeValueMethod){

              case '':{
                filteredList = userList.map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
              case 'A':{
                filteredList = userList.filter((data) => data.user_type == 'A')
                  .map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
              case 'M':{
                filteredList = userList.filter((data) => data.user_type == 'M')
                  .map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
              case 'N':{
                filteredList = userList.filter((data) => data.user_type == 'N')
                  .map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
              default:{
                filteredList = userList.map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
          
          }

          }else{

            filteredList = userList.map((data, idx) => ({ ...data, id: idx + 1 }));

          }

        } 
        
        setFilterUserList(filteredList);

      }catch(error){

        console.log(error);

      } finally {

      }

    };

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
          field: 'user_id',
          headerName: '사용자 아이디',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'user_name',
          headerName: '사용자명',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'user_type_text',
          headerName: '타입',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'create_date',
          headerName: '등록일',
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
              <Box sx={{ 
                  width: '100%', 
                  height: '100%',  // 높이를 100%로 설정
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center'  // 수직 중앙 정렬 추가
              }}>
                  <Button
                      variant="contained"
                      size="small"
                      sx={{ fontSize: '12px' }}
                      onClick={(event) => {

                          event.stopPropagation();

                          const content = filterUserList[params.row.id - 1];
                          setSelectedContent(content);
                          handleOpenEditDialog(content);

                      }}
                  >
                      보기
                  </Button>
              </Box>
          ),
      },
    ];

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

    // 등록 다이얼로그 오픈 핸들러 수정
    const handleOpen = () => {
      setUserId('');
      setUserName('');
      setUserType('');
      setIsIdChecked(false);
      // @ts-ignore
      setMenuAuth(createInitialMenuAuth(menuList));
      setOpen(true);
    };

    // 수정 다이얼로그 오픈 핸들러
    const handleOpenEditDialog = (content: any) => {
      setEditUserId(content.user_id);
      setEditUserName(content.user_name);
      setEditUserType(content.user_type);
      
      // 기존 메뉴 권한 정보를 가져와서 설정
      const userMenuAuth = content.menu_auth 
        ? content.menu_auth.map((menu: any) => ({
            ...menu,
            checked: menu.checked || false,
            show_yn: menu.show_yn || 'hide',
            children: menu.children?.map((child: any) => ({
              ...child,
              checked: child.checked || false
            })) || []
          }))
        : createInitialMenuAuth(menuList);

      setEditMenuAuth(userMenuAuth);
      setOpenEditDialog(true);
    };

    // 등록 다이얼로그 닫기 핸들러 수정
    const handleClose = () => {
      setOpen(false);
      setUserId('');
      setUserName('');
      setUserType('');
      setIsIdChecked(false);
      // @ts-ignore
      setMenuAuth(createInitialMenuAuth(menuList));
    };

    // 수정 다이얼로그 닫기 핸들러
    const handleCloseEditDialog = () => {
      setOpenEditDialog(false);
      setEditUserId('');
      setEditUserName('');
      setEditUserType('');
      // @ts-ignore
      setEditMenuAuth(createInitialMenuAuth(menuList));
    };

    const handleIdCheck = async () => {

      if (!userId) {
        alert('사용자 아이디를 입력해주세요.');
        return;
      }
      
      try {

        const response = await fetch('/api/setup/manageUser', {
          
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, manage_type: 'duplicate' })

        });
        
        const data = await response.json();

        if (data.result == 'success') {
        
          alert('사용 가능한 아이디입니다.');
          setIsIdChecked(true);
        
        } else {
        
          alert('이미 사용중인 아이디입니다.');
          setIsIdChecked(false);
        
        }
     
      } catch (error) {
        console.error('Error:', error);
        alert('중복 체크 중 오류가 발생했습니다.');
      }

    };

    // 등록 다이얼로그용 메뉴 변경 핸들러
    const handleMenuAuthChange = (newMenuItems: MenuAuthItem[]) => {
      setMenuAuth(newMenuItems);
    };

    // 수정 다이얼로그용 메뉴 변경 핸들러
    const handleEditMenuAuthChange = (newMenuItems: MenuAuthItem[]) => {
      setEditMenuAuth(newMenuItems);
    };

    const handleSubmit = async () => {

      if (!isIdChecked) {
        alert('아이디 중복 체크를 해주세요.');
        return;
      }
      
      if (!userName || !userType) {
        alert('모든 필드를 입력해주세요.');
        return;
      }

      // 선택된 메뉴 권한 정보 수집
      const selectedMenuAuth = menuAuth.map(menu => {
        const hasCheckedChild = menu.children?.some(child => child.checked) ?? false;
        return {
          label: menu.label,
          checked: menu.checked,
          show_yn: hasCheckedChild ? 'show' : 'hide',
          children: menu.children?.map(child => ({
            href: child.href,
            label: child.label,
            checked: child.checked
          }))
        };
      });

      let userTypeValue = userType;

      switch(userType){

        case '총괄관리자':{
          userTypeValue = 'A';
        }break;
        case '어드민':{
          userTypeValue = 'M';
        }break;
        case '일반사용자':{
          userTypeValue = 'N';
        }break;
        default:{
          userTypeValue = 'N';
        }break;
      }

      console.log(selectedMenuAuth);
      
      try {
        const response = await fetch('/api/setup/manageUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            user_pw: '',
            user_type: userType,
            user_name: userName,
            manage_type: 'add',
            user_key: '',
            menu_auth: selectedMenuAuth
          })
        });

        const data = await response.json();

        if (response.ok && data.result == 'success') {

          alert('사용자가 성공적으로 등록되었습니다.');
          handleClose();
          
          get_UserInfo();

        } else {
        
          alert(data.message || '사용자 등록 중 오류가 발생했습니다.');
        
        }
      
      } catch (error) {
        console.error('Error:', error);
        alert('사용자 등록 중 오류가 발생했습니다.');
      }
    };

    // 수정 처리
    const handleEdit = async () => {
      try {
        // 수정된 메뉴 권한 정보 수집
        const updatedMenuAuth = editMenuAuth.map(menu => {
          const hasCheckedChild = menu.children?.some(child => child.checked) ?? false;
          return {
            label: menu.label,
            checked: menu.checked,
            show_yn: hasCheckedChild ? 'show' : 'hide',
            children: menu.children?.map(child => ({
              href: child.href,
              label: child.label,
              checked: child.checked
            }))
          };
        });


        const response = await fetch('/api/setup/manageUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: editUserId,
            user_name: editUserName,
            user_type: editUserType,
            user_key: selectedContent.user_key,
            menu_auth: updatedMenuAuth,
            manage_type: 'update'
          })
        });

        const data = await response.json();

        if (response.ok && data.result === 'success') {

          alert('수정이 완료되었습니다.');
          handleCloseEditDialog();
          get_UserInfo(); // 목록 새로고침
        
        } else {
        
          alert(data.message || '수정 중 오류가 발생했습니다.');
        
        }
      
      } catch (error) {
        console.error('Error:', error);
        alert('수정 중 오류가 발생했습니다.');
      }
    
    };

    return (

      <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

        <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

            <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

        </div>

        <div style={{}}>
            <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
                사용자 관리
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
              
            <Typography sx={{fontSize:"14px", color: '#1f1f26', marginLeft:"10px"}}>
                총 사용자 수 : {userList.length}
            </Typography>
            

            <div style={{display:"flex", float:"left", marginLeft:"auto", alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                  
                <div style={{display:"flex", float:"left", alignContent:'center', alignItems:'center', justifyContent:'center'}}>

                    <Typography sx={{fontSize:"14px", color: '#1f1f26', marginLeft:"0px"}}>
                        사용자 타입
                    </Typography>
                    
                    <FormControl fullWidth style={{ 
                        width:"110px", 
                        marginTop:"0px", 
                        marginLeft:"8px", 
                        backgroundColor:'white', 
                        color:'black'
                    }}>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            style={{
                                color:'black', 
                                fontSize: '14px',
                                height: '33px'
                            }}
                            value={filterContentTypeMethod}
                            size="small"
                            onChange={handleChangeFilterContentType}
                        >
                            <MenuItem style={{fontSize: '14px'}} value={10}>전체</MenuItem>
                            <MenuItem style={{fontSize: '14px'}} value={20}>총괄관리자</MenuItem>
                            <MenuItem style={{fontSize: '14px'}} value={30}>어드민</MenuItem>
                            <MenuItem style={{fontSize: '14px'}} value={40}>일반사용자</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>

            <div style={{display:"flex", float:"left", marginLeft:"20px", alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                  
                <div style={{display:"flex", float:"left"}}>

                    <FormControl fullWidth style={{ 
                        width:"110px", 
                        marginTop:"0px", 
                        marginLeft:"5px", 
                        backgroundColor:'white', 
                        color:'black'
                    }}>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            style={{
                                color:'black', 
                                fontSize: '14px',
                                height: '33px'
                            }}
                            value={filterUserTypeMethod}
                            size="small"
                            onChange={handleChangeFilterUserType}
                        >
                            <MenuItem style={{fontSize: '14px'}} value={10}>사용자아이디</MenuItem>
                            <MenuItem style={{fontSize: '14px'}} value={20}>사용자명</MenuItem>
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

              <FormControl sx={{
                  minWidth: '300px',
                  '& .MuiInputBase-root': {
                      height: '33px'
                  },
                  '& .MuiOutlinedInput-root': {
                      display: 'flex',
                      alignItems: 'center'
                  },
                  '& .MuiInputLabel-root': {
                      top: -6,
                      '&.MuiInputLabel-shrink': {
                          top: 0
                      }
                  }
              }} variant="outlined">
                <InputLabel id='keywordLabel' size="small" sx={{
                    fontSize: '14px',
                    marginTop:"3px"
                }}>
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
                            <ClearIcon 
                                onClick={handleClickDeleteKeyword}
                                sx={{ cursor: 'pointer' }}
                            />
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

            <Button 
                variant="outlined" 
                style={{
                    backgroundColor:"green", 
                    height:"33px",
                    color:"white",
                    marginRight: "10px",
                    fontSize: '14px'
                }}
                onClick={handleOpen}
            >
                등록
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

        {/* Backdrop 컴포넌트 추가 */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
          open={loading}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6" component="div">
            사용자 정보를 불러오는 중입니다.
          </Typography>
        </Backdrop>

        <Dialog 
          open={open} 
          onClose={handleClose}
          maxWidth="md" 
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
              <PersonAddIcon />
              <Typography 
                component="span"
                sx={{ 
                  fontSize: '1.25rem',
                  fontWeight: 'bold'
                }}
              >
              사용자 등록
            </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent 
            sx={{ 
              p: 3,
              flex: '1 1 auto',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} style={{marginTop:"10px", marginLeft:"-15px"}}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="사용자 아이디"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setIsIdChecked(false);
                  }}
                  fullWidth
                  required
                  size="small"
                      sx={{ fontSize: '13px' }}
                />
                <Button 
                  variant="contained"
                  onClick={handleIdCheck}
                      sx={{ 
                        minWidth: '100px',
                        backgroundColor: isIdChecked ? '#4caf50' : undefined
                      }}
                >
                      {isIdChecked ? '확인완료' : '중복확인'}
                </Button>
              </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>사용자 타입</InputLabel>
                    <Select
                      value={userType}
                      label="사용자 타입"
                      onChange={(e) => setUserType(e.target.value)}
                    >
                      <MenuItem value="A">총괄관리자</MenuItem>
                      <MenuItem value="M">어드민</MenuItem>
                      <MenuItem value="N">일반사용자</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
              <TextField
                label="사용자명"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                fullWidth
                required
                size="small"
                  />
                </Grid>
              </Grid>
            </Box>

            <Box
              sx={{
                flex: '1 1 auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderBottom: '1px solid #e0e0e0',
                  flex: '0 0 auto'
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <FolderIcon sx={{ fontSize: 20 }} />
                  메뉴 권한 설정
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  p: 2,
                  backgroundColor: '#fafafa',
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px'
                  }
                }}
              >
                <MenuAuthSection 
                  menuItems={menuAuth} 
                  onMenuChange={handleMenuAuthChange} 
                />
              </Box>
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
              onClick={handleClose}
              variant="outlined"
              startIcon={<CancelIcon />}
            >
              취소
            </Button>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              등록
            </Button>
          </DialogActions>
        </Dialog>

        {/* 수정 다이얼로그 추가 */}
        <Dialog 
          open={openEditDialog} 
          onClose={handleCloseEditDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              maxHeight: '90vh',
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              backgroundColor: '#1976d2',
              color: 'white',
              p: 2,
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1 
            }}>
              <EditIcon />
              <Typography 
                component="span"
                sx={{ 
                  fontSize: '1.25rem',
                  fontWeight: 'bold'
                }}
              >
                사용자 정보 수정
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent 
            sx={{ 
              p: 3,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
            }}
          >
            <Stack 
              spacing={3} 
              sx={{ 
                position: 'relative',
              }}
            >
              <Grid container spacing={2} style={{marginTop:"10px", marginLeft:"-15px"}}>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="사용자 아이디"
                    value={editUserId}
                    disabled
                    fullWidth
                    size="small"
                    sx={{ fontSize: '13px' }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" required>
                    <InputLabel>사용자 타입</InputLabel>
                <Select
                      value={editUserType}
                  label="사용자 타입"
                      onChange={(e) => setEditUserType(e.target.value)}
                    >
                      <MenuItem value="A">총괄관리자</MenuItem>
                      <MenuItem value="M">어드민</MenuItem>
                      <MenuItem value="N">일반사용자</MenuItem>
                </Select>
              </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="사용자명"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    fullWidth
                    required
                    size="small"
                  />
                </Grid>
              </Grid>

              <MenuAuthSection 
                menuItems={editMenuAuth} 
                onMenuChange={handleEditMenuAuthChange} 
              />
            </Stack>
          </DialogContent>

          <DialogActions 
            sx={{ 
            p: 2,
              backgroundColor: '#f5f5f5',
            borderTop: '1px solid #ddd',
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
            }}
          >
            <Button 
              onClick={handleCloseEditDialog}
              variant="outlined"
              startIcon={<CancelIcon />}
            >
              취소
            </Button>
            <Button 
              onClick={handleEdit}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              수정
            </Button>
          </DialogActions>
        </Dialog>

      </div>
    );
}
