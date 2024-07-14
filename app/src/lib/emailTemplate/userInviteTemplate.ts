const userInviteTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invite Link</title>
</head>
<body>
    <p>Hi {{name}},</p>
    <p>You have added in to the organisation {{orgName}}.</p>
    <p>Click on the below link to signIn to the Organization {{orgName}}</p>
    <p><a href="{{url}}">Navigate to organization</a></p>
    <p>Thank you,<br>pTasks Team</p>
</body>
</html>

`
export default userInviteTemplate
