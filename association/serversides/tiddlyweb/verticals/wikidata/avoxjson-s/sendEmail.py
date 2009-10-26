#sends email from a specified server
import smtplib

from email.mime.text import MIMEText

def send(to,subject,body):
    if type(to) is str:
       to = [to]
    msg = MIMEText(body)
    msg['subject'] = subject
    #msg['From'] = fromName+' <'+fromEmail+'>'
    #msg['Reply-To'] = fromEmail
    fromEmail = 'avox@wiki-data.com'
    msg['From'] = 'Avox <'+fromEmail+'>'
    msg['Reply-To'] = fromEmail
    msg['To'] = ""
    for e in to:
        msg['To'] += e
    s = smtplib.SMTP('localhost')
    s.sendmail(fromEmail,to,msg.as_string())