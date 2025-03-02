'use client'

import React, { useEffect, useState } from "react";

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';

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

  });
  const [companyNode, setCompanyNode] = React.useState([]);


  const [todayUserPayCount, setTodayUserPayCount] = React.useState(0);
  const [todayUserPayAmount, setTodayUserPayAmount] = React.useState(0);


  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF5733', '#33FF57', '#3357FF']; // 각 항목별 색상

  const [hoveredIndex, setHoveredIndex] = React.useState(null);
  const [overlayPosition, setOverlayPosition] = React.useState(null);

  React.useEffect(() => {
    
    const yesterday = dayjs().subtract(1, 'day');
    
    setSelectedDate(yesterday);

    getIntroInfo();

  }, []);

  React.useEffect(() => {


    const totalValue = circleValues.reduce((acc, value) => acc + value.node_count, 0);

    setTotalValue(totalValue);


  }, [circleValues]);

  const getIntroInfo = async() => {

    try {


      const fromDate = '';
        
      const response = await fetch('/api/intro', {

        method: 'POST',
        headers: {
        
          'Content-Type': 'application/json',
        
        },
        
        body: JSON.stringify({ fromDate }),
      
      });

      const data = await response.json(); 

      if (response.ok) {

        setIntroList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
        setCircleValues(data.result_data.map((data, idx) => ({ id: idx + 1, ...data }))); // 차트 데이터 설정
        setNodeSummary(data.result_node_summary);
        setCompanyNode(data.result_company_node);
        
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

  }, [companyNode]);


  return (
    
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: '1px solid #888' }} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div style={{ display: 'flex', padding: '10px', backgroundColor: '#1f1f26',  color: 'white' }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginRight: '20px', alignItems:'center' }}>
            <div style={{ color: 'green', fontSize: '35px',  }}>
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
 
                input: { color: 'white', fontSize: '1.3em' },
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
        <div style={{ flex: 1, borderRight: '1px solid #888', padding: '10px', position: 'relative', height: 'calc(100% - 20px)', overflow: 'hidden' }}>
          <Typography sx={{fontSize:"18px",  color: '#1f1f26', fontWeight:'bold', marginTop:'10px', marginLeft:'20px' }}>
            현재 노드 현황
          </Typography>
          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
            {circleValues.map((value, index) => {
              if (value && value.node_type_name) {
                const percentage = ((value.node_count / totalValue) * 100).toFixed(2);
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: colors[index], marginRight: '5px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f1f26' }}> {value.node_type_name} : {value.node_count} ({percentage}%)</div>
                  </div>
                );
              }
              return null;
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'calc(100% - 50px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={circleValues.map((value, index) => {

                    if (value && value.node_count !== undefined) {
                      return { value: value.node_count, name: value.node_type_name };
                    }
                    return { value: 0, name: 'Unknown' };
                  })}
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="70%"
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={(data, index, event) => {
                    setHoveredIndex(index);
                    const { clientX, clientY } = event;
                    setOverlayPosition({ x: clientX, y: clientY });
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setOverlayPosition(null);
                  }}
                >
                  {circleValues.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} />
                  ))}
                </Pie>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#1f1f26" fontSize="15px">
                노드수 : {totalValue}
                </text>
                {hoveredIndex !== null && overlayPosition && (
                  <foreignObject 
                    x={overlayPosition.x} 
                    y={overlayPosition.y} 
                    width="150" 
                    height="50"
                    style={{ pointerEvents: 'none', transform: 'translate(0, -100%)' }}
                  >
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #888',
                      borderRadius: '5px',
                      padding: '5px',
                      textAlign: 'center'
                    }}>
                      {circleValues[hoveredIndex]?.node_type_name}: {circleValues[hoveredIndex]?.node_count}
                    </div>
                  </foreignObject>
                )}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ flex: 1, padding: '10px', paddingTop:'10px', paddingLeft:'10px', paddingRight:'10px', height: 'calc(100% - 20px)' }}>
          {/* 오른쪽 영역 내용 */}

          <Typography sx={{fontSize:"25px",  color: '#1f1f26', fontWeight:'bold' }}>
            채굴현황
          </Typography>
          <div style={{display:'flex', flexDirection:'row', marginTop:'10px', width:'100%'}}>
            <Typography sx={{fontSize:"16px",  color: '#1f1f26', fontWeight:'bold', marginTop:'5px', marginLeft:'0px' }}>
              누적 총 채굴건수 : 
            </Typography>
            <Typography sx={{fontSize:"16px",  color: '#60bb64', fontWeight:'bold', marginTop:'5px', marginLeft:'10px' }}>
              800 건
            </Typography>
          </div>
          <div style={{display:'flex', flexDirection:'row', marginTop:'10px', width:'100%'}}>
            <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold', marginTop:'0px', marginLeft:'0px' }}>
              오늘 채굴건수 : 
            </Typography>
            <Typography sx={{fontSize:"13px",  color: '#60bb64', fontWeight:'bold', marginTop:'0px', marginLeft:'10px' }}>
              {nodeSummary.run_count} 건 (총 노드수 : {nodeSummary.node_count} / 중지된 노드 : {nodeSummary.stop_count}) 
            </Typography>
          </div>
          <div style={{display:'flex', flexDirection:'row', marginTop:'0px', paddingRight:'5px', width:'100%'}}>
          <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginTop:'0px', marginLeft:'auto' }}>
            채굴현황
          </Typography>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', marginTop:'5px', }}>
            <div style={{ width: '100%',  backgroundColor: '#efefef', padding: '10px', borderRadius: '10px' }}>
              <Typography sx={{fontSize:"16px",  color: '#1f1f26', fontWeight:'bold'}}>
                오늘의 지급량
              </Typography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop:'20px', width:'100%' }}>
              <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold', marginLeft:'10px' }}>
                유저지급 
              </Typography>
              <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginLeft:'auto', marginRight:'10px' }}>
                {todayUserPayAmount} PTH
              </Typography>
            </div>
            {companyNode.map((data, idx)=>{
              return(
              <div key={idx} style={{ display: 'flex', flexDirection: 'row', marginTop:'10px', width:'100%' }}>
              <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold', marginLeft:'10px' }}>
                {data.node_name} 
              </Typography>
              <Typography sx={{fontSize:"13px",  color: '#1f1f26', marginLeft:'auto', marginRight:'10px' }}>
                {(data.mining_amount * nodeSummary.run_count).toLocaleString()} PTH
              </Typography>
            </div>
            )})}

            <div style={{width:'100%', height:'1px', backgroundColor:'#DBDBDB', marginTop:'10px'}} />

            <div style={{display:'flex', flexDirection:'row', marginTop:'20px', width:'100%', paddingRight:'10px'}}>
              <Typography sx={{fontSize:"13px",  color: '#1f1f26', fontWeight:'bold', marginLeft:'10px' }}>
                총 지급량
              </Typography>
              <Typography sx={{fontSize:"25px",  marginLeft:'auto', color:'#60bb64'}}>
                {todayUserPayAmount} PTH
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
