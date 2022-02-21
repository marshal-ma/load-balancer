var express = require('express');
var router = express.Router();
var request = require('request');
var axios = require('axios');


const HEARTBEAT_CHECK_INTERVAL = 5000;
const PROVIDER_CAPACITY_LIMIT = 5;
counter = 0;

class LoadBalancer{
	constructor(){
		this.registery = [new ProviderEntry('a'), new ProviderEntry('b'), new ProviderEntry('c')];
		this.capacity = 10;
		this.roundRoubinReference = 0;
	}

	register(provider_id){
		if(this.registery.length >= this.capacity){
			throw 'registery reaches its max capacity';
		}
		const provider = new ProviderEntry(provider_id);
		this.registery.push(provider);
	}

	getRoundRobinReference(){
		if(!this.registery.length){
			throw 'registery is empty';
		}

		this.incrementRoundRobinReference();
		return this.roundRoubinReference;
	}
		
	incrementRoundRobinReference(){
		this.roundRoubinReference = (this.roundRoubinReference + 1) % this.registery.length;
		while(!this.registery[this.roundRoubinReference].isIncluded || !this.registery[this.roundRoubinReference].hasCapacity()){
			this.roundRoubinReference = (this.roundRoubinReference + 1) % this.registery.length;
		}
	}

	getRandomReference(){
		let reference = Math.floor(Math.random() * this.registery.length);
		while(!this.registery[reference].isIncluded || !this.registery[reference].hasCapacity()){
			Math.floor(Math.random() * this.registery.length);
		}
		return reference;
	}

	getProviderWithReference(position){
		if(position > this.registery.length || !this.registery[position]){
			throw 'no provider available at position ' + position;
		}
		return this.registery[position];
	}

	getProviderWithId(provider_id){
		if(!this.registery.length){
			throw 'registery is empty';
		}
		const provider = this.registery.find(p => p.id === provider_id);

		if(!provider){
			throw `no provider found with id ${provider_id}`;
		}

		return provider;
	}

	checkClusterCapacity(){
		if(!this.registery.length){
			throw 'registery is empty';
		}

		let totalRequest = 0;
		for(let provider of this.registery){
			totalRequest += provider.numOfConcurentRequest;
		}

		if(totalRequest >= this.registery.length * PROVIDER_CAPACITY_LIMIT){
			throw 'Cluster maximum capacity is reached';
		}
	}
}

class ProviderEntry{
	constructor(id){
		this.id = id;
		this.isIncluded = true;
		this.numOfConcurentRequest = 0;
		this.heartBeatCheck();
	}

	include(){
		this.isIncluded = true;
	}

	exclude(){
		this.isIncluded = false;
	}

	hasCapacity(){
		return this.numOfConcurentRequest < PROVIDER_CAPACITY_LIMIT;
	}

	heartBeatCheck(){
		let firstCheck = false;	
		const interval = setInterval(() => {
	   		axios.get(`http://localhost:3000/provider/check/${this.id}`)
					.then((response) => {
						if(response.status === 200){
							if(response.data.split(':')[1].trim() === 'true'){
								if(firstCheck){
									this.include();
								}else{
									firstCheck = true;
								}
							}else{
								this.exclude();
								firstCheck = false;
							}
						}
					}).catch(function(err) {
						 console.log(err);
					});
		 }, HEARTBEAT_CHECK_INTERVAL);
		 
		
	}

	incrementRequest(){
		if(this.numOfConcurentRequest === PROVIDER_CAPACITY_LIMIT){
			throw `Unable to send request to ${this.id}, maximum concurent request capacity reached.`
		}

		this.numOfConcurentRequest++;
	}

	decrementRequest(){
		this.numOfConcurentRequest = Math.max(this.numOfConcurentRequest-1, 0);
	}

}

const loadBalancer = new LoadBalancer();

function getLoadBalancer(){
	if(!this.loadBalancer){
		this.loadBalancer = new LoadBalancer();
	}
	return this.loadBalancer;
}


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('current provider list: ' + JSON.stringify(getLoadBalancer().registery));
});


/* GET return a selected provider. */
router.get('/get/:method?', function(req, res, next) {
	let reference = 0;

	try{
		getLoadBalancer().checkClusterCapacity();

		if(req.params.method === 'round_robin'){
		  	reference = getLoadBalancer().getRoundRobinReference();
		}else{
		  	reference = getLoadBalancer().getRandomReference();
		}

		const provider = getLoadBalancer().getProviderWithReference(reference);
		provider.incrementRequest();
  		res.send('getting provider: ' + provider.id);
  	}catch(err){
  		res.status(500).send('failed to get a provider: ' + err);
  	}
  	
});


/* GET register a provider. */
router.get('/register', function(req, res, next) {
		res.status(400).send('To register a provider, call the endpoint with /register/:provider_id');
});

/* GET register a provider. */
router.get('/register/:provider_id', function(req, res, next) {
	const new_provider_id = req.params.provider_id;
	try{
		getLoadBalancer().register(new_provider_id);
		res.status(200).send('new provider registered successfully: ' + new_provider_id);
	}catch(err){
		res.status(500).send(`failed to register ${new_provider_id}: ` + err);
	}
	
});

/* GET include a provider. */
router.get('/include/:provider_id', function(req, res, next) {
			const provider_id = req.params.provider_id;
	try{
		getLoadBalancer().getProviderWithId(provider_id).include();
		res.status(200).send(`Provider ${provider_id} has been included successfully`);
	}catch(err){
		res.status(500).send(`failed to include provider ${provider_id}: ` + err);
	}
});

/* GET exclude a provider. */
router.get('/exclude/:provider_id', function(req, res, next) {
	const provider_id = req.params.provider_id;
	try{
		getLoadBalancer().getProviderWithId(provider_id).exclude();
		res.status(200).send(`Provider ${provider_id} has been excluded successfully`);
	}catch(err){
		res.status(500).send(`failed to exclude provider ${provider_id}: ` + err);
	}
});

module.exports = router;
