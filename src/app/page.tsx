'use client'

import React, { useEffect, useState } from "react";

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Typography, LinearProgress, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function Home() {

  const [introList, setIntroList] = React.useState([]);
  const [issueCheck, setIssueCheck] = React.useState('불필요');
  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const [circleValues, setCircleValues] = React.useState([]); 
  const [totalValue, setTotalValue] = React.useState(0);
  const [nodeSummary, setNodeSummary] = React.useState({

    node_count : 0,
    run_count : 0,
    stop_count : 0,
    mining_amount : 0,
    company_mining_amount : 0,
    total_mining_amount : 0,
    total_mining_count : 0,

  });
  const [roundSummary, setRoundSummary] = React.useState({
    successCount : 0,
    successAmount : 0,
  });
  const [doneSchedule, setDoneSchedule] = React.useState({

    schedule_no : -1,
    start_date : '',
    done_date : '',
    success_yn : 'N',

  });

  const [companyNode, setCompanyNode] = React.useState([]);

  const [todayUserPayCount, setTodayUserPayCount] = React.useState(0);
  const [todayUserPayAmount, setTodayUserPayAmount] = React.useState(0);



  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF5733', '#33FF57', '#3357FF']; // 각 항목별 색상



  React.useEffect(() => {
    
    const yesterday = dayjs().subtract(1, 'day');
    
    setSelectedDate(yesterday);

    getIntroInfo();

  }, []);

  React.useEffect(() => {
    const totalValue = circleValues.reduce((acc, value) => acc + value.node_count, 0);
    setTotalValue(totalValue);
    console.log('circleValues:', circleValues);
    console.log('totalValue:', totalValue);
  }, [circleValues]);

  const getIntroInfo = async() => {
    
    try {

      const response = await fetch('/api/intro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromDate : selectedDate.format('YYYY-MM-DD') }),
      });

      const data = await response.json(); 

      if (response.ok) {

         
        setIntroList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
        setCircleValues(data.result_data.map((data, idx) => ({ id: idx + 1, ...data }))); // 차트 데이터 설정
        setNodeSummary(data.result_node_summary);
        setCompanyNode(data.result_company_node);
        setRoundSummary(data.result_round_summary);
        setDoneSchedule(data.result_done_schedule);

      } else {
      
        alert(data.message);
      
      }
    
    } catch (error) {
      console.error('Error fetching intro info:', error);
    }
  };

  React.useEffect(() => {

  }, [nodeSummary]);

  React.useEffect(() => {


  }, [roundSummary]);

  React.useEffect(() => {

  }, [companyNode]);


  return (
    
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: '1px solid #888' }} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div style={{ display: 'flex', padding: '10px', backgroundColor: '#1f1f26',  color: 'white' }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginRight: '20px', alignItems:'center' }}>
            <div style={{ color: 'green', fontSize: '30px', alignItems:'center', marginTop:'10px' }}>
              OVERVIEW : {selectedDate.format("YYYY/MM/DD")}
            </div>
          </div>
          <div style={{ marginLeft: 'auto',  }}>
            <DatePicker 
              value={selectedDate} 
              onChange={(newValue) => setSelectedDate(newValue)} 
              format="YYYY/MM/DD" 
              maxDate={dayjs().subtract(1, 'day')}
              sx={{ 
 
                marginTop: '5px',
                input: { color: 'white', fontSize: '1.1em' },
                '.MuiInputBase-root': { backgroundColor: '#2a2a30' },
                '.MuiSvgIcon-root': { color: 'white' }
              }}
            />
          </div>
        </div>
      </LocalizationProvider>
      <div style={{
         display: 'flex',
         flexWrap: 'wrap',
         width: '100%',
         height: 'calc(100% - 210px)',
      }}>
        <div style={{ flex: 1, padding: '10px', paddingRight: '50px', position: 'relative', height: 'calc(100% - 20px)', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex',  flexDirection: 'column', height: '100%', padding: '20px' }}>
           
           <Typography sx={{
              fontSize:"20px", 
              paddingLeft:'10px', 
              color: '#1f1f26', 
              fontWeight:'bold',
              position: 'relative',
              marginBottom: '20px',
              '&:before': {
                content: '""',
                position: 'absolute',
                left: '-10px',
                top: '50%',
                width: '4px',
                height: '20px',
                backgroundColor: '#60bb64',
                transform: 'translateY(-50%)'
              }
            }}>
              노드 구성현황
            </Typography>

            <Box 
              sx={{
              
                width: '100%',
                height: '40px',
                bgcolor: '#f5f5f5',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden'
              }}
            >
              {circleValues.map((value, index) => {
                if (!value || !value.node_count || !value.node_type_name) return null;
                
                const width = totalValue > 0 ? (value.node_count / totalValue) * 100 : 0;
                
                return (
                  <div
                    key={index}
                    style={{
                      width: `${width}%`,
                      height: '100%',
                      backgroundColor: colors[index],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      borderRight: index < circleValues.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                    }}
                  >
                    {width > 8 && value.node_count}
                  </div>
                );
              })}
            </Box>
            
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {circleValues.map((value, index) => (
                value && value.node_type_name && (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', margin: '5px 10px' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: colors[index], 
                      marginRight: '8px',
                      borderRadius: '4px'
                    }} />
                    <span style={{ fontSize: '13px', color: '#1f1f26', fontWeight: 'bold' }}>
                      {value.node_type_name}: {value.node_count}
                    </span>
                  </div>
                )
              ))}
            </div>
            
            <Typography sx={{
              marginTop:'40px',
              fontSize:"20px", 
              paddingLeft:'10px',
              color: '#1f1f26', 
              fontWeight:'bold',
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                left: '-10px',
                top: '50%',
                width: '4px',
                height: '20px',
                backgroundColor: '#60bb64',
                transform: 'translateY(-50%)'
              }
            }}>
              노드 운영현황
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mt: 2, 
              justifyContent: 'flex-start'
            }}>
              <Box sx={{
                width: '200px',
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                p: 2,
                textAlign: 'flex-start',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }
              }}>
                <Typography sx={{ color: '#666', fontSize: '1.2rem', mb: 1 }}>
                  총 채굴노드
                </Typography>
                <Typography sx={{ color: '#1f1f26', fontSize: '1.9rem', }}>
                  {nodeSummary.node_count.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{
                width: '200px',
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                p: 2,
                textAlign: 'flex-start',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }
              }}>
                <Typography sx={{ color: '#666', fontSize: '1.2rem', mb: 1 }}>
                  활성화 된  노드
                </Typography>
                <Typography sx={{ color: '#60bb64', fontSize: '1.9rem', }}>
                  {nodeSummary.run_count.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{
                width: '200px',
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                p: 2,
                textAlign: 'flex-start',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }
              }}>
                <Typography sx={{ color: '#666', fontSize: '1.2rem', mb: 1 }}>
                  중지된 노드
                </Typography>
                <Typography sx={{ color: '#ff6b6b', fontSize: '1.9rem',  }}>
                  {nodeSummary.stop_count.toLocaleString()}
                </Typography>
              </Box>
            </Box>


            <Typography sx={{
              marginTop:'40px',
              fontSize:"20px", 
              paddingLeft:'10px', 
              color: '#1f1f26', 
              fontWeight:'bold',
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                left: '-10px',
                top: '50%',
                width: '4px',
                height: '20px',
                backgroundColor: '#60bb64',
                transform: 'translateY(-50%)'
              }
            }}>
              일별 채굴 계획
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mt: 2, 
              justifyContent: 'flex-start',
              flexWrap: 'wrap'
            }}>
              <Box sx={{
                width: '200px',
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                p: 2,
                textAlign: 'flex-start',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }
              }}>
                <Typography sx={{ color: '#666', fontSize: '1.2rem', mb: 1 }}>
                  설정된 채굴건수 (노드수)
                </Typography>
                <Typography sx={{ color: '#1f1f26', fontSize: '1.9rem',}}>
                  {nodeSummary.run_count.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{
                width: '200px',
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                p: 2,
                textAlign: 'flex-start',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }
              }}>
                <Typography sx={{ color: '#666', fontSize: '1.2rem', mb: 1 }}>
                  예정된 채굴량
                </Typography>
                <Typography sx={{ color: '#60bb64', fontSize: '1.9rem',  }}>
                  {(nodeSummary.mining_amount ? Number(nodeSummary.mining_amount).toLocaleString() : '0')} PTH
                </Typography>
              </Box>

              <Box sx={{
                width: '200px',
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                p: 2,
                textAlign: 'flex-start',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }
              }}>
                <Typography sx={{ color: '#666', fontSize: '1.2rem', mb: 1 }}>
                  분배 예정 수
                </Typography>
                <Typography sx={{ color: '#1f1f26', fontSize: '1.9rem',}}>
                  {(nodeSummary.run_count * (companyNode.length + 1)).toLocaleString()}
                </Typography>
              </Box>

            </Box>

          </div>
        </div>
        <div style={{ flex: 1, padding: '10px', paddingTop:'10px', paddingLeft:'80px', paddingRight:'40px', height: 'calc(100% - 20px)' }}>
          {/* 오른쪽 영역 내용 */}

          <Typography sx={{

              marginTop:'15px',
              marginLeft:'10px',
              fontSize:"20px", 
              paddingLeft:'10px', 
              color: '#1f1f26', 
              fontWeight:'bold',
              position: 'relative',
              marginBottom: '20px',
              '&:before': {
                content: '""',
                position: 'absolute',
                left: '-10px',
                top: '50%',
                width: '4px',
                height: '20px',
                backgroundColor: '#60bb64',
                transform: 'translateY(-50%)'
              }
            }}>
              채굴현황

          </Typography>

          <div style={{display:'flex', flexDirection:'row', marginTop:'-10px', width:'100%'}}>
            <Typography sx={{fontSize:"16px",  color: '#1f1f26', fontWeight:'bold', marginTop:'5px', marginLeft:'0px' }}>
              누적 총 채굴정보 : 
            </Typography>
            <Typography sx={{fontSize:"16px",  color: '#60bb64', marginTop:'5px', marginLeft:'10px' }}>
              채굴건수 : {nodeSummary?.total_mining_count?.toLocaleString()} 건
            </Typography>
            <Typography sx={{fontSize:"16px",  color: '#60bb64', marginTop:'5px', marginLeft:'30px' }}>
              채굴량 : {nodeSummary?.total_mining_amount?.toLocaleString()} PTH
            </Typography>
          </div>
          <div style={{display:'flex', flexDirection:'row', marginTop:'10px', width:'100%', alignContent:'center', alignItems:'center' }}>
            <Typography sx={{fontSize:"16px",  color: '#1f1f26', fontWeight:'bold', marginTop:'0px', marginLeft:'0px' }}>
              채굴 실행 : 
            </Typography>
            <Typography sx={{fontSize:"16px",  color: '#60bb64', marginTop:'0px', marginLeft:'10px' }}>
              {doneSchedule.schedule_no == -1 ? 
              '실행 전' 
              : 
              '실행 완료' + ' ('  + doneSchedule.start_date + ' - ' + doneSchedule.done_date + ')'
              } 
            </Typography>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', marginTop:'15px', }}>
            <div style={{display:'flex', flexDirection:'row', width: '100%',  backgroundColor: '#efefef', padding: '10px', borderRadius: '10px' }}>
              <Typography sx={{fontSize:"16px",  color: '#1f1f26', fontWeight:'bold'}}>
                {doneSchedule.schedule_no == -1 ? '오늘의 지급 예정 수량' : '오늘의 지급 완료 수량'}
              </Typography>
              <Typography sx={{display:doneSchedule.schedule_no == -1 ? 'none' : 'block', fontSize:"1.2rem",  color: '#1f1f26',  marginLeft:'auto', marginRight:'5px'}}>
                계획 / 지급 
              </Typography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop:'20px', width:'100%' }}>
              <Typography sx={{ color: '#1f1f26', fontSize: '1.2rem', mb: 1, marginLeft:'10px', fontWeight:'bold'  }}>
                유저지급 
              </Typography>
              <Typography sx={{fontSize:"1.2rem",  color: '#1f1f26', marginLeft:'auto', marginRight:'10px' }}>
              {(nodeSummary.mining_amount ? Number(nodeSummary.run_count * 135).toLocaleString() : '0')} PTH
              </Typography>
            </div>
            {companyNode.map((data, idx)=>{
              return(
              <div key={idx} style={{ display: 'flex', flexDirection: 'row', marginTop:'10px', width:'100%' }}>
              <Typography sx={{ color: '#1f1f26', fontSize: '1.2rem', mb: 1, marginLeft:'10px', fontWeight:'bold'  }}>
                {data.node_name}  
              </Typography>
              <Typography sx={{ color: '#1f1f26', fontSize: '1.2rem', mb: 1, marginLeft:'auto', marginRight:'10px',  }}>
                {(data.mining_amount * nodeSummary.run_count).toLocaleString()} PTH
              </Typography>

              <Typography sx={{display:doneSchedule.schedule_no == -1 ? 'none' : 'block', color: '#1f1f26', fontSize: '1.2rem', mb: 1, marginLeft:'0px', marginRight:'10px',  }}>
                /
              </Typography>

              <Typography sx={{display:doneSchedule.schedule_no == -1 ? 'none' : 'block',  color: '#1f1f26', fontSize: '1.2rem', mb: 1, marginLeft:'0px', marginRight:'10px',  }}>
                {(data.mining_amount * nodeSummary.run_count).toLocaleString()} PTH
              </Typography>
            </div>
            )})}

            <div style={{width:'100%', height:'1px', backgroundColor:'#DBDBDB', marginTop:'10px'}} />

            <div style={{display:'flex', flexDirection:'row', marginTop:'20px', width:'100%', paddingRight:'10px'}}>
              <Typography sx={{ color: '#1f1f26', fontSize: '1.5rem', mb: 1, marginLeft:'10px',  }}>
                총 지급량
              </Typography>
              <Typography sx={{fontSize:"25px",  marginLeft:'auto', color:'#60bb64'}}>
              {(nodeSummary.mining_amount ? Number((nodeSummary.run_count * 135) + (nodeSummary.company_mining_amount * nodeSummary.run_count)).toLocaleString() : '0')} PTH
              </Typography>
            </div>

            <div style={{ width: '100%',  backgroundColor: '#efefef', padding: '10px', borderRadius: '10px', marginTop:'20px', paddingRight:'20px' }}>
              <Typography sx={{fontSize:"16px",  color: '#1f1f26', fontWeight:'bold'}}>
                오늘의 소각량
              </Typography>
            </div>

            <div style={{display:'flex', flexDirection:'row', marginTop:'10px', width:'100%', paddingRight:'10px'}}>

              <Typography sx={{fontSize:"25px",  marginLeft:'auto', color:'#60bb64' }}>
                {todayUserPayAmount} PTH
              </Typography>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
