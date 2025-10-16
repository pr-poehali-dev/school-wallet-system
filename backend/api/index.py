"""
Business: API для управления пользователями, заявками на пополнение и вывод средств
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP response с данными из базы данных
"""

import json
import os
import psycopg2
from typing import Dict, Any

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('queryStringParameters', {}).get('action', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'register':
                full_name = body_data.get('fullName')
                pin_code = body_data.get('pinCode')
                
                cur.execute(
                    "SELECT id FROM t_p35973246_school_wallet_system.users WHERE full_name = %s",
                    (full_name,)
                )
                if cur.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'ФИО уже занято'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    """INSERT INTO t_p35973246_school_wallet_system.users 
                       (full_name, pin_code, balance, created_at, updated_at) 
                       VALUES (%s, %s, 0, NOW(), NOW()) RETURNING id, full_name, balance""",
                    (full_name, pin_code)
                )
                user = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': user[0], 'fullName': user[1], 'balance': float(user[2])}),
                    'isBase64Encoded': False
                }
            
            elif action == 'login':
                full_name = body_data.get('fullName')
                pin_code = body_data.get('pinCode')
                
                cur.execute(
                    "SELECT id, full_name, balance FROM t_p35973246_school_wallet_system.users WHERE full_name = %s AND pin_code = %s",
                    (full_name, pin_code)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверное ФИО или PIN-код'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': user[0], 'fullName': user[1], 'balance': float(user[2])}),
                    'isBase64Encoded': False
                }
            
            elif action == 'deposit_request':
                user_id = body_data.get('userId')
                amount = body_data.get('amount')
                
                cur.execute(
                    """INSERT INTO t_p35973246_school_wallet_system.deposit_requests 
                       (user_id, amount, status, created_at) 
                       VALUES (%s, %s, 'pending', NOW()) RETURNING id""",
                    (user_id, amount)
                )
                request_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': request_id, 'status': 'pending'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'withdrawal_request':
                user_id = body_data.get('userId')
                amount = body_data.get('amount')
                
                cur.execute(
                    """INSERT INTO t_p35973246_school_wallet_system.withdrawal_requests 
                       (user_id, amount, status, created_at) 
                       VALUES (%s, %s, 'pending', NOW()) RETURNING id""",
                    (user_id, amount)
                )
                request_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': request_id, 'status': 'pending'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'approve_deposit':
                request_id = body_data.get('requestId')
                
                cur.execute(
                    "SELECT user_id, amount FROM t_p35973246_school_wallet_system.deposit_requests WHERE id = %s",
                    (request_id,)
                )
                request = cur.fetchone()
                
                if request:
                    user_id, amount = request
                    cur.execute(
                        "UPDATE t_p35973246_school_wallet_system.users SET balance = balance + %s WHERE id = %s",
                        (amount, user_id)
                    )
                    cur.execute(
                        "UPDATE t_p35973246_school_wallet_system.deposit_requests SET status = 'approved', processed_at = NOW() WHERE id = %s",
                        (request_id,)
                    )
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'approved'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'reject_deposit':
                request_id = body_data.get('requestId')
                cur.execute(
                    "UPDATE t_p35973246_school_wallet_system.deposit_requests SET status = 'rejected', processed_at = NOW() WHERE id = %s",
                    (request_id,)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'rejected'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'approve_withdrawal':
                request_id = body_data.get('requestId')
                
                cur.execute(
                    "SELECT user_id, amount FROM t_p35973246_school_wallet_system.withdrawal_requests WHERE id = %s",
                    (request_id,)
                )
                request = cur.fetchone()
                
                if request:
                    user_id, amount = request
                    cur.execute(
                        "UPDATE t_p35973246_school_wallet_system.users SET balance = balance - %s WHERE id = %s",
                        (amount, user_id)
                    )
                    cur.execute(
                        "UPDATE t_p35973246_school_wallet_system.withdrawal_requests SET status = 'approved', processed_at = NOW() WHERE id = %s",
                        (request_id,)
                    )
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'approved'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'reject_withdrawal':
                request_id = body_data.get('requestId')
                cur.execute(
                    "UPDATE t_p35973246_school_wallet_system.withdrawal_requests SET status = 'rejected', processed_at = NOW() WHERE id = %s",
                    (request_id,)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'rejected'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'update_balance':
                user_id = body_data.get('userId')
                amount = body_data.get('amount')
                
                cur.execute(
                    "UPDATE t_p35973246_school_wallet_system.users SET balance = balance + %s WHERE id = %s RETURNING balance",
                    (amount, user_id)
                )
                new_balance = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'balance': float(new_balance)}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            action = event.get('queryStringParameters', {}).get('action')
            
            if action == 'users':
                cur.execute("SELECT id, full_name, balance FROM t_p35973246_school_wallet_system.users ORDER BY balance DESC")
                users = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([{'id': u[0], 'fullName': u[1], 'balance': float(u[2])} for u in users]),
                    'isBase64Encoded': False
                }
            
            elif action == 'deposit_requests':
                cur.execute("""
                    SELECT dr.id, dr.user_id, u.full_name, dr.amount, dr.status, dr.created_at
                    FROM t_p35973246_school_wallet_system.deposit_requests dr
                    JOIN t_p35973246_school_wallet_system.users u ON dr.user_id = u.id
                    ORDER BY dr.created_at DESC
                """)
                requests = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([{
                        'id': r[0], 
                        'userId': r[1], 
                        'userName': r[2], 
                        'amount': float(r[3]), 
                        'status': r[4],
                        'date': r[5].strftime('%d.%m.%Y %H:%M')
                    } for r in requests]),
                    'isBase64Encoded': False
                }
            
            elif action == 'withdrawal_requests':
                cur.execute("""
                    SELECT wr.id, wr.user_id, u.full_name, wr.amount, wr.status, wr.created_at
                    FROM t_p35973246_school_wallet_system.withdrawal_requests wr
                    JOIN t_p35973246_school_wallet_system.users u ON wr.user_id = u.id
                    ORDER BY wr.created_at DESC
                """)
                requests = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([{
                        'id': r[0], 
                        'userId': r[1], 
                        'userName': r[2], 
                        'amount': float(r[3]), 
                        'status': r[4],
                        'date': r[5].strftime('%d.%m.%Y %H:%M')
                    } for r in requests]),
                    'isBase64Encoded': False
                }
            
            elif action == 'user_balance':
                user_id = event.get('queryStringParameters', {}).get('userId')
                cur.execute("SELECT balance FROM t_p35973246_school_wallet_system.users WHERE id = %s", (user_id,))
                result = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'balance': float(result[0]) if result else 0}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Not found'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
