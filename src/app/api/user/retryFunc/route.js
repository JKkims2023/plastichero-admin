// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';
import axios from 'axios';


export async function POST(request) {

  const connection = await getConnection();

  try{

    const {new_address, count, timestamp } = await request.json();

    console.log(new_address, count, timestamp);



    const headers_config = {

        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',   
        
    };

    const result = await axios({
 
      url : 'https://backend-api.plasticherokorea.com/' + 'api/regist/migration_reward', 
      method : 'POST',
      headers : headers_config,
      data : {

          "to" : new_address,
          "count" : parseFloat(count.toString().replace(/,/g, '')),
          "timestamp" : timestamp,  // UTC 10자리 타임스탬프
      },
      transformRequest: [data => JSON.stringify(data)], // 요청 데이터를 JSON 문자열로 변환

    });

    if(result.data.success){

          const response = NextResponse.json({ 
          
          result: 'success',

        }); 

        connection.release(); // 연결 반환

        return response;

    }else{


      let info = '';

      switch(result.data.code){

          case 'MR_001': // user_idx 필드누락.
              info = 'to 필드 누락 또는 유효한 지갑 주소(EVM기반 주소 체계)가 아닐경우';
              break;
          case 'MR_002': // to 필드 누락 또는 유효한 지갑 주소가 아님.
              info = 'count 필드 누락 또는 0 이하 값 일경우';
              break;
          case 'MR_003': // count 필드 누락 또는 0 이하의 값.
              info = 'timestamp 필드 누락';
              break;
          case 'MR_100': // Timestamp 필드 누락.
              info = '이미 존재 하는 To 주소';
              break;
          case 'MR_500': // 이미 리워드 받은 회원.
              info = 'DB 에러';
              break;
          default: // DB에러.
              info = 'DB에러';
              break;
              
      }

      const response = NextResponse.json({ 
        
        result: 'fail',
        error: info,

      });

      connection.release(); // 연결 반환
    
      return response;
    
    }
  
  }catch(error){

    console.log(error);

    connection.release(); // 연결 반환

    const response = NextResponse.json({ 
        
      result: 'fail',
      error: error.message,

    });

    return response;


  }

}