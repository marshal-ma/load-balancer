import React, { useState } from 'react';
import EntryList from "./EntryList"
import {Entry} from "./Entry"

type SelectionStrategy = "Round Robin" | "Random";

type LoadBalancerProps = {

}

type LoadBalancerState = {
	inputs: string,
	next_provider: string,
	selection_strategy: SelectionStrategy,
	entity_list: Entry[]
}

class LoadBalancer extends React.Component<LoadBalancerProps, LoadBalancerState> {
  constructor(props: LoadBalancerProps) {
    super(props);
    this.state = {
    	entity_list: [],
    	inputs: "",
    	selection_strategy: "Round Robin",
    	next_provider: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.registerProvider = this.registerProvider.bind(this);
    this.getNextProvider = this.getNextProvider.bind(this);
    this.updateSelectionStrategy = this.updateSelectionStrategy.bind(this);
  }

  componentDidMount() {
  	setInterval(() => this.fetchEntityList(),500);
  }

  componentDidUpdate(prevProps: LoadBalancerProps) {
    if(this.props !== prevProps){
      // this.setState({
      //   providers: this.props.providers,
      // });
    }
   
  }

  fetchEntityList() {
  	fetch('/load_balancer/')
  		.then((res) => res.text())
        .then((res) => {
          	this.setState({entity_list: JSON.parse(res.substring(res.indexOf(':')+1).trim())});
        });
  }

  handleChange(event: any) {
  	this.setState({inputs: event.target.value});
  }

  registerProvider(event: any) {
  	event.preventDefault();
  	fetch(`/load_balancer/register/${this.state.inputs}`)
  		.then(res => console.log(res))
  		.catch(err => console.log(err));
  }

  getNextProvider(event: any) {
  	event.preventDefault();
  	const endpoint = this.state.selection_strategy === "Random" ? "ramdom" : "round_robin";
  	fetch(`/load_balancer/get/${endpoint}`)
  		.then(res => res.text())
  		.then(res => {
  			this.setState({next_provider: res.split(":")[1].trim()});
  		})
  }

  updateSelectionStrategy(event: any) {
  	this.setState({selection_strategy: event.target.value});
  }

  render(){
    return (
    	<div className="LoadBalancer">
    		<div>
    			<form onSubmit={this.registerProvider}>
			      <label>Provider ID: 
			        <input 
			          type="text" 
			          name="providerId"
			          value={this.state.inputs || ""}
			          onChange={this.handleChange}
			        />
			      </label>
			      <input value="Register" type="submit" />
			    </form>
	    	</div>
	    	<div>
	    		<form onSubmit={this.getNextProvider}>
		    		<label>
	    				Seletion Strategy: 
	    				<select defaultValue="Round Robin" onChange={this.updateSelectionStrategy}>
						  <option value="Random">Random</option>
						  <option value="Round Robin" >Round Robin</option>
						</select>
		    		</label>
		    		<input value="Get Next Provider" type="submit" />
		    	</form>
		    	<p>Next Provider: {this.state.next_provider}</p>
    		</div> 

    		<div>
    			<h3> Service Provider List </h3>
    			<EntryList list={this.state.entity_list}/>
    		</div>

    	</div>);
  }
}

export default LoadBalancer;