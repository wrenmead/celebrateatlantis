<?php
// send.php - simple endpoint to send contact form mail
// Accepts POST: name, email, phone, message
// Tries to use PHPMailer (if installed), otherwise falls back to mail()

header('Content-Type: application/json; charset=utf-8');

// Basic helper
function respond($ok, $msg = '') {
    echo json_encode(['ok' => $ok, 'error' => $ok ? null : $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid method');
}

$name = trim($_POST['name'] ?? '') ?: 'Anonymous';
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');
$honeypot = trim($_POST['website'] ?? '');

if ($honeypot) respond(false, 'Spam detected');
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, 'Please provide a valid email');
if (!$message) respond(false, 'Please include a message');

$siteName = 'Celebrate Atlantis';
$toEmail = 'info@celebrateatlantis.org'; // change as needed
$subject = "Website contact: {$name}";
$body = "Name: {$name}\nEmail: {$email}\nPhone: {$phone}\n\nMessage:\n{$message}\n";

// Try PHPMailer if available
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        // Use mail() transport by default; for SMTP configure here
        $mail->setFrom($email, $name);
        $mail->addAddress($toEmail, $siteName);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->send();
        respond(true);
    } catch (Exception $ex) {
        // fall through to mail()
    }
}

// Fallback to mail()
$headers = "From: {$name} <{$email}>\r\n" .
           "Reply-To: {$email}\r\n" .
           "X-Mailer: PHP/" . phpversion();

$sent = mail($toEmail, $subject, $body, $headers);
if ($sent) respond(true);
respond(false, 'Unable to send email');
