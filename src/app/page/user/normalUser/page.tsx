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

// @ts-ignore
const columns: GridColDef<(typeof rows)[number]>[] = [

  {   field: 'id', 
      headerName: 'No', 
      type: 'string',
      width: 40,             
      disableColumnMenu: true, 
  },
  {
      field: 'mb_id',
      headerName: '유저 아이디',
      type: 'string',
      minWidth: 100,
      disableColumnMenu: true,
      editable: false,
  },
  {
      field: 'mb_name',
      headerName: '유저명',
      type: 'string',
      minWidth: 100,
      disableColumnMenu: true,
      editable: false,
  },
  {
      field: 'mb_email',
      headerName: '이메일',
      type: 'string',
      minWidth: 30,
      disableColumnMenu: true,
      editable: false,
  },
  {
      field: 'mb_point',
      headerName: '보유포인트',
      type: 'string',
      minWidth: 30,
      disableColumnMenu: true,
      editable: false,
  },
  {
      field: 'mb_pth',
      headerName: '보유 PTH',
      type: 'string',
      minWidth: 30,
      disableColumnMenu: true,
      editable: false,
  },
  {
      field: 'mb_wallet',
      headerName: '지갑주소',
      type: 'string',
      minWidth: 300,
      disableColumnMenu: true,
      editable: false,
  },
  {
      field: 'mb_today_login',
      headerName: '최근 접속일',
      type: 'string',
      minWidth: 50,
      disableColumnMenu: true,
      editable: false,
  },
  {
      field: 'mb_datetime',
      headerName: '가입일',
      type: 'string',
      minWidth: 50,
      disableColumnMenu: true,
      editable: false,
  },
 
];

export default function Home() {

    const ref_Div = React.useRef<HTMLDivElement>(null);
    const ref_Grid = React.useRef(0);

    const [pagingIdx, setPaginIdx] = React.useState('0');
    const [filterInfo, setFilterInfo] = React.useState('-1');
    const [userList, setUserList] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState({

        contentID : '',
        contentTitle : '',
    
    });

    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState('');

    const page_info = 'Home > 회원관리 > 어플 이용자 리스트';

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

        console.log(error);

      }

    },[]);

    React.useEffect(()=>{

    },[userList]);

    const get_UserInfo = async() => {

      try{

        const response = await fetch('/api/user', {

          method: 'POST',
          headers: {
          
            'Content-Type': 'application/json',
          
          },
          
          body: JSON.stringify({ pagingIdx, filterInfo }),
        
        });
  
        const data = await response.json();
  
        console.log(data);
  
  
        if (response.ok) {
  
          console.log('response success');

          // @ts-ignore
          setUserList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
          
        } else {
  
          alert(data.message);
        
        }

      }catch(error){

        console.log(error);

      }

    };
    
    const handleChangeFilterContentType = () => {

        try{

        }catch(error){

            console.log(error);

        }
    };

    // @ts-ignore    
    const handleClickContentList : GridEventListener<'rowClick'> = (params) => {

      try{

          let rIdx = parseInt(params.row.id) - 1;
          
          setSelectedContent(userList[rIdx]);


      }catch(error){

          console.log(error);

      }

  };

  return (

    <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

      <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

          <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

      </div>

      <div style={{}}>
          <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
              어플 사용자 리스트
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
        borderRadius:'10px', 
        borderColor:'#f1f1f1', 
        borderWidth:'2px', 
        backgroundColor:'#efefef',
        alignContent:'center',
        alignItems:'center',
        
        }}>
              
          <div style={{display:"flex", float:"left", marginLeft:"10px", alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                
              <div style={{display:"flex", float:"left"}}>
                  <label style={{color:"black", fontSize:15, marginTop:'auto', marginBottom:'auto', alignSelf:'center'}}>타입</label>
                  <FormControl fullWidth  style={{ width:"110px",marginTop:"0px", marginLeft:"8px"}}>
                      <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      style={{color:'white'}}
                      value={filterContentTypeMethod}
                      size="small"
                      onChange={handleChangeFilterContentType}
                      >
                      <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                      <MenuItem style={{fontSize:13}} value={20}>Point</MenuItem>
                      <MenuItem style={{fontSize:13}} value={30}>Coin</MenuItem>

                      </Select>
                  </FormControl>
              </div>
          </div>

      </div>

      <div ref={ref_Div} style={{flex:1, height:'100%', marginTop:'0px', paddingLeft:"0px",}}>

          <StripedDataGrid 

              rows={userList}
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
                      fontSize:13,
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

                marginTop:'20px',

              }}
              onRowClick={handleClickContentList}
          />

      </div>
   

    </div>
  );
}
