'use client';

import React from "react";
import { DataGrid, GridToolbar, GridRowsProp, GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, gridClasses} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { alpha, styled } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
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
    const [pointList, setPointList] = React.useState([]);
    const [filterPointList, setFilterPointList] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState({

        contentID : '',
        contentTitle : '',
    
    });

    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('-1');
    const [filterKeywordTypeMethod, setFilterKeywordTypeMethod] = React.useState(10);
    const [filterKeywordTypeValueMethod, setFilterKeywordTypeValueMethod] = React.useState('');

    const page_info = 'Home > 포인트관리 > 포인트 사용내역';

    const [openDialog, setOpenDialog] = React.useState(false);

    // 날짜 선택을 위한 state를 당일로 초기화
    const [fromDate, setFromDate] = React.useState(dayjs());

    const [isLoading, setIsLoading] = React.useState(false);

    // 요약 정보 계산을 위한 상태 추가
    const [summary, setSummary] = React.useState({
        totalPoints: 0,
        totalCount: 0,
        uniqueUsers: 0,
        purchaseCount: 0,
        cancelCount: 0
    });

    React.useEffect(()=>{
  
      try{

          if (ref_Div.current) {

            const offsetHeight = ref_Div.current.offsetHeight;
            const offsetWidth = ref_Div.current.offsetWidth;
            
            console.log('Height:', offsetHeight, 'Width:', offsetWidth);

            ref_Grid.current = offsetHeight - 0;

            get_RewardInfo();

          }

      }catch(error){

        console.error('Error getting dimensions:', error);

      }

    },[]);

    React.useEffect(()=>{

    },[pointList]);

    React.useEffect(()=>{

    },[filterPointList]);

    React.useEffect(()=>{

      get_RewardInfo();

    },[fromDate]);

    // pointList가 업데이트될 때마다 요약 정보 계산
    React.useEffect(() => {
        const newSummary = pointList.reduce((acc, curr) => {
            acc.totalCount += 1;
            acc.totalPoints += Number(curr.po_point);
            
            if (curr.point_type == '3') {
                acc.purchaseCount += 1;
            } else if (curr.point_type == '4') {
                acc.cancelCount += 1;
            }
            
            return acc;
        }, {
            totalPoints: 0,
            totalCount: 0,
            purchaseCount: 0,
            cancelCount: 0
        });
        
        // 고유 사용자 수 계산
        const uniqueUsers = new Set(pointList.map(item => item.mb_id)).size;
        newSummary.uniqueUsers = uniqueUsers;
        
        setSummary(newSummary);
    }, [pointList]);

    const get_RewardInfo = async() => {

      try{

        setIsLoading(true);

        const filterInfo = filterContentTypeValueMethod;

        const response = await fetch('/api/point/pointList', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({ pagingIdx, filterInfo, 
            
            fromDate: fromDate.subtract(1,'day'),
            toDate: fromDate.add(1,'day') }),
        
        });

        const data = await response.json(); 
  

        if (response.ok) {

          setPointList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));

          setFilterPointList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
          
        } else {
  
          alert(data.message);
        
        }

      }catch(error){

        console.log(error);

      }finally {
        setIsLoading(false);
      }

    };
  
    const handleChangeFilterContentType = (event: SelectChangeEvent<number>) => {

        try{

          setFilterContentTypeMethod(Number(event.target.value)); 

          switch(event.target.value){

            case 10:{
              setFilterContentTypeValueMethod('-1');
            }break;
            case 20:{
              setFilterContentTypeValueMethod('3');
            }break;
            case 30:{
              setFilterContentTypeValueMethod('4');
            }break;

          }

        }catch(error){

            console.log(error);

        }
    };

    const handleChangeFilterKeywordType = (event: SelectChangeEvent<number>) => {

      try{

        setFilterKeywordTypeMethod(Number(event.target.value));

        switch(event.target.value){

          case 10:{
            setFilterKeywordTypeValueMethod('id');
          }break;
          case 20:{
            setFilterKeywordTypeValueMethod('key');
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

        let filteredList = [...pointList];

        if(filterContentTypeValueMethod != '-1'){

          if(filterInfo.length > 0){

            switch(filterKeywordTypeValueMethod){

              case 'id':{
                filteredList = filteredList.filter((data) => data.mb_id.includes(filterInfo) && data.point_type == filterContentTypeValueMethod)
                  .map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
              case 'key':{
                  filteredList = filteredList.filter((data) => data.po_content.includes(filterInfo) && data.point_type == filterContentTypeValueMethod)
                  .map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
              default:{
                filteredList = filteredList.filter((data) =>  data.point_type == filterContentTypeValueMethod).map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
            
            }

          }else{

            filteredList = filteredList.filter((data) =>  data.point_type == filterContentTypeValueMethod)
            .map((data, idx) => ({ ...data, id: idx + 1 }));

          } 
       
        }else{

          if(filterInfo.length > 0){

            switch(filterKeywordTypeValueMethod){

              case 'id':{
                filteredList = filteredList.filter((data) => data.mb_id.includes(filterInfo))
                  .map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
              case 'key':{
                  filteredList = filteredList.filter((data) => data.po_content.includes(filterInfo))
                  .map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
              default:{
                filteredList = filteredList.map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
            
            }

          }else{

            filteredList = filteredList.map((data, idx) => ({ ...data, id: idx + 1 }));

          } 
          
        }

        setFilterPointList(filteredList.map((data, idx) => ({ ...data, id: idx + 1 })));
        
      } catch(error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }

    };

    const handleOpenDialog = () => {
      
      try {
       
        setOpenDialog(true);

      } catch(error) {

        console.log(error);
      
      }
    
    };

    const handleCloseDialog = () => {
        
        try{

          setOpenDialog(false);


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
          flex: 0.2,             
          disableColumnMenu: true, 
      },
      {
          field: 'mb_id',
          headerName: '유저 아이디',
          type: 'string',
          flex: 0.5,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'point_type_text',
          headerName: '제공유형',
          type: 'string',
          flex: 0.5,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'po_content',
          headerName: '구매상품명',
          type: 'string',
          flex: 2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'po_point',
          headerName: '사용 포인트(P)',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
          valueFormatter: (params) => {
              if (params == null) return '';
              // @ts-ignore
              return params.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          },
      },
      {
          field: 'po_datetime',
          headerName: '제공일',
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
                          setSelectedContent(filterPointList[params.row.id - 1]);
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
              포인트 사용내역 (User ➞ 기프트샵)
          </Typography>
      </div>

      {/* Summary 정보 영역 추가 */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '5px', marginBottom: '15px' }}>
          <Paper elevation={3} sx={{ 
              flex: 1, 
              p: 2, 
              bgcolor: '#ffffff', 
              borderRadius: 2,
              border: '1px solid #e0e0e0'
          }}>
              <Typography sx={{fontSize: "14px", color: "#666", marginBottom: "8px"}}>총 사용 포인트</Typography>
              <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                  {summary.totalPoints.toLocaleString()}P
              </Typography>
          </Paper>
          <Paper elevation={3} sx={{ 
              flex: 1, 
              p: 2, 
              bgcolor: '#ffffff', 
              borderRadius: 2,
              border: '1px solid #e0e0e0'
          }}>
              <Typography sx={{fontSize: "14px", color: "#666", marginBottom: "8px"}}>총 이용수</Typography>
              <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                  {summary.totalCount.toLocaleString()}회
              </Typography>
          </Paper>
          <Paper elevation={3} sx={{ 
              flex: 1, 
              p: 2, 
              bgcolor: '#ffffff', 
              borderRadius: 2,
              border: '1px solid #e0e0e0'
          }}>
              <Typography sx={{fontSize: "14px", color: "#666", marginBottom: "8px"}}>이용자 수</Typography>
              <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                  {summary.uniqueUsers.toLocaleString()}명
              </Typography>
          </Paper>
          <Paper elevation={3} sx={{ 
              flex: 1, 
              p: 2, 
              bgcolor: '#ffffff', 
              borderRadius: 2,
              border: '1px solid #e0e0e0'
          }}>
              <Typography sx={{fontSize: "14px", color: "#666", marginBottom: "8px"}}>기프트콘 구매</Typography>
              <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                  {summary.purchaseCount.toLocaleString()}건
              </Typography>
          </Paper>
          <Paper elevation={3} sx={{ 
              flex: 1, 
              p: 2, 
              bgcolor: '#ffffff', 
              borderRadius: 2,
              border: '1px solid #e0e0e0'
          }}>
              <Typography sx={{fontSize: "14px", color: "#666", marginBottom: "8px"}}>기프트콘 구매취소</Typography>
              <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                  {summary.cancelCount.toLocaleString()}건
              </Typography>
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
            
            <div style={{display:"flex", float:"left", alignItems:'center'}}>
              <Typography sx={{fontSize:"14px", color: '#1f1f26', marginRight:"10px"}}>
                조회기간
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <DatePicker 
                    value={fromDate}
                    onChange={(newValue) => {
                      
                      setFromDate(newValue);

                    }}
                    format="YYYY-MM-DD"
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        sx: { 
                          backgroundColor: 'white',
                          width: '150px'
                        }
                      } 
                    }}
                  />
                </div>
              </LocalizationProvider>
            </div>


            <div style={{display:"flex", float:"left", marginLeft:"auto", alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                
                <div style={{display:"flex", float:"left", alignContent:'center', alignItems:'center', justifyContent:'center'}}>

                    <Typography sx={{fontSize:"14px",  color: '#1f1f26', marginLeft:"0px", }}>
                        사용구분
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
                        <MenuItem style={{fontSize:13}} value={20}>기프트콘 구매</MenuItem>
                        <MenuItem style={{fontSize:13}} value={30}>기프트콘 구매취소</MenuItem>

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
                        style={{color:'black'}}
                        value={filterKeywordTypeMethod}
                        size="small"
                        onChange={handleChangeFilterKeywordType}
                        >
                        <MenuItem style={{fontSize:13}} value={10}>유저아이디</MenuItem>
                        <MenuItem style={{fontSize:13}} value={20}>구매상품명</MenuItem>

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

                rows={filterPointList}
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

        {/* 로딩 Backdrop 추가 */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6" color="inherit">포인트 사용내역을을 불러오는 중입니다</Typography>
        </Backdrop>

    </div>

  );
}
