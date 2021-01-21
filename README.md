# ImageRepository
A RESTful Image Repository built on Node.js using Express.js and Mongo  
Users can Upload, Retrieve, and Delete their Images  

## Prerequisites
NodeJS v14.15.4 or later  
A MongoDB Connection URI  
Postman or cURL (Send HTTP requests)  

## Setup
1. Clone the repository and switch to master branch
2. Run npm install from the root directory of the ImageRepository
3. Add your Mongo connection string to the MONGO_URI field defined in ~/.env
4. Run npm start from the root directory of the ImageRepository

## API Instructions  

### Auth  
POST: Signup  
Endpoint: /user/signup  
You can signup as a User by passing a username and password in the request body of your POST request to the user signup endpoint.  
Note: Request Body must contain 'username' and 'password' fields. Username must be unique.

POST: Login  
Endpoint: /user/login  
You can login as a User and retrieve a JWT token by passing valid user credentials (username and password) in the request body of the user login endpoint.  
Note: Request Body must contain 'username' and 'password' fields.  
Note: API calls are secured to the logged in user. You will not be able to retrieve/delete/upload images to another user's account unless you have their token.  

### Image API  
To use any of the API's below, you must pass a valid JWT token in an Authorization request header.    

POST : Upload Single Image     
ParamName=image  
Endpoint: /images  
You can upload a single image by sending an HTTP POST request to the endpoint and passing an image in the request body.  

POST: Upload Multiple Images  
ParamName=images  
Endpoint: /images/multiple  
You can upload multiple images by sending an HTTP POST request to the endpoint and passing multiple images in the request body.  

GET: Get Single Image  
QueryParam: imageId  
Endpoint: /images/:imageId  
You can get an image by sending an HTTP GET request to the endpoint with the appropriate imageId.

GET: Get All Images  
Endpoint: /images  
You can get all images by sending an HTTP GET request to the endpoint.  

DELETE: Delete All Images  
Endpoint: /images  
You can delete all images by sending an HTTP DELETE request to the endpoint.  

DELETE: Delete Single Image  
Endpoint: /images/:imageId  
You can deleted a single image by sending an HTTP DELETE request to the endpoint with the appropriate imageId.

