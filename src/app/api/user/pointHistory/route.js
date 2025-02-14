// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, gridClasses} from '@mui/x-data-grid';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { mb_id, pagingIdx, filterInfo } = await request.json();

    const connection = await getConnection();

    let sql_filter = '';

    if(filterInfo == '0'){

    }else{

      switch(filterInfo){

        case '1':
          sql_filter = 'and point_type = 1';
          break;
        case '2':
          sql_filter = 'and point_type = 2';
          break;
        case '3':
          sql_filter = 'and point_type = 3';
          break;
        case '4':
          sql_filter = 'and point_type = 4';
          break;
        case '5':
          sql_filter = 'and point_type = 5';
          break;
        case '6':
          sql_filter = 'and point_type = 6';
          break;
        case '7':
          sql_filter = 'and point_type = 7';
          break;
        case '8':
          sql_filter = 'and point_type = 8';
          break;
        default:
          break;
      } 
    }

    const sql = `
    
      SELECT 
      
        po_id, 
        po_content, 
        po_point, 
        po_use_point,
        DATE_FORMAT(po_datetime , '%Y-%m-%d %H:%i:%S') as po_datetime,  
        if(po_reward_type = '0', 'Point', 'PTH') as po_reward_type,
        if(po_reward_type = '0', po_point, po_pth) as point_amount
        
      from tbl_point where mb_id = '${mb_id}' ${sql_filter} order by po_datetime desc;

    `;

    const [rows, fields] = await connection.execute(sql);

    console.log('total length : ' + rows.length );

    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

  }

}