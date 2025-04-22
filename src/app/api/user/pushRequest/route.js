// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';
import axios from 'axios';


export async function POST(request) {

  const connection = await getConnection();

  try{

    const { token, title, body, data } = await request.json();

    console.log(token, title, body, data);


    const result = await axios.post(process.env.NEXT_PUSH_URL + 'api/push/send', {
      token: token,
      title: title,
      body: body,
      data: data,

    });

    if(result.data.result == 'success'){

          const response = NextResponse.json({ 
          
          result: 'success',

        }); 

        connection.release(); // 연결 반환

        return response;

    }else{

      const response = NextResponse.json({ 
        
        result: 'fail',
        error: result.data.error,

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