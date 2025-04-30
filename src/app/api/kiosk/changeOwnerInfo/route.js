// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  const connection = await getConnection();

  await connection.beginTransaction(); // 트랜잭션 시작

  try{


    const {infoOwnerID, infoAddress, infoAddressIdx, infoOwnerIdx, infoEmail, infoTarget, infoSellStatus } = await request.json();

    console.log('infoAddress : ' + infoAddress);
    console.log('infoAddressIdx : ' + infoAddressIdx);
    console.log('infoOwnerIdx : ' + infoOwnerIdx);
    console.log('infoEmail : ' + infoEmail);
    console.log('infoTarget : ' + infoTarget);
    console.log('infoSellStatus : ' + infoSellStatus);

    /*

    if(infoAddress == '' || infoAddress == null || infoAddress == 'undefined'){
    
      return NextResponse.json({ message: '소유자 지갑주소를 수신하지 못했습니다.' }, { status: 401 });
    
    }

    if(infoEmail == '' || infoEmail == null || infoEmail == 'undefined'){
    
      return NextResponse.json({ message: '소유자 이메일 정보를 수신하지 못했습니다.' }, { status: 401 });
    
    }

    if(infoTarget == '' || infoTarget == null || infoTarget == 'undefined'){
    
      return NextResponse.json({ message: '키오스크 타겟정보를 수신하지 못했습니다.' }, { status: 401 });
    
    }

    if(infoAddressIdx == -1 || infoAddressIdx == null || infoAddressIdx == 'undefined'){
    
      return NextResponse.json({ message: '소유자 지갑주소 인덱스 정보를 수신하지 못했습니다.' }, { status: 401 });
    
    }
    */

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
  

    const response = NextResponse.json({ 
      
      result: 'fail',
      result_data : [],
    
    });

    return response;

  //  return NextResponse.json({ message: error.message }, { status: 401 });
 
  }

}