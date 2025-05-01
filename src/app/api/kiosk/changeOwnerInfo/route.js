// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  const connection = await getConnection();


  try{


    const {infoOwnerID, infoAddress, infoAddressIdx, infoOwnerIdx, infoEmail, infoTarget, infoSellStatus } = await request.json();

    console.log('infoAddress : ' + infoAddress);
    console.log('infoAddressIdx : ' + infoAddressIdx);
    console.log('infoOwnerIdx : ' + infoOwnerIdx);
    console.log('infoEmail : ' + infoEmail);
    console.log('infoTarget : ' + infoTarget);
    console.log('infoSellStatus : ' + infoSellStatus);

    const sql = `
      
      UPDATE 

        g5_kiosk SET 

        owner_id = '${infoOwnerID}',
        owner_key = ${infoOwnerIdx},
        wallet_idx = ${infoAddressIdx},
        sell_status = '${infoSellStatus}'

      WHERE kc_no = ${infoTarget}

    `;

    const [rows, fields] = await connection.execute(sql);


    console.log( sql);
    console.log(rows);

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