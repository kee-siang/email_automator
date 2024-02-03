## Email Automator
Automate email responses using Node.js, Nodemailer, and IMAP.

## Overview
This application is built on Node.js, Nodemailer, IMAP to monitor inbox, detects new email and sends automated replies based on predefined script.

## Installation and Setup
1. Clone the repository:
   git clone https://github.com/kee-siang/email_automator.git

2. Install dependecies:
   use npm install to install all the dependencies. 

3. Setup your environment variable.
   - create a .env file.
   - inside the file include :
     <p>YOUR_NAME="Your name"</p>
     <p>GMAIL_USER="Your gmail address"</p>
     <p>GMAIL_PASSWORD="Your gmail password"</p>

4. Change your desired auto reply message address and messages. 

## Usage 
run **node index.js** to run the script and it will automatically respond to incoming emails based on predefined script.
