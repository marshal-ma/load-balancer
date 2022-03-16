import React from 'react';
import './Provider.css';

interface ProviderProps {
	id: string;
	isRunning?: boolean;
	onClick?: any;
}

type ProviderState = {
	isRunning: boolean;
}

class ProviderComponent extends React.Component<ProviderProps, ProviderState> {
	constructor(props: ProviderProps){
	    super(props);
	    this.state = {
	    	isRunning: props.isRunning || false,
	    }
	}

	componentDidUpdate(prevProps: ProviderProps) {
	    if(this.props.isRunning != prevProps.isRunning){
	      this.setState({
	        isRunning: this.props.isRunning || false,
	      });
	    }
   
  	}

	render() {
	  return (<div>
	  			{this.props.id} 
	  			{this.props.isRunning && <button onClick={() =>this.props.onClick()}> disable </button>}
	  			{!this.props.isRunning && <button onClick={() =>this.props.onClick()}> enable </button>}
	  		</div>);
	}
}

export default ProviderComponent;