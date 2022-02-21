var express = require('express');
var router = express.Router();

class ProviderServer{
  constructor(){
    this.providerList = [new Provider('a'), new Provider('b'), new Provider('c')];
    this.idGenerater = 0;
  }

  createProvider(){
    const provider_id = this.idGenerater++;
    this.providerList.push(new Provider(provider_id));
    return provider_id;
  }

  getProvider(provider_id){
    if(!this.providerList.length){
      throw 'Provider List is empty. No provider has been created.';
    }

    const provider = this.providerList.find(p => p.id === provider_id);

    if(!provider){
      throw `No provider found with id ${provider_id}`;
    }

    return provider;
  }
}

class Provider{
  constructor(id){
    this.id = id;
    this.isRunning = true;
  }

  status(){
    return this.isRunning;
  }

  disable(){
    this.isRunning = false;
  }

  enable(){
    this.isRunning = true;
  }
}

const providerServer = new ProviderServer();

function getProviderServer(){
  if(!this.providerServer){
    this.providerServer = new ProviderServer();
  }
  return this.providerServer;
}

/* GET provider info. */
router.get('/get', function(req, res, next) {
  const num_of_providers = getProviderServer().providerList.length;
  res.send(`There are ${num_of_providers} provider(s) created` + JSON.stringify(getProviderServer().providerList));
});

/* GET create provider. */
router.get('/create', function(req, res, next) {
  const provider_id = getProviderServer().createProvider();
  res.send(`New Provider created: ${provider_id}`);
});

/* GET provider info. */
router.get('/check/:provider_id', function(req, res, next) {
  const provider_id = req.params.provider_id;
  try{
    const provider = getProviderServer().getProvider(provider_id);
    res.send(`provider ${provider_id} is up and running: ` + provider.status());
  }catch(err){
    res.status(500).send(`can't get provider status for provider ${provider_id}: ` + err);
  }
  
});

/* GET disable provider. */
router.get('/disable/:provider_id', function(req, res, next) {
  const provider_id = req.params.provider_id;
  try{
    getProviderServer().getProvider(provider_id).disable();
    res.send(`provider ${provider_id} is disabled.`);
  }catch(err){
    res.status(500).send(`can't disable provider ${provider_id}: ` + err);
  }
});

/* GET enable provider. */
router.get('/enable/:provider_id', function(req, res, next) {
  const provider_id = req.params.provider_id;
  try{
    getProviderServer().getProvider(provider_id).enable();
    res.send(`provider ${provider_id} is enabled.`);
  }catch(err){
    res.status(500).send(`can't enable provider ${provider_id}: ` + err);
  }
});


module.exports = router;
