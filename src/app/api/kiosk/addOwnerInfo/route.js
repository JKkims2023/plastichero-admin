
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  const connection = await getConnection();

  await connection.beginTransaction(); // 트랜잭션 시작

  try{


    const { infoAddress, infoAddressIdx, infoOwnerIdx, infoEmail, infoTarget } = await request.json();

    let company_wallet_idx = -1;
    let company_owner_idx = -1;

    console.log('infoAddress : ' + infoAddress);
    console.log('infoAddressIdx : ' + infoAddressIdx);
    console.log('infoOwnerIdx : ' + infoOwnerIdx);
    console.log('infoEmail : ' + infoEmail);
    console.log('infoTarget : ' + infoTarget);



    if(infoAddress == '' || infoAddress == null || infoAddress == 'undefined'){
    
      await connection.rollback(); // 롤백 처리
      connection.release(); // 연결 반환

      return NextResponse.json({ message: '소유자 지갑주소를 수신하지 못했습니다.' }, { status: 401 });
    
    }

    if(infoEmail == '' || infoEmail == null || infoEmail == 'undefined'){
    
      await connection.rollback(); // 롤백 처리
      connection.release(); // 연결 반환

      return NextResponse.json({ message: '소유자 이메일 정보를 수신하지 못했습니다.' }, { status: 401 });
    
    }

    if(infoTarget == '' || infoTarget == null || infoTarget == 'undefined'){
    
      await connection.rollback(); // 롤백 처리
      connection.release(); // 연결 반환

      return NextResponse.json({ message: '키오스크 타겟정보를 수신하지 못했습니다.' }, { status: 401 });
    
    }

    if(infoAddressIdx == -1 || infoAddressIdx == null || infoAddressIdx == 'undefined'){
    
      await connection.rollback(); // 롤백 처리
      connection.release(); // 연결 반환
      
      return NextResponse.json({ message: '소유자 지갑주소 인덱스 정보를 수신하지 못했습니다.' }, { status: 401 });
    
    }

    const sql_base_node = `

      SELECT 
        C.wallet_idx,
        C.user_key,  
        C.node_name,
        C.mining_amount,
        W.new_address as address

      FROM g5_node_company_list as C inner join tbl_pth_wallet_info as W on C.wallet_idx = W.idx
      WHERE node_company_no = 4
    
    `;

    const [rows_base_node, fields_base_node] = await connection.execute(sql_base_node);

    if(rows_base_node.length > 0){

      company_wallet_idx = rows_base_node[0].wallet_idx;
      company_owner_idx = rows_base_node[0].user_key;

    }else{

      await connection.rollback(); // 롤백 처리
      connection.release(); // 연결 반환

      return NextResponse.json({ message: '키오스크 기본 노드 정보를 수신하지 못했습니다.' }, { status: 401 });

    }
    
    const sql = `
      
      UPDATE 

        g5_kiosk SET 

        owner_id = '${infoEmail}',
        owner_key = ${infoOwnerIdx},
        wallet_idx = ${infoAddressIdx},
        sell_status = '1'

      WHERE kc_no = ${infoTarget}

    `;

    const [rows, fields] = await connection.execute(sql);


    // 업데이트 성공 시 실제 노드 적용
    if(rows.affectedRows == 1){

        const sql_node = `

          INSERT INTO g5_node_list
          (kc_kiosk_id, 
          wallet_idx, 
          mb_no, 
          node_name, 
          miningAmount, 
          node_type, 
          stop_yn, 
          buy_date, 
          reg_date)
          VALUES(
          ${infoTarget}, 
          ${infoAddressIdx}, 
          ${infoOwnerIdx}, 
          'KIOSK-${infoTarget}', 
          1080, 
          '1', 
          'N', 
          CURRENT_TIMESTAMP, 
          CURRENT_TIMESTAMP);
        `;

        const [rows_node, fields_node] = await connection.execute(sql_node);


        if(rows_node.affectedRows != 1){
          
          await connection.rollback(); // 롤백 처리
          connection.release(); // 연결 반환

          return NextResponse.json({ message: '노드 정보 생성중 문제가 발생하였습니다.' }, { status: 401 });
        
        }else{

            const sql_company_node = `

              INSERT INTO g5_node_list
              (kc_kiosk_id, 
              wallet_idx, 
              mb_no, 
              node_name, 
              miningAmount, 
              node_type, 
              stop_yn, 
              buy_date, 
              reg_date)
              VALUES(
              ${infoTarget}, 
              ${company_wallet_idx}, 
              ${company_owner_idx}, 
              'WITH-COMPANY-${infoTarget}', 
              540, 
              '0', 
              'N', 
              CURRENT_TIMESTAMP, 
              CURRENT_TIMESTAMP);
            `;

            const [rows_company_node, fields_company_node] = await connection.execute(sql_company_node);

            if(rows_company_node.affectedRows != 1){
              
              await connection.rollback(); // 롤백 처리
              connection.release(); // 연결 반환

              return NextResponse.json({ message: '회사 노드 정보 생성중 문제가 발생하였습니다.' }, { status: 401 });
            
            }

        

        }

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
    
  }catch(error){
  
    await connection.rollback(); // 롤백 처리
    connection.release(); // 연결 반환

    return NextResponse.json({ message: error.message }, { status: 401 });
 
  }

}