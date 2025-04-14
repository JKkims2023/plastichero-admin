// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';
import axios from 'axios';


export async function POST(request) {

  const connection = await getConnection();

  try{

    const { token, title, body, data } = await request.json();

    console.log(token, title, body, data);

    const sql = `
    
      SELECT 
      
        B.blacklist_no,
        B.block_type,
        if(B.block_type = '0', '불법접근', if(B.block_type = '1', '해킹시도', if(B.block_type = '9', '기타', ''))) as block_type_text,
        B.memo,
        DATE_FORMAT(B.reg_date , '%Y-%m-%d %H:%i:%S') as reg_date,
        DATE_FORMAT(B.expire_date , '%Y-%m-%d %H:%i:%S') as expire_date,
        M.mb_no, 
        M.mb_id, 
        M.mb_name, 
        M.mb_email, 

        DATE_FORMAT(M.mb_today_login , '%Y-%m-%d %H:%i:%S') as mb_today_login, 
        W.address as mb_wallet

        
      FROM g5_member_blacklist as B left outer join g5_member as M on B.mb_no = M.mb_no left outer join tbl_pth_wallet_info as W on M.mb_no = W.user_idx
      
      where B.delete_flag = 'N' and M.mb_leave_date = '' and W.is_main = 'O' and W.active = 'O'
      
      ;

    `;

//    const [rows, fields] = await connection.execute(sql);


    const result = await axios.post(process.env.NEXT_PUSH_URL + 'api/push/send', {
      token: token,
      title: title,
      body: body,
      data: data,

    });



/*
const result = await axios.post(process.env.NEXT_PUSH_URL + 'api/push/result-send', {
  token: token,
  amount: 59,
  result_key: 'test_key'

});
*/
/*
const result = await axios.post('https://port-0-plastichero-batch-m90know96390d9a9.sel4.cloudtype.app/' + 'api/push/result-send', {
  token: token,
  amount: 59,
  result_key: 'test_key'

});
*/


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