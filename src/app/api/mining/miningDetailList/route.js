// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { target_id } = await request.json();


    const connection = await getConnection();

    const sql = `
    
      SELECT 
      
        idx, 
        user_idx, 
        wallet_idx, 
        from_address, 
        to_address, 
        amount, 
        memo, 
        tx_id, 
        reg_date, 
        update_date
        
      FROM tbl_pth_transfer_dummy

      where tx_id = '${target_id}';

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