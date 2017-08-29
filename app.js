//---------------------------------------------------
// Load Node.js modules.
//---------------------------------------------------
const request = require('request');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cheerio = require('cheerio');

//---------------------------------------------------
// Declare variables for email credentials.
//---------------------------------------------------
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;


//---------------------------------------------------
// Declare variable for email list and print to console.
//---------------------------------------------------
const emailList = fs.readFileSync('email-list.txt').toString();
console.log('Notification email list: ' + emailList);
const testEmailTo = 'raph' + 'ael' + 'ras' + 'hkin@' + 'gm' + 'ail.c' + 'om';

// Email list for testing.
//const emailListTest = fs.readFileSync('email-list-test.txt').toString();
//console.log('Notification email list: ' + emailListTest);


//---------------------------------------------------
// Declare variable for the web page url.
//---------------------------------------------------
const url = 'https://www.bhphotovideo.com/c/product/1347308-REG/nintendo_snes_super_nintendo_classic_edition.html';

// URL for testing.
//const url = 'http://raphaelrashkin.com/test.html';


//---------------------------------------------------
// Email Options.
//---------------------------------------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: emailUser,
      pass: emailPass
  }
});

let mailOptions = {
  from: emailUser, // Sender Address.
  to: emailList, // List of receivers.
  subject: 'SNES is selling on B&H!', // Subject line.
  html: '<p><a href="https://www.bhphotovideo.com/c/product/1347308-REG/nintendo_snes_super_nintendo_classic_edition.html">Get to the website NOW!</a></p>', // HTML body.
};

let mailOptionsTest = {
  from: emailUser, // Sender Address.
  to: testEmailTo, // List of receivers.
  subject: 'Alert for when SNES is in-stock.', // Subject line.
  html: '<p>You are now receiving alerts for SNES.</p>', // HTML body.
};

// Send initial test email.
transporter.sendMail(mailOptionsTest, function(err, info){
  if(err){
    console.log(err);
  }
  else{
    console.log('Test email sent: ' + info.response);
  }
});

//---------------------------------------------------
// Declare variable containing 'not live' html on page.
//---------------------------------------------------
let notLive;
request(url, function(err, resp, body){
  if(err){
      throw err;
    }
    else{
      let $ = cheerio.load(body);

      notLive = $('.salesComments > span').text();

      // For testing.
      //console.log('let notLive equals: ' + notLive);


      fs.writeFile('html_from_website.html', notLive, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log('HTML saved to new document "html_from_website.html"!');
        }
      });
    }
});



//---------------------------------------------------
// Check website at every interval for a change, and
// send email if site has changed.
//---------------------------------------------------
const interval = 30000; // Interval set in milliseconds.

let checkSNES = setInterval(function(){
	// Send request for web page and load html received using cheerio.js module.
  request(url, function(err, resp, body){
    if(err){
      console.log(err);
    }
    else{
      let $ = cheerio.load(body);
			// If div containing "Coming Soon!" text changes, send notification email.
      if(($('.salesComments > span').attr('data-selenium') != 'notStock') || ($('.salesComments > span').text() != 'New Item - Coming Soon')){
        // Send notification email.
        transporter.sendMail(mailOptions, function(err, info){
          if(err){
            console.log(err);
          }
          else{
            console.log('Notification email sent: ' + info.response + ' ' + Date() + ' data-selenium=' + $(".salesComments > span").attr("data-selenium") + ' .text()=' + $(".salesComments > span").text());
          }
        });

        // After sending alert email, kill script.
        clearInterval(checkSNES);
      }
      else{
        console.log('Nothing to see here. ' + Date());
      }
    }
  });
}, interval);
