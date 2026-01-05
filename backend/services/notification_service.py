import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class NotificationService:
    def __init__(self):
        self.sender_email = os.getenv("ALERT_SENDER_EMAIL")
        self.sender_password = os.getenv("ALERT_EMAIL_PASSWORD")
        self.receiver_email = os.getenv("ALERT_RECEIVER_EMAIL")
        print("Sender:", self.sender_email)
        print("Receiver:", self.receiver_email)
        print("ENV CHECK:", self.sender_email)
        if not all([self.sender_email, self.sender_password, self.receiver_email]):
            raise RuntimeError("Email alert environment variables not set")

    def send_alert(self, segment_id, fault, priority, confidence):
        subject = f"🚨 Predictive Maintenance Alert | Segment {segment_id}"

        body = f"""
CRITICAL INFRASTRUCTURE ALERT

Segment ID: {segment_id}
Detected Fault: {fault}
Priority Level: {priority}
Prediction Confidence: {confidence:.2f}

Immediate maintenance action is recommended.
"""

        msg = MIMEMultipart()
        msg["From"] = self.sender_email
        msg["To"] = self.receiver_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)
                print(f"✅ Alert email sent for Segment {segment_id}")
        except Exception as e:
            print("❌ Email alert failed:", e)