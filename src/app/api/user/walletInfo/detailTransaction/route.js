// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { walletLib } from '../../../../../utils/wallet';
import { ethers } from 'ethers';


export async function POST(request) {

  try{

    const { wallet_address } = await request.json();

    const result = await walletLib.queryTransaction(wallet_address, 10, 0);

    if(result.error_code !== 200){

      return NextResponse.json({ 
        result: 'fail',
        result_historydata : [],
      });

    }else{
      // 트랜잭션 데이터 처리
      const processedData = result.data.map(data => ({
        ...data,
        value: ethers.utils.formatEther(data.value),
        tr_type : data.from == wallet_address ? '출금' : '입금',
        timeStamp: new Date(Number(data.timeStamp) * 1000).toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      }));

      return NextResponse.json({ 
        result: 'success',
        result_historydata : processedData,
      });
      
    }

  
  }catch(error){

    return NextResponse.json({ 
      result: 'fail',
      result_historydata : error,
    });

  }

}