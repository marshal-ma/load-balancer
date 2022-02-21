var express = require('express');
var router = express.Router();

const HEARTBEAT_CHECK_INTERVAL = 50000000;

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
		
		while(!this.registery[this.roundRoubinReference].isIncluded){
			this.roundRoubinReference = (this.roundRoubinReference + 1) % this.registery.length;
		}
	}

	getRandomReference(){
		let reference = Math.floor(Math.random() * this.registery.length);
		while(!this.registery[reference].isIncluded){
			Math.floor(Math.random() * this.registery.length);
		}
		return reference;
	}

	getProviderWithReference(position){
		if(position > this.registery.length || !this.registery[position]){
			throw 'no provider available at position ' + position;
		}
		return this.registery[position].id;
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
}

class ProviderEntry{
	constructor(id, req){
		this.id = id;
		this.isIncluded = true;
		this.heartBeatCheck(req);
	}

	include(){
		this.isIncluded = true;
	}

	exclude(){
		this.isIncluded = false;
	}

	heartBeatCheck(){
		const interval = setInterval(function(req) {
   		// console.log("heartBeatCheck", this.id);
		}, this.HEARTBEAT_CHECK_INTERVAL);
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
  res.send('current provider list: ' + getLoadBalancer().registery.length);
});


/* GET return a selected provider. */
router.get('/get/:method?', function(req, res, next) {
	let reference = 0;

	try{
		if(req.params.method === 'round_robin'){
		  	reference = getLoadBalancer().getRoundRobinReference();
		}else{
		  	reference = getLoadBalancer().getRandomReference();
		}

		const provider_id = getLoadBalancer().getProviderWithReference(reference);
  		res.send('getting provider: ' + provider_id);
  	}catch(err){
  		console.log(err);
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
