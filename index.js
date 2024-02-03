/*imap module is a third-party package that provides an API for working with the Internet Message Access Protocol(IMAP)
which is a protocol used for accessing email messages on a mail server*/
const Imap = require('imap')
/*{}extract simpleParser properties such as 'subject', 'from', to 'CC', 'bcc', 'date', 'text', 'html' and 'attachments'.
mailparser provides utilities for parsing and decoding email messages, including attachments, headers and message
bodies*/
const { simpleParser } = require('mailparser');
/*import nodemailer which is a third-party package for node.js that provides an easy-to-use API for sending email messages
using various email providers and protocols, including SMTP, sendmail, Amazon SES and more.*/
const nodemailer = require('nodemailer')
/*the 'dotenv' module is a third-party package for node.js that simplifies the process of loading environment variables by
reading a .env file in the project directory and setting process .env properties accordingly.*/

/*the require function loads the 'dotenv' module into the application, and the '.config()' function is called to read the
.env file and set the process .env properties accordingly.*/
require('dotenv').config()

/*is a Javascript code that defines a constant variable named 'AUTO_REPLY_ADDRESS' and assign it the string value 
'example@example.com'*/
const AUTO_REPLY_ADDRESS = 'tksiang123@outlook.com'

/*sendEmail function, the formula for sendEmail is 
function sendEmail(recipientEmails: any[] | undefined, subject: any, body: any): void*/
function sendEmail(recipientEmails = [], subject, body) {
  console.log(`Auto replying to ${recipientEmails}`)
  // for you to implement
  //create a send mail port//
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  //send email with defined transport object//
  transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: AUTO_REPLY_ADDRESS,
    subject: subject,
    text: body
  })
}

/*function of manage inbox message*/
function manageInbox() {
  /*create a onject call imap*/
  const imap = new Imap({
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    /*used for secure communication over the Internet*/
    tls: true,
    /*options for TLS*/
    tlsOptions: { servername: 'imap.gmail.com' }
  });

  /*getEmail function*/
  function getEmail(start, number) {
    console.log(`Getting email from seq: ${start}:${start + number}`)
    const f = imap.seq.fetch(`${start}:${start + number}`, {
      bodies: '',
      struct: true
    });
    /*the 'on' method is used to attach an event listener to the 'f' object
    to listen for the 'message' event*/
    f.on('message', function (msg, seqno) {
      const prefix = '#' + seqno;
      msg.on('body', stream => {
        simpleParser(stream, async (err, parsed) => {
          const { from, to, subject, date, textAsHtml, text } = parsed;
          console.log("-------------------");
          console.log("Email No. %s", prefix)
          console.log({ from: from.value[0], to: to.value, subject, date, textAsHtml, text });
          console.log("-------------------");

          //auto reply message//
          if (from.value[0].address == AUTO_REPLY_ADDRESS) {
            sendEmail([from.value[0].address], `Re: ${subject}`, `Noted with thanks.\nRight on it, boss!\n\nHave a great day,\n${process.env.YOUR_NAME}`)
          }
        });
      });
    });
  }

  /*the code sets up an event listener for the 'error' event on the 'imap' object.
  this function will be trigger if error occur and then will be show at the terminal*/
  imap.once('error', function (err) {
    console.log(`Error: ${err}`);
  });

  /*the code sets up an event listener for the 'end' event on the 'imap' object.
  this function will be trigger when the connection is force close*/
  imap.once('end', function () {
    console.log('Connection ended');
  });

  /*.openBox in here is indicate open specific mailbox that exists on the server
  if got error, error will be show
  else print Recipient is ready for accepting*/
  imap.on('ready', () => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) console.log(err)
      else console.log('Recipient is ready for accepting')
    })
  })

  /*numberOfEmails is the total number of email messages in the box*/
  //number is total number of new email messages received since the last 'email' event//
  let numberOfEmails = 0
  imap.on('mail', number => {
    if (numberOfEmails == 0) {
      console.log(`Current number of emails in inbox: ${number}`)
      numberOfEmails = number
    } else {
      /*numberOfEmails + 1 is likely the index of the first email message to retrieve.
      Since 'numberOfEmails is the total number of email messages in the box, adding
      1 to it would give the index of the first new message that has arrived since the last
      'mail' event*/

      /*number - 1 is likely the number of email messages to retrieve. Since 'number' is the total
      number of new email messages received since the last 'mail' event. Subtracting 1 from it would 
      give the number of new email messages that have not yet been retrieved.*/
      getEmail(numberOfEmails + 1, number - 1)
      numberOfEmails += number
      console.log(`Number of emails updated to ${numberOfEmails}`)
    }
  })

  //when the mail is deleted, this function will be call, expunge means delete//
  imap.on('expunge', number => {
    if (number <= numberOfEmails) {
      console.log(`Email #${number} was deleted`)
      numberOfEmails -= 1
      console.log(`Number of emails updated to ${numberOfEmails}`)
    }
  })

  imap.connect();
}

manageInbox()