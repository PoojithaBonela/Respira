import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
# Default to the hardcoded one if not set, but user likely needs to override it
DEFAULT_SENDER = "respira.health.app@gmail.com"

def send_reset_email(to_email: str, reset_token: str):
    # Read env vars here
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender_email = os.getenv("SENDER_EMAIL", DEFAULT_SENDER)
    
    print(f"DEBUG: Attempting to send email from {sender_email}")
    if not smtp_password:
        print("WARNING: SMTP_PASSWORD is None or empty.")
        return
    else:
        print(f"DEBUG: SMTP_PASSWORD found (length: {len(smtp_password)})")

    subject = "Reset Your Password - Respira"
    
    # Simple body
    body = f"""
    Hello,

    You requested to reset your password for Respira.
    
    Here is your reset token: {reset_token}
    
    Use this token in the app to reset your password.
    
    This link expires in 15 minutes.
    
    Best,
    Respira Team
    """

    msg = MIMEMultipart()
    msg['From'] = f"RESPIRA <{sender_email}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        # Login with the sender email and the app password
        server.login(sender_email, smtp_password)
        text = msg.as_string()
        server.sendmail(sender_email, to_email, text)
        server.quit()
        print(f"SUCCESS: Email sent to {to_email}")
    except Exception as e:
        print(f"ERROR: Failed to send email: {e}")

def send_daily_insight_email(to_email: str, insight_text: str):
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender_email = os.getenv("SENDER_EMAIL", DEFAULT_SENDER)
    
    if not smtp_password:
        return

    subject = "Today's Insight"
    
    body = f"""
    Hello,
    
    Here is your AI-powered insight for today:

    "{insight_text}"

    Log if you smoke to identify patterns and reduce gradually. Every small step counts on your journey to a smoke-free life.

    Best,
    Respira Team
    """

    msg = MIMEMultipart()
    msg['From'] = f"RESPIRA <{sender_email}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(sender_email, smtp_password)
        text = msg.as_string()
        server.sendmail(sender_email, to_email, text)
        server.quit()
        print(f"SUCCESS: Daily insight email sent to {to_email}")
    except Exception as e:
        print(f"ERROR: Failed to send daily insight email: {e}")
