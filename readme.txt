/////////////////////////////////////////////////////
Errors format:
  { errors <Array>: [
      { msg: "Message Content" } <Object>
    ] 
  }
/////////////////////////////////////////////////////




#####################################################
register
#####################################################
// @url POST /api/auth/register
// @desc register a new user
// @type PUBLIC

## request body
{
    "email": <required> String,
    "password": <required> String,
    "username": <required,alphanum> String,
    "birthday": <required> Date,
    "adress": <required> String
}

## response
{
    "msg": "A verification email has been sent to <email>. It will be expire after 1 hour. If you not get verification Email click on resend."
}






#####################################################
login
#####################################################
// @url POST /api/auth/login
// @desc login a user
// @type PUBLIC

## request body
{
    "email": <required> String,
    "password": <required> String,
}

## response in case of verificated email
{
    "token": String,
    "user": {
        "email": String,
        "username": String,
        "birthday": Date,
        "adress": String
    }
}




#####################################################
resend confirmation email
#####################################################
// @url POST /api/auth/confirmation
// @desc resend confirmation email
// @type PUBLIC

## request body
{
  email: <required> String
}

## response
{
    "msg": "A verification email has been sent to <email>. It will be expire after 1 hour. If you not get verification Email click on resend token."
}






#####################################################
get user
#####################################################
// @url GET /api/auth
// @desc get user info
// @type PRIVATE

## request header
{
    auth-token: <required> String
}

## response
{
    "_id": String,
    "email": String,
    "birthday": Date,
    "adress": String,
    "username": String,
    "isVerified": bool,
    "createdAt": Date,
    "updatedAt": Date,
    "__v": 0
}





