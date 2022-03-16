import React from 'react';
import logo from './logo.svg';
import './App.css';
import ProviderComponent from "./Provider"
import ProviderList from "./ProviderList"
import LoadBalancer from "./LoadBalancer"

class Provider {
  id: string;
  isRunning: boolean;

  constructor(id: string = "", isRunning: boolean = false){
    this.id = id;
    this.isRunning = isRunning;
  }
}

function parseProviderList(res: string): Provider[]{
  const providers: Provider[] = [];
  const list = JSON.parse(res.substring(res.indexOf('['), res.indexOf(']')+1));
  list.forEach((provider: any) => {
    providers.push(new Provider(provider.id, provider.isRunning));
  });

  return providers;
}


function App() {
  const [providerList, setProviderList] = React.useState<Provider[]>([]);
  

  React.useEffect(() => {
    fetchProviderList();
    setInterval(() => fetchProviderList(),10000);
  }, []);

  const fetchProviderList = function(){
    console.log("fetch provider list");
    fetch("/provider/get")
      .then((res) => res.text())
      .then((res) => {
        const provider_list: Provider[] = parseProviderList(res);
        setProviderList(provider_list);
      })
      .catch((err) => console.log(err));
  }

  

  function createNewProvider(){
    console.log('creating new provider');
    fetch("provider/create")
        .then((res) => res.text())
        .then((res) => {
          console.log(res);
          const new_provider: Provider = new Provider(res.split(':')[1].trim(), true);
          setProviderList(list => [...list, new_provider]);
        })
        .catch((err) => console.log(err));
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1> Load Balancer </h1>
          <LoadBalancer />
        </div>


        <div>
          <h1> Service Provider </h1>
          <button onClick={createNewProvider}> Create New Providers</button>
          <ProviderList providers={providerList} />
        </div>
      </header>


    </div>
  );
}

export default App;
