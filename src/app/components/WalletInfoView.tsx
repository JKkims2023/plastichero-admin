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


const WalletInfoView = ({walletInfo}) => {

    const ref_Filter = useRef('0');
    const ref_TargetWallet = useRef('');
    const ref_TargetWallet_Idx = useRef(0);

    const [pagingIdx, setPagingIdx] = useState(0);
    const [filterInfo, setFilterInfo] = useState('-1');
    const [walletList, setWalletList] = useState([]);
    const [walletHistoryList, setWalletHistroyList] = useState([]);
    const [walletCnt, setWalletCnt] = useState('0');
    const [detailAddress, setDetailAddress] = useState('');
    const [progressPoint, setProgressPoint] = useState(true);
    const [subProgressPoint, setSubProgressPoint] = useState(false);
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
      
            console.log('data : ', data.result_data);
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

        console.log(walletList);

        let md_idx = walletList[ref_TargetWallet_Idx.current].idx;
        let wallet_address = walletList[ref_TargetWallet_Idx.current].address;
        
        setSubProgressPoint(true)

        const response = await fetch('/api/user/walletInfo/detailWalletInfo', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({md_idx, wallet_address}),
        
        });
  
        const data = await response.json(); 
  
        if (response.ok) {
  
          console.log('response success');


          setWalletHistroyList(data.result_historydata.map((data, idx) => ({ id: idx + 1, ...data })));
          
        } else {
  
          alert(data.message);
        
        }

        setSubProgressPoint(false)
  
      }catch(error){

        console.log(error);

        setSubProgressPoint(false)

      }
  
    };

    // @ts-ignore    
    const handleDetailClickContentList : GridEventListener<'rowClick'> = (params) => {

      try{

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
          flex: 0.3,             // flex 값 조정
          disableColumnMenu: true, 
          headerAlign: 'center', // 헤더 정렬 추가
          align: 'center',       // 셀 정렬 추가
      },
      {
          field: 'is_main',
          headerName: '메인',
          type: 'string',
          flex: 0.3,              // flex 값 조정
          disableColumnMenu: true,
          editable: false,
          headerAlign: 'center',
          align: 'center',
      },
      {
          field: 'lock_yn',
          headerName: 'Lock',
          type: 'string',
          flex: 0.8,              // flex 값 조정
          disableColumnMenu: true,
          editable: false,
          headerAlign: 'center',
          align: 'center',
      },
      {
          field: 'address',
          headerName: '지갑주소',
          type: 'string',
          flex: 3.8,              // flex 값 조정
          disableColumnMenu: true,
          editable: false,
          headerAlign: 'center',
          align: 'left',
          
      },
      
      {
          field: 'email',
          headerName: '매칭이메일',
          type: 'string',
          flex: 1.8,              // flex 값 조정
          disableColumnMenu: true,
          editable: false,
          headerAlign: 'center',
          align: 'left',
      },
      {
        field: 'detail',
        headerName: '거래내역',
        flex: 0.7,
        disableColumnMenu: true,
        renderCell: (params) => (
            <Button
                variant="contained"
                size="small"
                sx={{ fontSize: '12px' }}
                onClick={(event) => {
                  
                    event.stopPropagation();
                    

                    ref_TargetWallet_Idx.current = parseInt(params.row.id) - 1;

                    setDetailAddress(' : ' + walletList[ref_TargetWallet_Idx.current].address);
        
                    get_WalletDetailHistory();
        
        
                }}
            >
                조회
            </Button>
        ),
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
        field: 'type_name',
        headerName: '거래구분',
        type: 'string',
        flex: 1.5,              // flex 값 조정
        disableColumnMenu: true,
        editable: false,
        headerAlign: 'center',
        align: 'left',
      },
      {
        field: 'amount',
        headerName: '수량',
        type: 'string',
        flex: 1,              // flex 값 조정
        disableColumnMenu: true,
        editable: false,
        headerAlign: 'center',
        align: 'left',
        valueFormatter: (params) => {

          if (params == null) return '';
          
          // @ts-ignore
          return params.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
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
                            pageSize: 3,
                            },
                        },
                    }}
                    pageSizeOptions={[3]}
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
                      height:'230px'

                    }}

                  />

                  <Typography fontWeight="medium" sx={{fontSize:14, fontWeight:"bold", color:"black", marginTop:"20px", marginLeft:"5px"}} >
                      지갑 거래내역 {detailAddress}
                  </Typography>

                  <div>
                    {!subProgressPoint ? 
                      
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
                      
                      :

                      <div style={{display:"flex", flexDirection:"column", flex:1, alignContent:"center", height:"100%", alignItems:"center", justifyContent:"center",   marginTop:'100px' }}>

                      <Image 
                        src={progressPath}
                        alt=""
                        width={50}
                        height={50}
                      />

                      <Typography fontWeight="medium" sx={{fontSize:13, fontWeight:"normal", color:"black", marginTop:"20px"}} >
                          지갑 거래내역을 조회 중입니다. 
                      </Typography>

                      </div>
                    }
                  </div>

                </div>
            
            }

            </div>        
        </div>
    )


};

export default WalletInfoView;