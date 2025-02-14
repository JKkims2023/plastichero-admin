import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from 'next/image';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, gridClasses} from '@mui/x-data-grid';
import { FormControl, MenuItem } from '@mui/material';

const ODD_OPACITY = 0.2;

import progressPath from '../../../public/progress.gif';
import { get } from "http";

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
      field: 'is_main',
      headerName: '메인지갑',
      type: 'string',
      flex: 1,              // flex 값 조정
      disableColumnMenu: true,
      editable: false,
      headerAlign: 'center',
      align: 'center',
  },
  {
      field: 'address',
      headerName: '지갑주소',
      type: 'string',
      flex: 7,              // flex 값 조정
      disableColumnMenu: true,
      editable: false,
      headerAlign: 'center',
      align: 'left',
  },
  
  {
    field: 'email',
    headerName: '매칭이메일',
    type: 'string',
    flex: 3,              // flex 값 조정
    disableColumnMenu: true,
    editable: false,
    headerAlign: 'center',
    align: 'left',
},
];

// @ts-ignore
const columns_history: GridColDef<(typeof rows)[number]>[] = [
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
      field: 'update_date',
      headerName: '거래일자',
      type: 'string',
      flex: 1.2,              // flex 값 조정
      disableColumnMenu: true,
      editable: false,
      headerAlign: 'center',
      align: 'left',
  },
  {
    field: 'transaction_type',
    headerName: '거래구분',
    type: 'string',
    flex: 1,              // flex 값 조정
    disableColumnMenu: true,
    editable: false,
    headerAlign: 'center',
    align: 'left',
  },
  {
    field: 'amount',
    headerName: '수량',
    type: 'string',
    flex: 0.3,              // flex 값 조정
    disableColumnMenu: true,
    editable: false,
    headerAlign: 'center',
    align: 'left',
  },
  {
    field: 'tx_id',
    headerName: 'TxID',
    type: 'string',
    flex: 3,              // flex 값 조정
    disableColumnMenu: true,
    editable: false,
    headerAlign: 'center',
    align: 'left',
  },
];

const WalletInfoView = ({walletInfo}) => {

    const ref_Filter = useRef('0');
    const ref_TargetWallet = useRef('');

    const [pagingIdx, setPagingIdx] = useState(0);
    const [filterInfo, setFilterInfo] = useState('-1');
    const [walletList, setWalletList] = useState([]);
    const [walletHistoryList, setWalletHistroyList] = useState([]);
    const [walletCnt, setWalletCnt] = useState('0');
    const [progressPoint, setProgressPoint] = useState(true);
    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('0');

    React.useEffect(()=>{


    },[]);

    React.useEffect(() => {

        if(walletInfo.mb_id !== undefined && walletInfo.mb_id !== null){

          get_WalletHistory();

        }

    },[walletInfo]);

    React.useEffect(() => {

    },[walletList]);

    React.useEffect(() => {


    },[progressPoint]);


    const get_WalletHistory = async() => {

        try{

          const md_idx = walletInfo.mb_no;
          const target_wallet = ref_TargetWallet.current;

          console.log('md_idx : ' + md_idx);

          setProgressPoint(true)

          setFilterInfo(ref_Filter.current);

          const response = await fetch('/api/user/walletInfo', {
  
            method: 'POST',
            headers: {
            
              'Content-Type': 'application/json',
            
            },
            
            body: JSON.stringify({md_idx, target_wallet}),
          
          });
    
          const data = await response.json(); 
    
          if (response.ok) {
    
            console.log('response success');

            console.log(data);
  
            // @ts-ignore
            setWalletList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));

            setWalletCnt(data.result_data.length);

            setWalletHistroyList(data.result_historydata.map((data, idx) => ({ id: idx + 1, ...data })));
            
          } else {
    
            alert(data.message);
          
          }

          setProgressPoint(false)
    
        }catch(error){
  
          console.log(error);

          setProgressPoint(false)
  
        }
    
    };

    
    const get_WalletDetailHistory = async() => {

      try{

        let md_idx = walletInfo.address;
        
        if(ref_TargetWallet.current != ''){

          md_idx  = ref_TargetWallet.current;

        }

        setProgressPoint(true)

        setFilterInfo(ref_Filter.current);

        const response = await fetch('/api/user/walletInfo/detailWalletInfo', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({md_idx}),
        
        });
  
        const data = await response.json(); 
  
        if (response.ok) {
  
          console.log('response success');


          setWalletHistroyList(data.result_historydata.map((data, idx) => ({ id: idx + 1, ...data })));
          
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

        get_WalletHistory();

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

            ref_TargetWallet.current = params.row.wallet_idx;

            get_WalletDetailHistory();

        }catch(error){

            console.log(error);

        }

      };

      // @ts-ignore    
      const handleDetailClickContentList : GridEventListener<'rowClick'> = (params) => {

        try{

        }catch(error){

          console.log(error);

        }

      };

    return (

        <div style={{width:"100%", height:"100%", backgroundColor:"white"}}>
            <div style={{display:'flex', float:"left", width:"100%", background:"green", paddingTop:"10px", paddingBottom:"10px"}}>
                <Typography fontWeight="medium" sx={{fontSize:16, fontWeight:"normal", color:"white", marginLeft:"10px"}} >
                    지갑 보유수 : {walletCnt} 
                </Typography>
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
                height:'93%',
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
                      보유 지갑정보를 조회중입니다. 
                  </Typography>

                </div>
                
               : 
                <div style={{width:"100%", height:"100%", backgroundColor:"white"}}>
                  
                  
                  <StripedDataGrid 

                    rows={walletList}
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

                      marginTop:'10px',

                    }}
                    onRowClick={handleClickContentList}
                  />

                  <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"bold", color:"black", marginTop:"20px", marginLeft:"5px"}} >
                      지갑 거래내역 
                  </Typography>

                  <StripedDataGrid 

                    rows={walletHistoryList}
                    columns={columns_history}
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

                      marginTop:'10px',

                      height:'390px'

                    }}
                    onRowClick={handleDetailClickContentList}
                  />

                </div>
            
            }

            </div>        
        </div>
    )


};

export default WalletInfoView;