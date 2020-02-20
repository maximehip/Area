const nodemailer = require("nodemailer");

module.exports = {
	callMail: async function(mail, password, infos) {
		var transporter = nodemailer.createTransport({
			service: 'gmail',
		  auth: {
		    user: mail,
		    pass: password
		  }
		});

		var mailOptions = {
		  from: mail,
		  to: infos[0],
		  subject: 'Area email',
		  text: infos[1]
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