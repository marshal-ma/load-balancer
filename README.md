# load-balancer

This is a node project with [express.js](https://expressjs.com/) as the web server. 

# get started
To run the project, make sure you have the following installed 
- [node.js](https://nodejs.org/en/download/)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Clone the repo, then in the terminal run the following command

`npm install && npm start`

Then, the project should start on http://localhost:3000/

# project overview
There are two endpoints and respective operations
- Provider http://localhost:3000/provider
  - create 
      - to create a provider
      - http://localhost:3000/provider/create
  - check/:provider_id 
      - to check the running status of a provider
      - http://localhost:3000/provider/check/{provider_id}
  - enable/:provider_id 
      - to enable/reenable a provider
      - http://localhost:3000/provider/enable/{provider_id}
  - disable/:provider_id 
      - to take down a provider from the cluster
      - http://localhost:3000/provider/disable/{provider_id}
  - get
      - to get an overview of all providers available
      - http://localhost:3000/provider/get


- Load Balancer http://localhost:3000/load_balancer/
  - register/:provider_id
      - to register a specific provider into the load balancer
      - load balancer's capacity is capped to 10
      - http://localhost:3000/load_balancer/register/{provider_id}
  - register
      - to batch register a list of providers into the load balancer
      - load balancer's capacity is capped to 10
      - http://localhost:3000/load_balancer/register/
  - get/{random|round_robin}
      - to get a provider from the load balancer
      - two methods are supported, random selection and round robin
      - excluded providers will not be returned
      - providers failing heartbeat check will not be returned
      - providers reaching its maximum capacity will not be returned 
      - if total cluster capacity is reached, no provider will be returned
      - random selection assignment: http://localhost:3000/load_balancer/get/random
      - round robin assignment: http://localhost:3000/load_balancer/get/round_robin
  - include/:provider_id
      - to mannually include a provider into the load balancer
      - http://localhost:3000/load_balancer/include/{provider_id}
  - exclude/:provider_id
      - to mannually exclude a provider from the load balancer
      - http://localhost:3000/load_balancer/exclude/{provider_id}

- Heartbeat Check
  - A provider will be excluded from the load balancer if it is disabled
  - A provider will be included into the load balancer if the previously disabled provider get two(2) consecutive successful heartbeat check 
   
  # Config
   Two config variables defined at [loadbalancer.js](https://github.com/marshal-ma/load-balancer/blob/main/routes/load_balancer.js).
   - HEARTBEAT_CHECK_INTERVAL: defines the frequency of provider's heartbeat check
   - PROVIDER_CAPACITY_LIMIT: defines the number of concurrent request a provider can handle
   - NUMBER_OF_NEW_PROVIDER_TO_REGISTER: defines the number of new providers to be batch registered
   
