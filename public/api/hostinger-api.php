<?php
/**
 * ABSOLUTE GYM - Hostinger MySQL REST API
 * Upload this file to your Hostinger website at: public_html/api/hostinger-api.php
 */

// ==========================================
// 1. HOSTINGER DATABASE CONFIGURATION
// Fill in your Hostinger MySQL credentials here:
// ==========================================
define('DB_HOST', 'localhost');                // Usually 'localhost' in Hostinger
define('DB_NAME', 'u123456789_gymdb');          // Your Hostinger Database Name
define('DB_USER', 'u123456789_gymuser');        // Your Hostinger Database Username
define('DB_PASS', 'YourSecurePasswordHere123!');// Your Hostinger Database Password
define('API_SECRET_KEY', '');                   // Optional: Set a secret key for security (leave empty if not needed)

// ==========================================
// 2. CORS & HTTP HEADERS
// ==========================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Optional API Key Verification
if (API_SECRET_KEY !== '') {
    $providedKey = $_GET['key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? '';
    if ($providedKey !== API_SECRET_KEY) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Invalid API Key']);
        exit;
    }
}

// ==========================================
// 3. DATABASE CONNECTION (PDO)
// ==========================================
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection failed: ' . $e->getMessage(),
            'hint' => 'Please verify DB_NAME, DB_USER, and DB_PASS at top of hostinger-api.php'
        ]);
        exit;
    }
}

// Auto-create tables if missing
function ensureTablesExist($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `gym_config` (
              `id` VARCHAR(50) NOT NULL PRIMARY KEY DEFAULT 'main',
              `data` LONGTEXT NOT NULL,
              `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              `version` VARCHAR(20) DEFAULT '1.0'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `gym_leads` (
              `id` VARCHAR(64) NOT NULL PRIMARY KEY,
              `name` VARCHAR(255) NOT NULL,
              `email` VARCHAR(255) NOT NULL,
              `phone` VARCHAR(50) DEFAULT NULL,
              `type` VARCHAR(50) NOT NULL DEFAULT 'Trial Pass',
              `plan_name` VARCHAR(100) DEFAULT NULL,
              `trainer_name` VARCHAR(100) DEFAULT NULL,
              `preferred_time` VARCHAR(50) DEFAULT NULL,
              `fitness_goal` VARCHAR(255) DEFAULT NULL,
              `message` TEXT DEFAULT NULL,
              `status` VARCHAR(50) NOT NULL DEFAULT 'new',
              `notes` TEXT DEFAULT NULL,
              `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {
        // Continue
    }
}

$action = $_GET['action'] ?? '';
$pdo = getDbConnection();
ensureTablesExist($pdo);

// ==========================================
// 4. ACTION ROUTER
// ==========================================
switch ($action) {
    case 'test':
        $stmt = $pdo->query("SELECT VERSION() as db_version");
        $ver = $stmt->fetch();
        echo json_encode([
            'status' => 'ok',
            'success' => true,
            'message' => 'Successfully connected to Hostinger MySQL Database!',
            'db_version' => $ver['db_version'] ?? 'MySQL',
            'tables_ready' => true,
            'timestamp' => date('c')
        ]);
        break;

    case 'get_config':
        $stmt = $pdo->prepare("SELECT data, updated_at FROM gym_config WHERE id = 'main' LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();
        if ($row && !empty($row['data'])) {
            $jsonData = json_decode($row['data'], true);
            echo json_encode([
                'status' => 'ok',
                'success' => true,
                'data' => $jsonData ? $jsonData : $row['data'],
                'updated_at' => $row['updated_at']
            ]);
        } else {
            echo json_encode([
                'status' => 'ok',
                'success' => true,
                'data' => null,
                'message' => 'No configuration saved yet.'
            ]);
        }
        break;

    case 'save_config':
        $rawInput = file_get_contents('php://input');
        $body = json_decode($rawInput, true);
        $configData = isset($body['data']) ? json_encode($body['data'], JSON_UNESCAPED_UNICODE) : $rawInput;

        if (empty($configData)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Empty configuration payload']);
            break;
        }

        $stmt = $pdo->prepare("
            INSERT INTO gym_config (id, data, updated_at) 
            VALUES ('main', :data, NOW()) 
            ON DUPLICATE KEY UPDATE data = :data_update, updated_at = NOW()
        ");
        $stmt->execute([
            ':data' => $configData,
            ':data_update' => $configData
        ]);

        echo json_encode([
            'status' => 'ok',
            'success' => true,
            'message' => 'Configuration saved successfully to Hostinger MySQL.',
            'timestamp' => date('c')
        ]);
        break;

    case 'get_leads':
        $stmt = $pdo->query("SELECT * FROM gym_leads ORDER BY created_at DESC LIMIT 500");
        $leads = $stmt->fetchAll();
        $formatted = array_map(function($l) {
            return [
                'id' => $l['id'],
                'name' => $l['name'],
                'email' => $l['email'],
                'phone' => $l['phone'] ?? '',
                'type' => $l['type'] ?? 'General Inquiry',
                'planName' => $l['plan_name'] ?? null,
                'trainerName' => $l['trainer_name'] ?? null,
                'preferredTime' => $l['preferred_time'] ?? null,
                'fitnessGoal' => $l['fitness_goal'] ?? null,
                'message' => $l['message'] ?? '',
                'status' => $l['status'] ?? 'new',
                'notes' => $l['notes'] ?? '',
                'createdAt' => $l['created_at'],
            ];
        }, $leads);

        echo json_encode([
            'status' => 'ok',
            'success' => true,
            'leads' => $formatted
        ]);
        break;

    case 'save_lead':
        $rawInput = file_get_contents('php://input');
        $lead = json_decode($rawInput, true);

        if (empty($lead['name']) || empty($lead['email'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Name and Email are required']);
            break;
        }

        $id = $lead['id'] ?? ('lead_' . time() . '_' . substr(md5(uniqid()), 0, 6));
        $stmt = $pdo->prepare("
            INSERT INTO gym_leads (id, name, email, phone, type, plan_name, trainer_name, preferred_time, fitness_goal, message, status, notes, created_at)
            VALUES (:id, :name, :email, :phone, :type, :plan_name, :trainer_name, :preferred_time, :fitness_goal, :message, :status, :notes, NOW())
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status), 
                notes = VALUES(notes),
                phone = VALUES(phone),
                updated_at = NOW()
        ");

        $stmt->execute([
            ':id' => $id,
            ':name' => $lead['name'] ?? 'Visitor',
            ':email' => $lead['email'] ?? '',
            ':phone' => $lead['phone'] ?? null,
            ':type' => $lead['type'] ?? 'Trial Pass',
            ':plan_name' => $lead['planName'] ?? null,
            ':trainer_name' => $lead['trainerName'] ?? null,
            ':preferred_time' => $lead['preferredTime'] ?? null,
            ':fitness_goal' => $lead['fitnessGoal'] ?? null,
            ':message' => $lead['message'] ?? null,
            ':status' => $lead['status'] ?? 'new',
            ':notes' => $lead['notes'] ?? null,
        ]);

        echo json_encode([
            'status' => 'ok',
            'success' => true,
            'message' => 'Lead saved successfully in Hostinger database',
            'id' => $id
        ]);
        break;

    default:
        echo json_encode([
            'status' => 'ok',
            'message' => 'Absolute Gym Hostinger Database API is Active.',
            'endpoints' => [
                '?action=test',
                '?action=get_config',
                '?action=save_config',
                '?action=get_leads',
                '?action=save_lead'
            ]
        ]);
        break;
}
