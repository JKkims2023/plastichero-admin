// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { target_id } = await request.json();


    const connection = await getConnection();

    const sql = `
    
      SELECT 
      
        T.idx, 
        T.user_idx, 
        T.wallet_idx, 
        T.from_address, 
        T.to_address, 
        T.amount, 
        T.memo, 
        T.tx_id, 
        T.reg_date, 
        T.update_date,
        N.node_name,
        N.node_company_no
        
      FROM tbl_pth_transfer_dummy as T left outer join g5_node_company_list as N on T.wallet_idx = N.wallet_idx and N.delete_flag = 'N'


      where memo = '${target_id}';

    `;

    const [rows, fields] = await connection.execute(sql);


    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

    return NextResponse.json({ message: error }, { status: 401 });
  
  }

}