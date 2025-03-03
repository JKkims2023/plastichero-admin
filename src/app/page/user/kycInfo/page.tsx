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

export default function Home() {

    const ref_Div = React.useRef<HTMLDivElement>(null);
    const ref_Grid = React.useRef(0);
    const ref_SelectedContent = React.useRef(null);
    const ref_SelectedFiles = React.useRef([]);

    const [pagingIdx, setPaginIdx] = React.useState('0');
    const [filterInfo, setFilterInfo] = React.useState('');
    const [kycList, setKycList] = React.useState([]);
    const [filterKycList, setFilterKycList] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState<KYCContent>({
      kyc_path: '',
      kyc_path2: '',
      kyc_path3: '',
      kyc_name: '',
      kyc_birth: '',
      approval_yn: '',
      // ... other fields
    });

    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('');
    const [filterKycTypeMethod, setFilterKycTypeMethod] = React.useState(10);
    const [filterKycTypeValueMethod, setFilterKycTypeValueMethod] = React.useState('');
    const [stateBottom, setStateBottom] = React.useState(false);

    const [file, setFile] = React.useState(null);
    const [message, setMessage] = React.useState('');

    const [doneCount, setDoneCount] = React.useState('0');
    const [waitCount, setWaitCount] = React.useState('0');

    const page_info = 'Home > 회원관리 > KYC 정보 관리';

    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedFiles, setSelectedFiles] = React.useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [imageLoadError, setImageLoadError] = React.useState<boolean>(false);

    // 승인 상태 관리를 위한 state 추가
    const [approvalStatus, setApprovalStatus] = React.useState('');
    const [approvalComment, setApprovalComment] = React.useState('');

    const [loading, setLoading] = React.useState(false);

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

    },[kycList]);

    React.useEffect(()=>{

    },[filterKycList]);

    const get_UserInfo = async() => {

      try{
        setLoading(true);  // 로딩 시작

        const filterInfo = filterContentTypeValueMethod;

        const response = await fetch('/api/user/kycInfo', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({ pagingIdx, filterInfo }),
        
        });
  
        const data = await response.json(); 
  
        if (response.ok) {

          setDoneCount(data.result_data.filter((data) => data.approval_yn == 'Y' || data.approval_yn == 'N').length);
          setWaitCount(data.result_data.filter((data) => data.approval_yn === 'W').length);

          setKycList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));

          setFilterKycList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
          
        } else {
  
          alert(data.message);
        
        }

      }catch(error){

        console.log(error);

      } finally {
        setLoading(false);  // 로딩 종료
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
              setFilterContentTypeValueMethod('');
            }break;
            case 20:{
              setFilterContentTypeValueMethod('W');
            }break;
            case 30:{
              setFilterContentTypeValueMethod('Y');
            }break;
            case 40:{
              setFilterContentTypeValueMethod('N');
            }break;

          }

        }catch(error){

            console.log(error);

        }
    };

    const handleChangeFilterKycType = (event: SelectChangeEvent<number>) => {

      try{

        setFilterKycTypeMethod(Number(event.target.value));

        switch(event.target.value){

          case 10:{
            setFilterKycTypeValueMethod('mb_id');
          }break;
          case 20:{
            setFilterKycTypeValueMethod('kyc_type');
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
        setLoading(true);  // 로딩 시작
        
        if(filterInfo.length > 0){

          switch(filterContentTypeValueMethod){

            case 'id':{
              setFilterKycList(kycList.filter((user) => user.mb_id.includes(filterInfo))
                .map((user, idx) => ({ ...user, id: idx + 1 })));
            }break;
            case 'name':{
              setFilterKycList(kycList.filter((user) => user.mb_name.includes(filterInfo))
                .map((user, idx) => ({ ...user, id: idx + 1 })));
            }break;
            case 'email':{
              setFilterKycList(kycList.filter((user) => user.mb_email.includes(filterInfo))
                .map((user, idx) => ({ ...user, id: idx + 1 })));
            }break;
            case 'wallet':{
              setFilterKycList(kycList.filter((user) => user.mb_wallet.includes(filterInfo))
                .map((user, idx) => ({ ...user, id: idx + 1 })));
            }break;
            default:{
              setFilterKycList(kycList.map((user, idx) => ({ ...user, id: idx + 1 })));
            }break;
          
          }

        }else{

          switch(filterContentTypeValueMethod){

            case '':{
              setFilterKycList(kycList.map((data, idx) => ({ ...data, id: idx + 1 })));
            }break;
            case 'W':{
              setFilterKycList(kycList.filter((data) => data.approval_yn === 'W')
                .map((data, idx) => ({ ...data, id: idx + 1 })));
            }break;
            case 'Y':{
              setFilterKycList(kycList.filter((data) => data.approval_yn === 'Y')
                .map((data, idx) => ({ ...data, id: idx + 1 })));
            }break;
            case 'N':{
              setFilterKycList(kycList.filter((data) => data.approval_yn === 'N')
                .map((data, idx) => ({ ...data, id: idx + 1 })));
            }break;
            default:{
              setFilterKycList(kycList.map((data, idx) => ({ ...data, id: idx + 1 })));
            }break;
          
          }


        } 
        
      }catch(error){

        console.log(error);

      } finally {
        setLoading(false);  // 로딩 종료
      }

    };

    // 데이터 매칭 및 이미지 경로 검증 함수
    const validateAndProcessImagePaths = (content: KYCContent) => {
      // 데이터 로깅을 통한 디버깅
      console.log('Selected content:', content);
      
      const paths = [ref_SelectedContent.current.kyc_path, ref_SelectedContent.current.kyc_path2, ref_SelectedContent.current.kyc_path3]
        .filter(path => {
          // null, undefined, 빈 문자열 체크
          if (!path || path.trim() === '') {
            console.log('Filtered out empty path');
            return false;
          }
          /*
          // 경로 형식 검증
          const isValidPath = path.match(/\.(jpg|jpeg|png|gif)$/i);
          if (!isValidPath) {
            console.log('Invalid image path:', path);
            return false;
          }
          */
          return true;
        })
        .map(path => {
          // 경로 정규화
          const normalizedPath = path.startsWith('/') ? path : path;
          console.log('Normalized path:', normalizedPath);
          return normalizedPath;
        });

      console.log('Validated paths:', paths);
      return paths;
    };

    // Grid에서 행 선택 시 호출되는 함수
    const handleRowClick = (params: any) => {
      try {
        // 데이터 매칭 확인을 위한 로깅
        console.log('Selected row data:', params.row);
        
        // 선택된 데이터 상태 업데이트
        setSelectedContent(params.row);

        ref_SelectedContent.current = params.row;
        
        // 이미지 경로 초기화
        setSelectedFiles([]);
        ref_SelectedFiles.current = [];
        setCurrentImageIndex(0);
        setImageLoadError(false);
      } catch (error) {
        console.error('Row selection error:', error);
      }
    };

    // Dialog 열기 함수 개선
    const handleOpenDialog = () => {
      
      try {
      
        console.log('Opening dialog with content:', selectedContent);
        
        // 이미지 경로 검증
        const validPaths = validateAndProcessImagePaths(selectedContent);
        
        if (validPaths.length === 0) {
          alert('표시할 이미지가 없습니다.');
          return;
        }

        // 상태 업데이트를 순차적으로 처리
        setSelectedFiles(validPaths);
        ref_SelectedFiles.current = validPaths;
        setCurrentImageIndex(0);
        setImageLoadError(false);
        setOpenDialog(true);

      } catch(error) {

        console.error('Dialog open error:', error);
        alert('이미지를 불러오는 중 오류가 발생했습니다.');
      
      }
    
    };

    const handleCloseDialog = () => {
        
        try{

          setOpenDialog(false);

          ref_SelectedFiles.current = [];

          setSelectedFiles([]);
          setCurrentImageIndex(0);

        }catch(error){

          console.log(error);
        
        }

    };

    // 이미지 URL을 가져오는 함수를 수정
    const getImageUrl = (imagePath: string) => {
      // 이미 완전한 URL인 경우 그대로 반환
      if (imagePath.startsWith('http') || imagePath.startsWith('https')) {

        console.log('imagePath:', imagePath);

        return imagePath;
      }

      console.log('imagePath:', imagePath);
      console.log('JK why?');

      // 상대 경로인 경우 기본 URL과 결합
      return `/uploads${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
    };

    // ImageDisplay 컴포넌트 수정
    const ImageDisplay = () => {
      if (ref_SelectedFiles.current.length === 0) {
        return <div>No images available</div>;
      }

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{
            position: 'relative',
            width: '100%',
            height: '400px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#000',
          }}>
            <img 
              src={getImageUrl(ref_SelectedFiles.current[currentImageIndex])}
              alt={`KYC 문서 ${currentImageIndex + 1}`}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain' 
              }}
              onError={(e) => {
                console.error('Image load error:', ref_SelectedFiles.current[currentImageIndex]);
                setImageLoadError(true);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {imageLoadError && (
              <Typography sx={{ color: 'white' }}>
                이미지를 불러올 수 없습니다.
              </Typography>
            )}
            
            {ref_SelectedFiles.current.length > 1 && (
              <>
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    left: 10,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  }}
                  onClick={() => {
                    setCurrentImageIndex(prev => 
                      prev === 0 ? ref_SelectedFiles.current.length - 1 : prev - 1
                    );
                    setImageLoadError(false);
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    right: 10,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  }}
                  onClick={() => {
                    setCurrentImageIndex(prev => 
                      prev === ref_SelectedFiles.current.length - 1 ? 0 : prev + 1
                    );
                    setImageLoadError(false);
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </>
            )}
          </Box>

          {/* 페이징 인디케이터 추가 */}
          <Box sx={{ 
            mt: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 1
          }}>
            {/* 현재 페이지 표시 */}
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {`${currentImageIndex + 1} / ${ref_SelectedFiles.current.length}`}
            </Typography>
            
            {/* 도트 인디케이터 */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              justifyContent: 'center'
            }}>
              {ref_SelectedFiles.current.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setImageLoadError(false);
                  }}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: index === currentImageIndex ? 'primary.main' : 'grey.300',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      bgcolor: index === currentImageIndex ? 'primary.dark' : 'grey.400',
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      );
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
          field: 'mb_id',
          headerName: '유저 아이디',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'reg_date',
          headerName: 'KYC 요청일',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'approval_yn_text',
          headerName: '상태',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
          cellClassName: (params) => {
              if (params.row.approval_yn === 'W') return 'status-waiting';
              if (params.row.approval_yn === 'Y') return 'status-approved';
              if (params.row.approval_yn === 'N') return 'status-rejected';
              return '';
          },
      },
      {
          field: 'kyc_type',
          headerName: '유형',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'kyc_path',
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

                          ref_SelectedContent.current = filterKycList[params.row.id - 1];

                          setSelectedContent(filterKycList[params.row.id - 1]);

                          handleOpenDialog();
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

    return (

      <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

        <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

            <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

        </div>

        <div style={{}}>
            <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
                KYC 정보 관리
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
              
            <Typography sx={{fontSize:"14px",  color: '#1f1f26', marginLeft:"10px", }}>
                총 요청수 : {kycList.length}
            </Typography>
            
            <Typography sx={{fontSize:"14px",  color: '#1f1f26', marginLeft:"30px", }}>
              처리완료 : {doneCount}  /  처리대기 : {waitCount}
            </Typography>
          
            <div style={{display:"flex", float:"left", marginLeft:"auto", alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                  
                <div style={{display:"flex", float:"left", alignContent:'center', alignItems:'center', justifyContent:'center'}}>

                    <Typography sx={{fontSize:"14px",  color: '#1f1f26', marginLeft:"0px", }}>
                        처리상태
                    </Typography>
                    
                    <FormControl fullWidth  style={{ width:"110px",marginTop:"0px", marginLeft:"8px", backgroundColor:'white', color:'black'}}>
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
                        <MenuItem style={{fontSize:13}} value={20}>승인대기</MenuItem>
                        <MenuItem style={{fontSize:13}} value={30}>승인완료</MenuItem>
                        <MenuItem style={{fontSize:13}} value={40}>승인거부</MenuItem>

                        </Select>
                    </FormControl>
                </div>
            </div>

            <div style={{display:"flex", float:"left", marginLeft:"0px", alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                  
                <div style={{display:"flex", float:"left"}}>

                    <FormControl fullWidth  style={{ width:"110px",marginTop:"0px", marginLeft:"5px", backgroundColor:'white', color:'black'}}>
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
                        value={filterKycTypeMethod}
                        size="small"
                        onChange={handleChangeFilterKycType}
                        >
                        <MenuItem style={{fontSize:13}} value={10}>유저아이디</MenuItem>
                        <MenuItem style={{fontSize:13}} value={20}>유형</MenuItem>

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
                marginRight:"5px",
                fontSize: '14px'
              }}  
              onClick={handleClickSearch}
            >
              검색
            </Button>

        </div>

        <div ref={ref_Div} style={{flex:1, height:'100%', marginTop:'0px', paddingLeft:"0px",}}>

          <StripedDataGrid 

            rows={filterKycList}
            columns={columns}
            autoHeight={true}
            onRowClick={handleRowClick}

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

        <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            aria-labelledby="kyc-dialog-title"
            keepMounted={false}
            disablePortal={false}
        >
            <DialogTitle id="kyc-dialog-title">
                <Box>
                    <Typography variant="h6">KYC 정보 확인</Typography>
                    {selectedContent && (
                        <Typography 
                            variant="subtitle2" 
                            color="textSecondary"
                            sx={{ mt: 1 }}
                        >
                            {`${selectedContent.kyc_name} - ${selectedContent.kyc_birth}`}
                        </Typography>
                    )}
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body1">
                                이름: {selectedContent?.kyc_name || '-'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1">
                                생년월일: {selectedContent?.kyc_birth || '-'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                
                <ImageDisplay />
                
                <FormControl fullWidth sx={{ mb: 2, marginTop: "15px" }}>
                    <InputLabel id="approval-status-label">처리상태</InputLabel>
                    <Select
                        labelId="approval-status-label"
                        id="approval-status-select"
                        value={approvalStatus}
                        onChange={(e) => setApprovalStatus(e.target.value)}
                        label="처리상태"
                    >
                        <MenuItem value="Y">승인</MenuItem>
                        <MenuItem value="N">거부</MenuItem>
                    </Select>
                </FormControl>
                
                <TextField
                    id="approval-comment"
                    fullWidth
                    label="승인/거부 사유"
                    multiline
                    rows={3}
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={handleCloseDialog}
                    tabIndex={0}
                >
                    취소
                </Button>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => {
                        handleCloseDialog();
                    }}
                    tabIndex={0}
                >
                    확인
                </Button>
            </DialogActions>
        </Dialog>

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
            KYC 정보를 불러오는 중입니다.
          </Typography>
        </Backdrop>

      </div>
    );
}
