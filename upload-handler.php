<?php
// Add debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log all activity
error_log("Upload handler accessed at " . date('Y-m-d H:i:s'));
error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("SERVER: " . print_r($_SERVER, true));

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple security check (optional)
$auth_token = 'linkup-customer-secure-token-2025';
$provided_token = '';

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
    if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        $provided_token = $matches[1];
    }
}

// Comment out the auth check for testing, uncomment for production
// if ($provided_token !== $auth_token) {
//     http_response_code(401);
//     echo json_encode(['success' => false, 'error' => 'Unauthorized']);
//     exit();
// }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
    exit();
}

$file = $_FILES['file'];
$customerId = $_POST['customerId'] ?? '';
$type = $_POST['type'] ?? ''; // 'profile', 'nidfront', 'nidback'

if (empty($customerId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Customer ID is required']);
    exit();
}

if (empty($type)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Upload type is required']);
    exit();
}

// Validate file type
$allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowed_types)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.']);
    exit();
}

// Validate file size (5MB max)
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File too large. Maximum 5MB allowed.']);
    exit();
}

// Create customer-specific directory
$base_upload_dir = __DIR__ . '/uploads/';
$customer_dir = $base_upload_dir . 'customers/';
$upload_dir = $customer_dir . $customerId . '/';

// Create directories if they don't exist
if (!file_exists($base_upload_dir)) {
    if (!mkdir($base_upload_dir, 0755, true)) {
        error_log("Failed to create base upload directory: " . $base_upload_dir);
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create upload directory']);
        exit();
    }
}

if (!file_exists($customer_dir)) {
    if (!mkdir($customer_dir, 0755, true)) {
        error_log("Failed to create customer directory: " . $customer_dir);
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create customer directory']);
        exit();
    }
}

if (!file_exists($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        error_log("Failed to create upload directory: " . $upload_dir);
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create upload directory']);
        exit();
    }
}

// Generate secure filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$timestamp = time();
$filename = $customerId . '-' . $type . '-' . $timestamp . '.' . $extension;

$upload_path = $upload_dir . $filename;

if (move_uploaded_file($file['tmp_name'], $upload_path)) {
    // Construct the public URL
    $domain = 'https://server.procloudify.com/~pasherdo';
    $image_url = $domain . '/uploads/customers/' . $customerId . '/' . $filename;
    
    echo json_encode([
        'success' => true,
        'url' => $image_url,
        'filename' => $filename,
        'size' => $file['size'],
        'type' => $file['type'],
        'customerId' => $customerId,
        'uploadType' => $type
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
}
?>
?>
