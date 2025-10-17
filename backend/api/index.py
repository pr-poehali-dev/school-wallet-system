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

def escape_string(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
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
                    f"SELECT id FROM t_p35973246_school_wallet_system.users WHERE full_name = {escape_string(full_name)}"
                )
                if cur.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'ФИО уже занято'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"""INSERT INTO t_p35973246_school_wallet_system.users 
                       (full_name, pin_code, balance, created_at, updated_at) 
                       VALUES ({escape_string(full_name)}, {escape_string(pin_code)}, 0, NOW(), NOW()) 
                       RETURNING id, full_name, balance"""
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
                    f"SELECT id, full_name, balance FROM t_p35973246_school_wallet_system.users WHERE full_name = {escape_string(full_name)} AND pin_code = {escape_string(pin_code)}"
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
                    f"""INSERT INTO t_p35973246_school_wallet_system.deposit_requests 
                       (user_id, amount, status, created_at) 
                       VALUES ({user_id}, {amount}, 'pending', NOW()) RETURNING id"""
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
                    f"""INSERT INTO t_p35973246_school_wallet_system.withdrawal_requests 
                       (user_id, amount, status, created_at) 
                       VALUES ({user_id}, {amount}, 'pending', NOW()) RETURNING id"""
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
                    f"SELECT user_id, amount FROM t_p35973246_school_wallet_system.deposit_requests WHERE id = {request_id}"
                )
                request = cur.fetchone()
                
                if request:
                    user_id, amount = request
                    cur.execute(
                        f"UPDATE t_p35973246_school_wallet_system.users SET balance = balance + {amount} WHERE id = {user_id}"
                    )
                    cur.execute(
                        f"UPDATE t_p35973246_school_wallet_system.deposit_requests SET status = 'approved', processed_at = NOW() WHERE id = {request_id}"
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
                    f"UPDATE t_p35973246_school_wallet_system.deposit_requests SET status = 'rejected', processed_at = NOW() WHERE id = {request_id}"
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
                    f"SELECT user_id, amount FROM t_p35973246_school_wallet_system.withdrawal_requests WHERE id = {request_id}"
                )
                request = cur.fetchone()
                
                if request:
                    user_id, amount = request
                    cur.execute(
                        f"UPDATE t_p35973246_school_wallet_system.users SET balance = balance - {amount} WHERE id = {user_id}"
                    )
                    cur.execute(
                        f"UPDATE t_p35973246_school_wallet_system.withdrawal_requests SET status = 'approved', processed_at = NOW() WHERE id = {request_id}"
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
                    f"UPDATE t_p35973246_school_wallet_system.withdrawal_requests SET status = 'rejected', processed_at = NOW() WHERE id = {request_id}"
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
                    f"UPDATE t_p35973246_school_wallet_system.users SET balance = balance + {amount} WHERE id = {user_id}"
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'success'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'casino_bet':
                user_id = body_data.get('userId')
                amount = body_data.get('amount')
                multiplier = body_data.get('multiplier')
                won = body_data.get('won')
                
                cur.execute(
                    f"""INSERT INTO t_p35973246_school_wallet_system.casino_games 
                       (user_id, bet_amount, multiplier, won, created_at) 
                       VALUES ({user_id}, {amount}, {multiplier}, {won}, NOW())"""
                )
                
                if won:
                    win_amount = int(amount * multiplier)
                    cur.execute(
                        f"UPDATE t_p35973246_school_wallet_system.users SET balance = balance + {win_amount} WHERE id = {user_id}"
                    )
                else:
                    cur.execute(
                        f"UPDATE t_p35973246_school_wallet_system.users SET balance = balance - {amount} WHERE id = {user_id}"
                    )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'success'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', '')
            
            if action == 'users':
                cur.execute("SELECT id, full_name, balance, created_at FROM t_p35973246_school_wallet_system.users ORDER BY created_at DESC")
                users = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([{
                        'id': u[0], 
                        'fullName': u[1], 
                        'balance': float(u[2]),
                        'createdAt': u[3].isoformat() if u[3] else None
                    } for u in users]),
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
                        'createdAt': r[5].isoformat() if r[5] else None
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
                        'createdAt': r[5].isoformat() if r[5] else None
                    } for r in requests]),
                    'isBase64Encoded': False
                }
            
            elif action == 'user_balance':
                user_id = event.get('queryStringParameters', {}).get('userId')
                cur.execute(f"SELECT balance FROM t_p35973246_school_wallet_system.users WHERE id = {user_id}")
                result = cur.fetchone()
                
                if result:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'balance': float(result[0])}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь не найден'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'leaderboard':
                cur.execute("""
                    SELECT u.id, u.full_name, u.balance,
                           COALESCE(SUM(CASE WHEN cg.won THEN cg.bet_amount * cg.multiplier ELSE 0 END), 0) as total_wins
                    FROM t_p35973246_school_wallet_system.users u
                    LEFT JOIN t_p35973246_school_wallet_system.casino_games cg ON u.id = cg.user_id
                    GROUP BY u.id, u.full_name, u.balance
                    ORDER BY u.balance DESC
                    LIMIT 10
                """)
                leaders = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([{
                        'id': l[0],
                        'fullName': l[1],
                        'balance': float(l[2]),
                        'totalWins': float(l[3])
                    } for l in leaders]),
                    'isBase64Encoded': False
                }
            
            elif action == 'user_stats':
                user_id = event.get('queryStringParameters', {}).get('userId')
                
                cur.execute(f"""
                    SELECT 
                        u.created_at as last_visit,
                        COALESCE(SUM(CASE WHEN cg.won THEN cg.bet_amount * cg.multiplier - cg.bet_amount ELSE 0 END), 0) as casino_wins,
                        (SELECT COUNT(*) FROM t_p35973246_school_wallet_system.deposit_requests WHERE user_id = {user_id} AND status = 'approved') +
                        (SELECT COUNT(*) FROM t_p35973246_school_wallet_system.withdrawal_requests WHERE user_id = {user_id} AND status = 'approved') as total_transactions
                    FROM t_p35973246_school_wallet_system.users u
                    LEFT JOIN t_p35973246_school_wallet_system.casino_games cg ON u.id = cg.user_id
                    WHERE u.id = {user_id}
                    GROUP BY u.id, u.created_at
                """)
                result = cur.fetchone()
                
                if result:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'lastVisit': result[0].isoformat() if result[0] else None,
                            'casinoWins': float(result[1]),
                            'totalTransactions': int(result[2])
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь не найден'}),
                        'isBase64Encoded': False
                    }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()