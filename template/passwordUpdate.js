const passwordUpdateSuccessTemplate = (name) => {
	return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Password Update Successful</title>
		<style>
			body {
				background-color: #ffffff;
				font-family: Arial, sans-serif;
				font-size: 16px;
				line-height: 1.4;
				color: #333333;
				margin: 0;
				padding: 0;
			}
	
			.container {
				max-width: 600px;
				margin: 0 auto;
				padding: 20px;
				text-align: center;
			}
	
			.logo {
				max-width: 200px;
				margin-bottom: 20px;
			}
	
			.message {
				font-size: 24px;
				font-weight: bold;
				margin-bottom: 20px;
				color: #333333; /* Dark color for emphasis */
			}
	
			.body {
				font-size: 16px;
				margin-bottom: 20px;
			}
	
			.cta {
				display: inline-block;
				padding: 10px 20px;
				background-color: #4CAF50; /* Green for success */
				color: #ffffff;
				text-decoration: none;
				border-radius: 5px;
				font-size: 16px;
				font-weight: bold;
				margin-top: 20px;
			}
	
			.support {
				font-size: 14px;
				color: #999999;
				margin-top: 20px;
			}
		</style>
	
	</head>
	
	<body>
		<div class="container">
			<img src="" alt="Cartvit Logo" class="logo">
			<div class="message">Password Update Successful</div>
			<div class="body">
				<p>Dear ${name},</p>
				<p>Your password has been successfully updated.</p>
				<p>If you did not make this change, please contact us immediately.</p>
			</div>
			<div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a href="mailto:info@cartvit.com">info@cartvit.com</a>. We're here to help!</div>
		</div>
	</body>
	
	</html>`;
};

module.exports = passwordUpdateSuccessTemplate;
