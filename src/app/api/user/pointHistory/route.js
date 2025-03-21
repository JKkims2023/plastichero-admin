// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, gridClasses} from '@mui/x-data-grid';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { mb_id, pagingIdx, filterInfo } = await request.json();

    const connection = await getConnection();

    const sql = `
             
      SELECT 

      G.od_id, 
      G.od_mbid, 
      G.od_price, 
      G.od_goods_name, 
      G.od_goods_code, 
      G.od_mms_msg, 
      G.od_mms_title, 
      G.od_callback, 
      G.od_phone, 
      G.od_tr_id, 
      G.od_user_id, 
      G.od_orderNo, 
      G.od_response_code, 
      G.od_response_message, 
      G.od_status, 
      DATE_FORMAT(G.od_regdate , '%Y-%m-%d %H:%i:%S') as od_regdate, 
      G.od_resend, 
      G.od_goodsimg, 
      G.delete_flag

      FROM g5_giftshow_order as G 
      WHERE G.delete_flag = 'N'
      and G.od_mbid = '${mb_id}' order by G.od_regdate desc;

      `;
 
    const [rows, fields] = await connection.execute(sql);

    const sql_summary = `
      
    SELECT 

        (select count(od_id) from g5_giftshow_order
        WHERE delete_flag = 'N' and (od_status = '02' or od_status = '01' or od_status = '07' or od_status = '08' or od_status = '11')
        and od_mbid = '${mb_id}') as total_count,

        (select COALESCE(sum(od_price), 0) from g5_giftshow_order
        WHERE delete_flag = 'N' and (od_status = '02' or od_status = '01' or od_status = '07' or od_status = '08' or od_status = '11')
        and od_mbid = '${mb_id}') as total_price,

        (select count(od_id) from g5_giftshow_order
        WHERE delete_flag = 'N' and (od_status = '02' or od_status = '01' or od_status = '08' or od_status = '11')
        and od_mbid = '${mb_id}') as used_count,

        (select COALESCE(sum(od_price), 0) from g5_giftshow_order
        WHERE delete_flag = 'N' and (od_status = '02' or od_status = '01' or od_status = '08' or od_status = '11')
        and od_mbid = '${mb_id}') as used_price,

        (select count(od_id) from g5_giftshow_order
        WHERE delete_flag = 'N' and od_status = '07'
        and od_mbid = '${mb_id}') as cancel_count,

        (select COALESCE(sum(od_price), 0) from g5_giftshow_order
        WHERE delete_flag = 'N' and od_status = '07'
        and od_mbid = '${mb_id}') as cancel_price


    `;

    const [summary, fields_summary] = await connection.execute(sql_summary);

    console.log(summary);

    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,
        result_summary : summary[0]

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

  }

}