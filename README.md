# ImageRepository
A RESTful Image Repository built on Node.js using Express.js and Mongo 

## Prerequisites
Node v14.15.4  
A MongoDB Cluster or local instance

## Setup
1. Clone the repository and switch to master branch
2. Run npm install from the root directory of the ImageRepository
3. Add your Mongo connection string to the mongoUri constant defined in config.js
4. Run npm start from the root directory of the ImageRepository

## API Instructions

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

