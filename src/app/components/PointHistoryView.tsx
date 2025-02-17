import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from 'next/image';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, gridClasses} from '@mui/x-data-grid';
import { FormControl, MenuItem } from '@mui/material';
import Paper from '@mui/material/Paper';

const ODD_OPACITY = 0.2;

import progressPath from '../../../public/progress.gif';

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

// @ts-ignore
const columns: GridColDef<(typeof rows)[number]>[] = [
  {   
      field: 'id', 
      headerName: 'No', 
      type: 'string',
      flex: 0.5,             // flex 값 조정
      disableColumnMenu: true, 
      headerAlign: 'center', // 헤더 정렬 추가
      align: 'center',       // 셀 정렬 추가
  },
  {
      field: 'po_datetime',
      headerName: '발생일',
      type: 'string',
      flex: 2.2,              // flex 값 조정
      disableColumnMenu: true,
      editable: false,
      headerAlign: 'center',
      align: 'center',
  },
  {
      field: 'po_content',
      headerName: '구분',
      type: 'string',
      flex: 3,              // flex 값 조정
      disableColumnMenu: true,
      editable: false,
      headerAlign: 'center',
      align: 'center',
  },
  {
    field: 'po_reward_type',
    headerName: '타입',
    type: 'string',
    flex: 1,             // flex 값 조정
    disableColumnMenu: true,
    editable: false,
    headerAlign: 'center',
    align: 'center',
  },
  {
      field: 'point_amount',
      headerName: '수량',
      type: 'string',
      flex: 1,           // flex 값 조정
      disableColumnMenu: true,
      editable: false,
      headerAlign: 'center',
      align: 'center',
  },
];

const PointInfoView = ({pointInfo}) => {

    const ref_Filter = useRef('0');
    const [pagingIdx, setPagingIdx] = useState(0);
    const [filterInfo, setFilterInfo] = useState('-1');
    const [pointList, setPointList] = useState([]);
    const [progressPoint, setProgressPoint] = useState(true);
    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('0');

    // Summary 정보 상태 추가
    const [summary, setSummary] = useState({
        totalCount: 0,
        swappedPoints: 0,
        swappedPTH: 0,
    });

    // Summary 정보를 업데이트하는 함수 추가
    const updateSummary = (data) => {
        setSummary({
            totalCount: data.length,
            swappedPoints: data.reduce((acc, item) => acc + (item.point_amount || 0), 0),
            swappedPTH: data.reduce((acc, item) => acc + (item.po_reward_type === 'PTH' ? item.point_amount : 0), 0),
        });
    };

    React.useEffect(()=>{


    },[]);

    React.useEffect(() => {

        if(pointInfo.mb_id !== undefined && pointInfo.mb_id !== null){

            get_PointHistory();

        }

    },[pointInfo]);

    React.useEffect(() => {

    },[pointList]);

    React.useEffect(() => {


    },[progressPoint]);


    const get_PointHistory = async() => {

        try{

          const mb_id = pointInfo.mb_id;

          setProgressPoint(true)

          const filterInfo = ref_Filter.current;

          const response = await fetch('/api/user/pointHistory', {
  
            method: 'POST',
            headers: {
            
              'Content-Type': 'application/json',
            
            },
            
            body: JSON.stringify({mb_id, pagingIdx, filterInfo }),
          
          });
    
          const data = await response.json(); 
    
          if (response.ok) {
    
            console.log('response success');
  
            // @ts-ignore
            const resultData = data.result_data.map((data, idx) => ({ id: idx + 1, ...data }));
            setPointList(resultData);
     //       updateSummary(resultData); // Summary 업데이트
            
          } else {
    
            alert(data.message);
          
          }

          setProgressPoint(false)
    
        }catch(error){
  
          console.log(error);

          setProgressPoint(false)
  
        }
    
    };

    
    const handleChangeFilterContentType = async(event: SelectChangeEvent<number>) => {

      try{

        setFilterContentTypeMethod(Number(event.target.value));
      
        switch(event.target.value){

          case 10:{
            setFilterContentTypeValueMethod('0');
            ref_Filter.current = '0';
          }break;
          case 20:{
            setFilterContentTypeValueMethod('1');
            ref_Filter.current = '1';
          }break;
          case 30:{
            setFilterContentTypeValueMethod('2');
            ref_Filter.current = '2';
          }break;
          case 40:{
            setFilterContentTypeValueMethod('3');
            ref_Filter.current = '3';
          }break;
          case 50:{
            setFilterContentTypeValueMethod('4');
            ref_Filter.current = '4';
          }break;
          case 60:{
            setFilterContentTypeValueMethod('5');
            ref_Filter.current = '5';
          }break;
          case 70:{
            setFilterContentTypeValueMethod('6');
            ref_Filter.current = '6';
          }break;
          case 80:{
            setFilterContentTypeValueMethod('7');
            ref_Filter.current = '7';
          }break;
          default:{ 
            setFilterContentTypeValueMethod('0');
            ref_Filter.current = '0';
          }break;  

        }

        console.log('ref_Filter.current : ' + ref_Filter.current);

        get_PointHistory();

      }catch(error){

          console.log(error);

      }
  };



    function phoneFomatter(num){
    
        var formatNum = '';
        
        try{
         
          if(num.length === 11){
                
            formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
          
          }else if(num.length === 8){
              
            formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
          
          }else{
    
              if(num.indexOf('02')==0){
                  formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
              }else{
                  formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
              }
          }
          
        }catch(error){
    
          console.log(error);
    
          formatNum = num;
    
        }
    
        return formatNum;
    
    };

    // @ts-ignore    
    const handleClickContentList : GridEventListener<'rowClick'> = (params) => {

      try{

          let rIdx = parseInt(params.row.id) - 1;


      }catch(error){

          console.log(error);

      }

    };

    return (

        <div style={{width:"100%", height:"100%", backgroundColor:"white"}}>
            
            <div style={{display:'flex', float:"left", width:"100%", background:"green", paddingTop:"10px", paddingBottom:"10px"}}>
                <Typography fontWeight="medium" sx={{fontSize:16, fontWeight:"normal", color:"white", marginLeft:"10px"}} >
                    사용내역 통계 
                </Typography>
            </div>
            
 
                {/* Summary 영역 추가 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', width: '100%', padding:"10px" }}>
                    <Paper elevation={1} style={{ padding: '10px', flex: 1, minWidth: '100px', marginRight: '5px' }}>
                        <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"normal", color:"black"}} >
                            총 건수: {summary.totalCount}
                        </Typography>
                    </Paper>
                    <Paper elevation={1} style={{ padding: '10px', flex: 1, minWidth: '100px', marginRight: '5px' }}>
                        <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"normal", color:"black"}} >
                            스왑된 포인트: {summary.swappedPoints}
                        </Typography>
                    </Paper>
                    <Paper elevation={1} style={{ padding: '10px', flex: 1, minWidth: '100px' }}>
                        <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"normal", color:"black"}} >
                            스왑된 PTH: {summary.swappedPTH}
                        </Typography>
                    </Paper>
                </div>

            <div style={{
                display:'flex',
                flexDirection:'column',
                padding: '10px',
                paddingTop: '0px',
                width: '100%',
                justifyContent:'center',
                boxSizing: 'border-box',
                gap: '10px',
                height:'calc(100% - 100px)', // 부모 크기에 맞게 조정
                overflow:'hidden',
            }}>

            {
              progressPoint ? 

                <div style={{display:"flex", flexDirection:"column", alignContent:"center", height:"100%", alignItems:"center", justifyContent:"center", overflow: 'hidden' }}>

                  <Image 
                    src={progressPath}
                    alt=""
                    width={50}
                    height={50}
                  />

                  <Typography fontWeight="medium" sx={{fontSize:13, fontWeight:"normal", color:"black", marginTop:"20px"}} >
                      포인트 내역을 조회중입니다. 
                  </Typography>

                </div>
                
               : 
                <div style={{width:"100%", height:"100%", backgroundColor:"white"}}>
                
                <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", marginTop:'0px'}}>

                  <FormControl fullWidth  style={{ width:"100%",marginTop:"0px", marginLeft:"8px", backgroundColor:'white', color:'black'}}>
                      <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      style={{color:'black'}}
                      value={filterContentTypeMethod}
                      size="small"
                      onChange={handleChangeFilterContentType}
                      >
                      <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                      <MenuItem style={{fontSize:13}} value={20}>페트병 수거 포인트 적립</MenuItem>
                      <MenuItem style={{fontSize:13}} value={30}>페트병 수거 PTH 적립</MenuItem>
                      <MenuItem style={{fontSize:13}} value={40}>기프티콘 구매</MenuItem>
                      <MenuItem style={{fontSize:13}} value={50}>기프티콘 구매취소</MenuItem>
                      <MenuItem style={{fontSize:13}} value={60}>SWAP PTH 차감</MenuItem>
                      <MenuItem style={{fontSize:13}} value={70}>SWAP Point 추가</MenuItem>
                      <MenuItem style={{fontSize:13}} value={80}>관리자에서 포인트 지급</MenuItem>
                      </Select>
                  </FormControl>

                  </div>

                <StripedDataGrid 

                rows={pointList}
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
                    height: '92%', // 부모 높이에 맞게 최대화
                    marginTop:'10px',
                }}
                onRowClick={handleClickContentList}
              />

              </div>
            
            }

            </div>        
        </div>
    )


};

export default PointInfoView;