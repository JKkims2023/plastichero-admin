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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0' }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div style={{ 
            display: 'flex', 
            padding: '16px 24px', 
            backgroundColor: 'white',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span>Mining Dashboard</span>
              <span style={{ 
                fontSize: '16px', 
                color: '#64748b', 
                backgroundColor: '#f1f5f9',
                padding: '4px 12px',
                borderRadius: '6px'
              }}>
                {selectedDate.format("YYYY/MM/DD")}
              </span>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <DatePicker 
                value={selectedDate} 
                onChange={(newValue) => setSelectedDate(newValue)} 
                format="YYYY/MM/DD" 
                maxDate={dayjs().subtract(1, 'day')}
                sx={{ 
                  '.MuiInputBase-root': { 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: '#cbd5e1'
                    }
                  },
                  '.MuiSvgIcon-root': { color: '#64748b' }
                }}
              />
            </div>
          </div>
        </LocalizationProvider>
      </div>

      <div style={{ padding: '24px', display: 'flex', gap: '24px', height: 'calc(100vh - 80px)' }}>
        {/* 왼쪽 패널 */}
        <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 노드 상태 카드 */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <Typography sx={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1e293b',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              '&::before': {
                content: '""',
                width: '4px',
                height: '20px',
                backgroundColor: '#3b82f6',
                borderRadius: '2px'
              }
            }}>
              노드 운영현황
            </Typography>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px',
              marginTop: '-10px',
              marginBottom: '24px'
            }}>
              <Box sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '16px',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <Typography sx={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                  총 채굴노드
                </Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '24px', fontWeight: '600' }}>
                  {nodeSummary.node_count.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '16px',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <Typography sx={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                  활성화 노드
                </Typography>
                <Typography sx={{ color: '#10b981', fontSize: '24px', fontWeight: '600' }}>
                  {nodeSummary.run_count.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '16px',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <Typography sx={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                  중지된 노드
                </Typography>
                <Typography sx={{ color: '#ef4444', fontSize: '24px', fontWeight: '600' }}>
                  {nodeSummary.stop_count.toLocaleString()}
                </Typography>
              </Box>
            </div>

            <Typography sx={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              노드 유형별 분포
            </Typography>

            <Box sx={{
              width: '100%',
              height: '40px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              display: 'flex',
              marginTop: '-10px',
              overflow: 'hidden'
            }}>
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
                      fontWeight: '500'
                    }}
                  >
                    {width > 8 && value.node_count}
                  </div>
                );
              })}
            </Box>

            <div style={{ 
              marginTop: '16px', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              {circleValues.map((value, index) => (
                value && value.node_type_name && (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px'
                  }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: colors[index], 
                      marginRight: '8px',
                      borderRadius: '3px'
                    }} />
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#475569',
                      fontWeight: '500'
                    }}>
                      {value.node_type_name}: {value.node_count}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* 채굴 계획 카드 */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px',
            padding: '24px',
            marginTop: '-10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <Typography sx={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1e293b',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              '&::before': {
                content: '""',
                width: '4px',
                height: '20px',
                backgroundColor: '#3b82f6',
                borderRadius: '2px'
              }
            }}>
              일별 채굴 계획
            </Typography>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px'
            }}>
              <Box sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <Typography sx={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                  설정된 채굴건수
                </Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '20px', fontWeight: '600' }}>
                  {nodeSummary.run_count.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <Typography sx={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                  예정된 채굴량
                </Typography>
                <Typography sx={{ color: '#10b981', fontSize: '20px', fontWeight: '600' }}>
                  {(nodeSummary.mining_amount ? Number(nodeSummary.mining_amount).toLocaleString() : '0')} PTH
                </Typography>
              </Box>

              <Box sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <Typography sx={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                  분배 예정 수
                </Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '20px', fontWeight: '600' }}>
                  {(nodeSummary.run_count * (companyNode.length + 1)).toLocaleString()}
                </Typography>
              </Box>
            </div>
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <div style={{ flex: '1', backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Typography sx={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            '&::before': {
              content: '""',
              width: '4px',
              height: '20px',
              backgroundColor: '#3b82f6',
              borderRadius: '2px'
            }
          }}>
            채굴현황
          </Typography>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            marginTop: '-10px'
          }}>
            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '8px', 
              padding: '16px'
            }}>
              <Typography sx={{ fontSize: '16px', color: '#1e293b', fontWeight: '600', marginBottom: '12px' }}>
                누적 총 채굴정보
              </Typography>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <Typography sx={{ fontSize: '14px', color: '#64748b' }}>채굴건수</Typography>
                  <Typography sx={{ fontSize: '20px', color: '#10b981', fontWeight: '600' }}>
                    {nodeSummary?.total_mining_count?.toLocaleString()} 건
                  </Typography>
                </div>
                <div style={{ marginLeft: '200px' }}>
                  <Typography sx={{ fontSize: '14px', color: '#64748b' }}>채굴량</Typography>
                  <Typography sx={{ fontSize: '20px', color: '#10b981', fontWeight: '600' }}>
                    {nodeSummary?.total_mining_amount?.toLocaleString()} PTH
                  </Typography>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '8px', 
              padding: '16px',
              marginTop: '-10px'
            }}>
              <Typography sx={{ fontSize: '16px', color: '#1e293b', fontWeight: '600', marginBottom: '12px' }}>
                {doneSchedule.schedule_no == -1 ? '오늘의 지급 예정 수량' : '오늘의 지급 완료 수량'}
              </Typography>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '14px', color: '#64748b' }}>유저지급</Typography>
                  <Typography sx={{ fontSize: '16px', color: '#1e293b', fontWeight: '500' }}>
                    {(nodeSummary.mining_amount ? Number(nodeSummary.run_count * 135).toLocaleString() : '0')} PTH
                  </Typography>
                </div>
                
                {companyNode.map((data, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '14px', color: '#64748b' }}>{data.node_name}</Typography>
                    <Typography sx={{ fontSize: '16px', color: '#1e293b', fontWeight: '500' }}>
                      {(data.mining_amount * nodeSummary.run_count).toLocaleString()} PTH
                    </Typography>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '8px', 
              padding: '16px',
              marginTop: '-10px'
            }}>
              <Typography sx={{ fontSize: '16px', color: '#1e293b', fontWeight: '600', marginBottom: '12px' }}>
                총 지급량
              </Typography>
              <Typography sx={{ fontSize: '24px', color: '#10b981', fontWeight: '600' }}>
                {(nodeSummary.mining_amount ? Number((nodeSummary.run_count * 135) + (nodeSummary.company_mining_amount * nodeSummary.run_count)).toLocaleString() : '0')} PTH
              </Typography>
            </div>

            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '8px', 
              padding: '16px'
            }}>
              <Typography sx={{ fontSize: '16px', color: '#1e293b', fontWeight: '600', marginBottom: '12px' }}>
                오늘의 소각량
              </Typography>
              <Typography sx={{ fontSize: '24px', color: '#10b981', fontWeight: '600' }}>
                {todayUserPayAmount} PTH
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
