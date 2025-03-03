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
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { 

    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
    GridPagination
} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';

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

    const page_info = 'Home > 포인트관리 > 포인트 전환내역';

    const [openDialog, setOpenDialog] = React.useState(false);

    const [fromDate, setFromDate] = React.useState(dayjs());

    const [isLoading, setIsLoading] = React.useState(false);

    const [summaryInfo, setSummaryInfo] = React.useState({

        totalConvertedPoint: 0,
        totalDeductedPoint: 0,
        totalTransactions: 0,
        totalUsers: 0
    });

    React.useEffect(()=>{
  
      try{

          if (ref_Div.current) {

            const offsetHeight = ref_Div.current.offsetHeight;
            const offsetWidth = ref_Div.current.offsetWidth;
            
            console.log('Height:', offsetHeight, 'Width:', offsetWidth);

            ref_Grid.current = offsetHeight - 0;

            get_SwapInfo();

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

      get_SwapInfo();

    },[fromDate]);

    const get_SwapInfo = async() => {

      try{

        setIsLoading(true);

        const filterInfo = filterContentTypeValueMethod;

        const response = await fetch('/api/point/swapList', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({ pagingIdx, 
            
            fromDate: fromDate.subtract(1,'day'),
            toDate: fromDate.add(1,'day') }),
        
        });

        const data = await response.json(); 
  

        if (response.ok) {

          setPointList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));

          setFilterPointList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
          
          // 합계 계산
          const totalConvertedPoint = data.result_data.reduce((sum, item) => sum + Number(item.po_point), 0);
          const totalDeductedPoint = data.result_data.reduce((sum, item) => sum + Number(item.swap_pth), 0);
          const totalTransactions = data.result_data.length;
          const uniqueUsers = new Set(data.result_data.map(item => item.mb_id)).size;
          
          setSummaryInfo({
              totalConvertedPoint,
              totalDeductedPoint,
              totalTransactions,
              totalUsers: uniqueUsers
          });

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
              setFilterContentTypeValueMethod('1');
            }break;
            case 30:{
              setFilterContentTypeValueMethod('6');
            }break;
            case 40:{
              setFilterContentTypeValueMethod('7');
            }break;
            case 50:{
              setFilterContentTypeValueMethod('0');
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

        console.log('handleClickSearch inside');

        console.log(filterInfo);

        console.log(filterContentTypeValueMethod);

        let filteredList = [...pointList];

        if(filterContentTypeValueMethod != '-1'){

          if(filterInfo.length > 0){

            switch(filterKeywordTypeValueMethod){

              case 'id':{
                filteredList = filteredList.filter((data) => data.mb_id.includes(filterInfo) && data.point_type == filterContentTypeValueMethod)
                  .map((data, idx) => ({ ...data, id: idx + 1 }));
              }break;
              case 'key':{
                  filteredList = filteredList.filter((data) => data.po_rel_action.includes(filterInfo) && data.point_type == filterContentTypeValueMethod)
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
                  filteredList = filteredList.filter((data) => data.po_rel_action.includes(filterInfo))
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
          field: 'po_rel_action',
          headerName: '링크키',
          type: 'string',
          flex: 1.5,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'swap_pth',
          headerName: '차감수량(PTH)',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
          valueFormatter: (params) => {
            //@ts-ignore
            if (!params && params !== 0) return '';

            //@ts-ignore
            return params.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
      },
      {
          field: 'po_point',
          headerName: '전환수량(P)',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
          valueFormatter: (params) => {

              //@ts-ignore
              if (!params && params !== 0) return '';

              //@ts-ignore
              return params.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          },
      },
      {
          field: 'po_datetime',
          headerName: '전환일시',
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
                  포인트 전환내역 (PTH ➞ POINT)
              </Typography>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginTop: "10px",
            marginBottom: "20px"
          }}>
            <div style={{
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <Typography sx={{fontSize: "14px", color: "#666", marginBottom: "8px"}}>
                총 전환 포인트
              </Typography>
              <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                {summaryInfo.totalConvertedPoint.toLocaleString()} P
              </Typography>
            </div>
            <div style={{
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <Typography sx={{fontSize: "14px", color: "#666", marginBottom: "8px"}}>
                총 차감 포인트
              </Typography>
              <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                {summaryInfo.totalDeductedPoint.toLocaleString()} PTH
              </Typography>
            </div>
            <div style={{
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <Typography sx={{fontSize: "14px", color: "#666", marginBottom: "8px"}}>
                총 전환 수
              </Typography>
              <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                {summaryInfo.totalTransactions.toLocaleString()}건
              </Typography>
            </div>
            <div style={{
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <Typography sx={{fontSize: "14px", color: "#666", marginBottom: "8px"}}>
                이용 유저 수
              </Typography>
              <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                {summaryInfo.totalUsers.toLocaleString()}명
              </Typography>
            </div>
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
                            제공유형
                        </Typography>
                        
                        <FormControl fullWidth style={{ width:"110px", marginTop:"0px", marginLeft:"8px", backgroundColor:'white', color:'black'}}>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                sx={{
                                    color:'black',
                                    height: '33px',
                                    '& .MuiSelect-select': {
                                        height: '33px',
                                        padding: '0 14px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }
                                }}
                                value={filterContentTypeMethod}
                                size="small"
                                onChange={handleChangeFilterContentType}
                            >
                                <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                                <MenuItem style={{fontSize:13}} value={20}>유저 아이디</MenuItem>
                                <MenuItem style={{fontSize:13}} value={30}>유저명</MenuItem>
                                <MenuItem style={{fontSize:13}} value={40}>이메일</MenuItem>
                                <MenuItem style={{fontSize:13}} value={50}>지갑주소</MenuItem>
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
                            value={filterKeywordTypeMethod}
                            size="small"
                            onChange={handleChangeFilterKeywordType}
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
            <Typography variant="h6" color="inherit">포인트 전환내역을을 불러오는 중입니다</Typography>
          </Backdrop>

      </div>

    );
}
