import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from 'next/image';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, gridClasses} from '@mui/x-data-grid';
import { ERROR_CODE, walletLib } from '../../utils/wallet';
import { Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const ODD_OPACITY = 0.2;

import progressPath from '../../../public/progress.gif';
import { get } from "http";
import { isUint16Array } from "util/types";

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
    [`& .${gridClasses.row}.even`]: {
      backgroundColor: alpha(theme.palette.grey[100], 0.5),
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
      },
    },
    [`& .${gridClasses.row}.odd`]: {
      backgroundColor: theme.palette.background.paper,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
      },
    },
    '& .MuiDataGrid-cell': {
      borderBottom: `1px solid ${theme.palette.grey[200]}`,
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: theme.palette.grey[100],
      borderBottom: `2px solid ${theme.palette.grey[200]}`,
    },
    '& .MuiDataGrid-footerContainer': {
      borderTop: `2px solid ${theme.palette.grey[200]}`,
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


        let wallet_address = walletList[ref_TargetWallet_Idx.current].address;
        
        setSubProgressPoint(true);



        const response = await fetch('/api/user/walletInfo/detailTransaction', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({ wallet_address: '0xC7969aEa781B76a3C64FE37b89Cd5bE03B52E788'}),

        });

        const data = await response.json(); 
  

        if (response.ok) {

          console.log('data : ', data.result_historydata);
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
          flex: 0.2,             // flex 값 조정
          disableColumnMenu: true, 
          headerAlign: 'center', // 헤더 정렬 추가
          align: 'center',       // 셀 정렬 추가
      },
      {
          field: 'timeStamp',
          headerName: '거래일자',
          type: 'string',
          flex: 1.1,              // flex 값 조정
          disableColumnMenu: true,
          editable: false,
          headerAlign: 'center',
          align: 'left',
      },
      {
        field: 'tr_type',
        headerName: '구분',
        type: 'string',
        flex: 0.3,              // flex 값 조정
        disableColumnMenu: true,
        editable: false,
        headerAlign: 'center',
        align: 'left',
      },
      {
        field: 'value',
        headerName: '수량',
        type: 'string',
        flex: 0.5,              // flex 값 조정
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
        field: 'hash',
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
        <div style={{
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <Box sx={{ 
                backgroundColor: '#1976d2',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0
            }}>
                <AccountBalanceWalletIcon sx={{ color: 'white', fontSize: 20 }} />
                <Typography sx={{ 
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>
                    지갑 보유수: {walletCnt}
                </Typography>
            </Box>

            <Box sx={{
                p: 2.5,
                flex: '1 1 auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                backgroundColor: '#f8f9fa',
            }}>
                {progressPoint ? 
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%"
                    }}>
                        <Image 
                            src={progressPath}
                            alt=""
                            width={50}
                            height={50}
                        />
                        <Typography sx={{
                            fontSize: 13,
                            color: "black",
                            mt: 2
                        }}>
                            보유 지갑정보를 조회중입니다.
                        </Typography>
                    </Box>
                    :
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        overflow: 'auto',
                        minHeight: 0
                    }}>
                        <Box sx={{
                            backgroundColor: '#ffffff',
                            p: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                            border: '1px solid #eaeaea',
                            borderRadius: '10px',
                        }}>
                            <StripedDataGrid 
                                rows={walletList}
                                columns={columns}
                                autoHeight={false}

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
                                    border: 'none',
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
                                    height: '200px',
                                    marginTop: '10px'
                                }}

                            />
                        </Box>

                        <Box sx={{
                            backgroundColor: '#ffffff',
                            p: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                            border: '1px solid #eaeaea',
                            borderRadius: '10px',
                            flex: 1,
                            minHeight: 0
                        }}>
                            <Typography sx={{
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: '#444',
                                mb: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>지갑 거래내역</span>
                                {walletList[ref_TargetWallet_Idx.current].address && (
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        onClick={() => {
                                            const url = `https://test-explorer.plasticherokorea.com/search-results?q=${walletList[ref_TargetWallet_Idx.current].address}`;
                                            window.open(url, '_blank');
                                        }}
                                        sx={{ 
                                            fontSize: '12px',
                                            ml: 2
                                        }}
                                    >
                                        Explore 바로가기
                                    </Button>
                                )}
                            </Typography>

                            {!subProgressPoint ? 
                                <StripedDataGrid 
                                    rows={walletHistoryList}
                                    columns={columns_history}
                                    autoHeight={false}

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
                                        border: 'none',
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
                                        height: '300px',
                                        marginTop: '10px'
                                    }}
                                    onRowClick={handleDetailClickContentList}
                                />
                                :
                                <Box sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    py: 4
                                }}>
                                    <Image 
                                        src={progressPath}
                                        alt=""
                                        width={50}
                                        height={50}
                                    />
                                    <Typography sx={{
                                        fontSize: 13,
                                        color: "black",
                                        mt: 2
                                    }}>
                                        지갑 거래내역을 조회 중입니다.
                                    </Typography>
                                </Box>
                            }
                        </Box>
                    </Box>
                }
            </Box>
        </div>
    );
};

export default WalletInfoView;