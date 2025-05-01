// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  const connection = await getConnection();


  try{


    const {infoTarget} = await request.json();


    const sql = `
      
      UPDATE 

        g5_kiosk SET 

        owner_id = '',
        owner_key = -1,
        wallet_idx = -1,
        sell_status = '0'

      WHERE kc_no = ${infoTarget}

    `;

    const [rows, fields] = await connection.execute(sql);


    const response = NextResponse.json({ 
      
      result: 'success',
      result_data : [],
    
    });

    connection.release(); // 연결 반환

    return response;
    
  }catch(error){

    try{
      
      connection.release();

    }catch(error){

      console.log(error);
    }

    const response = NextResponse.json({ 
      
      result: 'fail',
      result_data : [],
    
    });

    return response;

  //  return NextResponse.json({ message: error.message }, { status: 401 });
 
  }

}