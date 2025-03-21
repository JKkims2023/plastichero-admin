import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from 'next/image';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
// @ts-ignore
import { DataGrid, GridToolbar, GridRowsProp, GridColDef, GridValueGetterParams, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, gridClasses} from '@mui/x-data-grid';
import { FormControl, MenuItem } from '@mui/material';
import Paper from '@mui/material/Paper';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const ODD_OPACITY = 0.2;

import progressPath from '../../../public/progress.gif';

const rtnStatusInfo = (status) => {

  let rtnValue = '';

  switch(status){

      case '':
          rtnValue = '보관';
          break;
      case '01':
          rtnValue = '발행';
          break;
      case '02':
          rtnValue = '사용완료';
          break;
      case '03':
          rtnValue = '반품';
          break;
      case '04':
          rtnValue = '관리폐기';
          break;
      case '05':
          rtnValue = '환불';
          break;
      case '06':
          rtnValue = '재발행';
          break;
      case '07':
          rtnValue = '구매취소(폐기)';
          break;
      case '08':
          rtnValue = '기간만료';
          break;
      case '09':
          rtnValue = '바우처(비활성)';
          break;
      case '10':
          rtnValue = '잔액환불';
          break;
      case '11':
          rtnValue = '잔액기간만료';    
          break;
      case '12':
          rtnValue = '기간만료취소';
          break;
      case '13':
          rtnValue = '환전';
          break;
      case '14':
          rtnValue = '환급';    
          break;
      case '15':  
          rtnValue = '잔액환급';
          break;
      case '16':
          rtnValue = '잔액기간만료취소';
          break;
      case '21':
          rtnValue = '등록';
          break;
      case '22':
          rtnValue = '등록취소';
          break;
      case '23':
          rtnValue = '선점';
          break;
      case '24':
          rtnValue = '임시발급상태';  
          break;
      default:
          rtnValue = '기타';
          break;

  }

  return rtnValue;

};


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
      flex: 0.3,             // 번호는 작게
      disableColumnMenu: true, 
      headerAlign: 'center',
      align: 'center',
  },
  {
      field: 'od_regdate',
      headerName: '사용일',
      type: 'string',
      flex: 1,              // 날짜 형식에 맞게 조정
      disableColumnMenu: true,
      editable: false,
      headerAlign: 'center',
      align: 'center',
  },
  {
      field: 'od_status',
      headerName: '구분',
      type: 'string',
      flex: 0.4,              // 상태값 텍스트 길이에 맞게 조정
      disableColumnMenu: true,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (params: GridValueGetterParams) => rtnStatusInfo(params.value)
  },
  {
      field: 'od_goods_name',
      headerName: '상품명',
      type: 'string',
      flex: 1.5,              // 상품명이 가장 길 수 있으므로 더 넓게
      disableColumnMenu: true,
      editable: false,
      headerAlign: 'center',
      align: 'left',
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
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [totalCount, setTotalCount] = useState(0);
    const [usedCount, setUsedCount] = useState(0);
    const [cancelCount, setCancelCount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [usedPrice, setUsedPrice] = useState(0);
    const [cancelPrice, setCancelPrice] = useState(0);

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

    React.useEffect(() => {

      console.log('totalCount : ' + totalCount);

    },[totalCount, usedCount, cancelCount, totalPrice, usedPrice, cancelPrice]);


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

            console.log(data.result_summary);

            setTotalCount(data.result_summary.total_count);
            setUsedCount(data.result_summary.used_count);
            setCancelCount(data.result_summary.cancel_count);
            setTotalPrice(data.result_summary.total_price);
            setUsedPrice(data.result_summary.used_price);
            setCancelPrice(data.result_summary.cancel_price);

            
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
        <div style={{
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* 헤더 영역 */}
            <Box sx={{ 
                backgroundColor: '#1976d2',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <Typography 
                    component="span"
                    sx={{ 
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    기프트콘 사용정보
                </Typography>
            </Box>

            {/* 컨텐츠 영역 */}
            <Box sx={{
                p: 2.5,
                flex: '1 1 auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                backgroundColor: '#f8f9fa',
            }}>
                {/* Summary 영역 */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    mb: 2
                }}>
                    <Paper elevation={1} sx={{ 
                        p: 2, 
                        flex: 1,
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                        border: '1px solid #eaeaea',
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.8, mb: 0.8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <Typography sx={{ 
                                    fontSize: 13,
                                    color: '#444',
                                    fontWeight: 600
                                }}>
                                    총 건수 :
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: 13,
                                    color: '#1976d2',
                                    fontWeight: 600
                                }}>
                                    {new Intl.NumberFormat().format(totalCount)}
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: 16,
                                color: '#444',
                                fontWeight: 600
                            }}>
                                {new Intl.NumberFormat().format(totalPrice)}
                            </Typography>
                        </Box>
                    </Paper>
                    <Paper elevation={1} sx={{ 
                        p: 2, 
                        flex: 1,
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                        border: '1px solid #eaeaea',
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.8, mb: 0.8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <Typography sx={{ 
                                    fontSize: 13,
                                    color: '#444',
                                    fontWeight: 600
                                }}>
                                    사용 :
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: 13,
                                    color: '#1976d2',
                                    fontWeight: 600
                                }}>
                                    {new Intl.NumberFormat().format(usedCount)}
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: 16,
                                color: '#444',
                                fontWeight: 600
                            }}>
                                {new Intl.NumberFormat().format(usedPrice)}
                            </Typography>
                        </Box>
                     
                    </Paper>
                    <Paper elevation={1} sx={{ 
                        p: 2, 
                        flex: 1,
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                        border: '1px solid #eaeaea',
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.8, mb: 0.8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <Typography sx={{ 
                                    fontSize: 13,
                                    color: '#444',
                                    fontWeight: 600
                                }}>
                                    취소 :
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: 13,
                                    color: '#1976d2',
                                    fontWeight: 600
                                }}>
                                    {new Intl.NumberFormat().format(cancelCount)}
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: 16,
                                color: '#444',
                                fontWeight: 600
                            }}>
                                {new Intl.NumberFormat().format(cancelPrice)}
                            </Typography>
                        </Box>
                    </Paper>
                </Box>

                {/* 필터 영역 */}
                <Box sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    p: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                    marginTop: '-15px',
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        alignItems: 'center'
                    }}>
                        <FormControl sx={{ flex: 1 }} size="small">
                            <Select
                                value={filterContentTypeMethod}
                                onChange={handleChangeFilterContentType}
                                sx={{ 
                                    fontSize: 13,
                                    '& .MuiSelect-select': {
                                        padding: '8px 12px',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#eaeaea'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#1976d2'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#1976d2'
                                    }
                                }}
                            >
                                <MenuItem value={10}>전체</MenuItem>
                                <MenuItem value={20}>페트병 수거 포인트 적립</MenuItem>
                                <MenuItem value={30}>페트병 수거 PTH 적립</MenuItem>
                                <MenuItem value={40}>기프티콘 구매</MenuItem>
                                <MenuItem value={50}>기프티콘 구매취소</MenuItem>
                                <MenuItem value={60}>SWAP PTH 차감</MenuItem>
                                <MenuItem value={70}>SWAP Point 추가</MenuItem>
                                <MenuItem value={80}>관리자에서 포인트 지급</MenuItem>
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker 
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                format="YYYY-MM-DD"
                                slotProps={{
                                    textField: { 
                                        size: "small",
                                        sx: {
                                            width: '160px',
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: 13,
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#eaeaea'
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#1976d2'
                                            },
                                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#1976d2'
                                            }
                                        }
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                </Box>

                {/* DataGrid 영역 */}
                <Box sx={{ 
                    flex: 1,
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    overflow: 'auto',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                    height: '100%',
                    maxHeight: 'calc(100vh - 300px)',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2, // padding 전체 적용
                }}>
                    {progressPoint ? (
                        <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            p: 3
                        }}>
                            <Image 
                                src={progressPath}
                                alt=""
                                width={50}
                                height={50}
                            />
                            <Typography sx={{ 
                                mt: 2,
                                fontSize: 13,
                                color: '#666'
                            }}>
                                포인트 내역을 조회중입니다.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ 
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            mb: 2, // 하단 마진 추가
                        }}>
                            <StripedDataGrid 
                                rows={pointList}
                                columns={columns}
                                autoHeight={false}
                                initialState={{
                                    pagination: {
                                        paginationModel: { pageSize: 5 },
                                    },
                                }}
                                pageSizeOptions={[5]}
                                rowHeight={42}
                                columnHeaderHeight={45}
                                sx={{
                                    border: 'none',
                                    flex: 1,
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f8f9fa',
                                        borderBottom: '1px solid #eaeaea',
                                    },
                                    '& .MuiDataGrid-cell': {
                                        borderColor: '#f4f6f6',
                                        fontSize: 13,
                                        color: '#666666'
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: alpha('#1976d2', 0.04)
                                    },
                                    '& .MuiDataGrid-row.Mui-selected': {
                                        backgroundColor: alpha('#1976d2', 0.08),
                                        '&:hover': {
                                            backgroundColor: alpha('#1976d2', 0.12),
                                        }
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        borderTop: '1px solid #eaeaea',
                                        backgroundColor: '#f8f9fa'
                                    }
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
                                    height: 'calc(100% - 16px)',
                                    width: '100%',
                                    marginTop: '10px',
                                }}
                                onRowClick={handleClickContentList}
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </div>
    )


};

export default PointInfoView;