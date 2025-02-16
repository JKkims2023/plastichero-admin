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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


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
    const ref_SelectedFiles = React.useRef([]);

    const [pagingIdx, setPaginIdx] = React.useState('0');
    const [filterInfo, setFilterInfo] = React.useState('');
    const [kycList, setKycList] = React.useState([]);
    const [filterKycList, setFilterKycList] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState({

        contentID : '',
        contentTitle : '',
    
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

    // 승인 상태 관리를 위한 state 추가
    const [approvalStatus, setApprovalStatus] = React.useState('');
    const [approvalComment, setApprovalComment] = React.useState('');

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
      
      try{


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

      }

    };

    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!file) {
        setMessage('Please select a file.');
        return;
      }
  
      const formData = new FormData();
      formData.append('excelFile', file); // 'excelFile'은 API Route에서 사용하는 필드 이름
  
      try {
        const response = await fetch('/api/excel', {
          method: 'POST',
          body: formData,
        });
  
        const data = await response.json();
        setMessage(data.message);
  
      } catch (error) {
        console.error(error);
        setMessage('Error uploading file.');
      }
    };

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };

    const handleOpenDialog = () => {
      try {
        // 콤마로 구분된 파일 경로를 배열로 변환
        let filePathArray = [];

        //@ts-ignore
        if(selectedContent.kyc_path != ''){
          //@ts-ignore
          filePathArray.push(selectedContent.kyc_path);
        }
        //@ts-ignore
        if(selectedContent.kyc_path2 != ''){
          //@ts-ignore
          filePathArray.push(selectedContent.kyc_path2);
        } 
        //@ts-ignore
        if(selectedContent.kyc_path3 != ''){
          //@ts-ignore  
          filePathArray.push(selectedContent.kyc_path3);
        }        

        ref_SelectedFiles.current = filePathArray;

        setSelectedFiles(filePathArray);
        setCurrentImageIndex(0);
        setOpenDialog(true);

      } catch(error) {
        console.log(error);
      }
    };

    const handleCloseDialog = () => {
        
        try{

          setOpenDialog(false);

          setSelectedFiles([]);
          setCurrentImageIndex(0);

        }catch(error){

          console.log(error);
        
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


      <form style={{display:'none'}} onSubmit={handleSubmit}>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>

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
                      style={{color:'black'}}
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

          <div style={{display:"flex", float:"left", marginLeft:"20px", alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                
              <div style={{display:"flex", float:"left"}}>

                  <FormControl fullWidth  style={{ width:"110px",marginTop:"0px", marginLeft:"5px", backgroundColor:'white', color:'black'}}>
                      <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      style={{color:'black'}}
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
                    <ClearIcon onClick={handleClickDeleteKeyword} />
                  </InputAdornment>
                }
                label="키워드를 입력하세요"
              />
            </FormControl>
          </Box>
          <Button id="keyBtns" variant="outlined" style={{color:"white", backgroundColor:"#1f1f26", borderColor:"#CBCBCB" ,height:"33px" , marginRight:"10px"}}  onClick={handleClickSearch}>
            검색
          </Button>

      </div>

      <div ref={ref_Div} style={{flex:1, height:'100%', marginTop:'0px', paddingLeft:"0px",}}>

          <StripedDataGrid 

              rows={filterKycList}
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

                  '.MuiDataGrid-columnSeparator': {
                  display: 'none',
                  },
                  "& .MuiDataGrid-columnHeader": {
//                      backgroundColor: "#f0f0f0",
                      borderTopColor:"green",
                      borderBlockColor:"green",
                      color: "#000000",
                      fontSize:13.5,
                      fontFamily:'bold',
                      fontWeight: "bold",
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
                  '& .status-waiting': {
                      color: 'black'
                  },
                  '& .status-approved': {
                      color: 'blue'
                  },
                  '& .status-rejected': {
                      color: 'red'
                  },
              }}

              localeText={{
                  toolbarExportCSV: "CVS 파일 저장",
                  toolbarColumns: "헤더설정",
                  toolbarFilters: "내부필터링",
                  toolbarExport: "다운로드"
                  
              }}
              slotProps={{
                  toolbar: {
                      printOptions: { disableToolbarButton: true },
                      csvOptions: { disableToolbarButton: true },
                      
              }}}
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
      >
          <DialogTitle>KYC 정보 확인</DialogTitle>
          <DialogContent>
              {/* KYC 정보 영역 */}
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Grid 
                    container 
                    sx={{
                      '& .MuiGrid-item': {
                        position: 'relative',
                        padding: '10px',
                        '&:not(:last-child)::after': {
                          content: '""',
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0, 
                          height: '100%',
                          width: '1px',
                          backgroundColor: '#ddd'
                        }
                      }
                    }}
                  >
                      <Grid item xs={6}>
                          {/* @ts-ignore */}
                          <a  style={{fontSize:"14px", padding:'0px', margin:'0px'}}>이름 : {selectedContent.kyc_name}</a>
                      </Grid>
                      <Grid item xs={6}>
                          {/* @ts-ignore */}
                          <a  style={{fontSize:"14px", padding:'0px', margin:'0px'}}>생년월일 : {selectedContent.kyc_birth}</a>
                      </Grid>
                  </Grid>
              </Box>
              
              {/* 이미지 영역 */}
              <Box sx={{ 
                  width: '100%', 
                  height: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 2
              }}>
                  <Box sx={{
                      width: '100%',
                      height: '400px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: '#000',
                      position: 'relative'
                  }}>
                      {ref_SelectedFiles.current.length > 0 && (
                          <img 
                              src={ref_SelectedFiles.current[currentImageIndex]} 
                              alt={`KYC 문서 ${currentImageIndex + 1}`}
                              style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '100%', 
                                  objectFit: 'contain' 
                              }}
                          />
                      )}
                      {ref_SelectedFiles.current.length > 1 && (
                          <>
                              <IconButton 
                                  sx={{ 
                                      position: 'absolute', 
                                      left: 10,
                                      color: 'white',
                                      backgroundColor: 'rgba(0,0,0,0.3)',
                                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' }
                                  }}
                                  onClick={() => setCurrentImageIndex((prev) => 
                                      prev === 0 ? ref_SelectedFiles.current.length - 1 : prev - 1
                                  )}
                              >
                                  <ChevronLeftIcon />
                              </IconButton>
                              <IconButton 
                                  sx={{ 
                                      position: 'absolute', 
                                      right: 10,
                                      color: 'white',
                                      backgroundColor: 'rgba(0,0,0,0.3)',
                                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' }
                                  }}
                                  onClick={() => setCurrentImageIndex((prev) => 
                                      prev === ref_SelectedFiles.current.length - 1 ? 0 : prev + 1
                                  )}
                              >
                                  <ChevronRightIcon />
                              </IconButton>
                          </>
                      )}
                  </Box>
                  {ref_SelectedFiles.current.length > 1 && (
                      <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          mt: 1,
                          gap: 1
                      }}>
                          {ref_SelectedFiles.current.map((_, index) => (
                              <Box
                                  key={index}
                                  sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: currentImageIndex === index ? 'green' : 'grey.400',
                                      cursor: 'pointer'
                                  }}
                                  onClick={() => setCurrentImageIndex(index)}
                              />
                          ))}
                      </Box>
                  )}
              </Box>

              {/* 승인 관련 입력 영역 */}
              <FormControl fullWidth sx={{ mb: 2 , marginTop:"15px"}}>
                  <InputLabel>처리상태</InputLabel>
                  <Select
                      value={approvalStatus}
                      onChange={(e) => setApprovalStatus(e.target.value)}
                      label="처리상태"
                  >
                      <MenuItem value="Y">승인</MenuItem>
                      <MenuItem value="N">거부</MenuItem>
                  </Select>
              </FormControl>
              
              <TextField
                  fullWidth
                  label="승인/거부 사유"
                  multiline
                  rows={3}
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={handleCloseDialog}>취소</Button>
              <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                      // TODO: 승인/거부 처리 API 호출
                      handleCloseDialog();
                  }}
              >
                  확인
              </Button>
          </DialogActions>
      </Dialog>

    </div>
  );
}
