// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  const connection = await getConnection();

  await connection.beginTransaction(); // 트랜잭션 시작

  try{


    const { infoAddress, infoAddressIdx, infoOwnerIdx, infoEmail, infoTarget, infoSellStatus } = await request.json();

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

        owner_id = '${infoEmail}',
        owner_key = ${infoOwnerIdx},
        wallet_idx = ${infoAddressIdx},
        sell_status = '${infoSellStatus}'

      WHERE kc_no = ${infoTarget}

    `;

    const [rows, fields] = await connection.execute(sql);

/*
    // 업데이트 성공 시 실제 노드 적용
    if(rows.affectedRows == 1){

      const sql_update_node = `

        UPDATE g5_node_list SET

        wallet_idx = ${infoAddressIdx},

        mb_no = ${infoOwnerIdx}
      
        where kc_kiosk_id = ${infoTarget}

      `;

      const [rows_node, fields_node] = await connection.execute(sql_update_node);

      await connection.commit(); // 커밋 처리

      const response = NextResponse.json({ 
      
        result: 'success',
        result_data : [],
      
      });
  

      connection.release(); // 연결 반환
      
      return response;

    }else{

      await connection.rollback(); // 롤백 처리
  
      connection.release(); // 연결 반환

      return NextResponse.json({ message: '정보 수정 중 문제가 발생하였습니다.' }, { status: 401 });
  
    }
    */

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