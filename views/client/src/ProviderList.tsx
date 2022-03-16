import React, { useState } from 'react';
import ProviderComponent from "./Provider"


type ProviderListProps = {
   providers: Provider[]

}

type ProviderListState = {
  providers: Provider[]
}

class Provider {
  id: string;
  isRunning: boolean;

  constructor(id: string = "", isRunning: boolean = false){
    this.id = id;
    this.isRunning = isRunning;
  }
}


class ProviderList extends React.Component<ProviderListProps, ProviderListState> {
  constructor(props: ProviderListProps) {
    super(props);
    this.state = {
      providers: props.providers,
    };
  }

  componentDidUpdate(prevProps: ProviderListProps) {
    if(this.props.providers != prevProps.providers){
      this.setState({
        providers: this.props.providers,
      });
    }
   
  }

  render(){
    return this.state.providers.map((p, index) => {
      return <ProviderComponent 
              key={p.id} 
              id={p.id} 
              isRunning={p.isRunning}
              onClick={() => this.toggleProviderState(p, index)}
             />;
    })
  }

  toggleProviderState(provider: Provider, index: number){
    const endpoint = `/provider/${provider.isRunning? 'disable' : 'enable'}/${provider.id}`;
    fetch(endpoint).then((res) => {
      console.log(`${provider.id} has been ${provider.isRunning? 'disabled' : 'enabled'}`);
      this.state.providers[index].isRunning = !this.state.providers[index].isRunning;
      this.setState({providers: [...this.state.providers]})
    })
    .catch((err) => console.log(err));
  }
}

export default ProviderList;