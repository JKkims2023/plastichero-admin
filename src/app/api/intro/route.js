// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';


export async function POST(request) {

  try{

    const { fromDate } = await request.json();

    const connection = await getConnection();

    const sql = `
    
      SELECT 

        count(node_no) as node_count, 
        node_type,
        if(node_type = '0', '그룹 노드', if(node_type = '1', '키오스크 노드','개별 노드')) as node_type_name

      FROM g5_node_list where delete_flag = 'N' group by node_type;
        
    `;

    const [rows, fields] = await connection.execute(sql);

    const sql_summary = `
    
    SELECT 

      sum(node_no) as node_count, 
      node_type,
      if(node_type = '0', '그룹 노드', if(node_type = '1', '키오스크 노드','개별 노드')) as node_type_name

    FROM g5_node_list where delete_flag = 'N' group by node_type;
      
  `;

    const [rows_summary, fields_summary] = await connection.execute(sql_summary);

    const sql_mining = `
      
      SELECT 

        (select count(node_no) from g5_node_list where delete_flag = 'N') as node_count, 
        (select count(node_no) from g5_node_list where delete_flag = 'N' and stop_yn = 'N') as run_count,
        (select count(node_no) from g5_node_list where delete_flag = 'N' and stop_yn = 'Y') as stop_count
        
    `;

    const [rows_mining, fields_mining] = await connection.execute(sql_mining);

    const sql_company_node = `
      
      SELECT 

        * from g5_node_company_list where stop_yn = 'N' order by order_idx 
        
    `;

    const [rows_company_node, fields_company_node] = await connection.execute(sql_company_node);


    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,
        result_summary : rows_summary,
        result_node_summary : rows_mining[0],
        result_company_node : rows_company_node,


      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

  }

}