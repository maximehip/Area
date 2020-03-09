const nodemailer = require("nodemailer");

module.exports = {
	callMail: async function(mail, password, receiver, infos) {
		var transporter = nodemailer.createTransport({
			service: 'gmail',
		  auth: {
		    user: mail,
		    pass: password
		  }
		});

		var mailOptions = {
		  from: mail,
		  to: receiver,
		  subject: 'Area email',
		  text: infos[0]
		};

		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email sent: ' + info.response);
		  }
		});
	}
}