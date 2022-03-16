import React from 'react';
import { BsFillCheckSquareFill, BsPatchExclamationFill } from 'react-icons/bs';


export interface Entry {
	id: string;
	isIncluded?: boolean;
	isUp?: boolean;
	numOfConcurentRequest?: number;
}

type EntryProp = {
	entry: Entry,
	onClick?: any
}

type EntryState = {
	isIncluded?: boolean;
	isUp?: boolean;
	numOfConcurentRequest?: number;
}

class EntryComponent extends React.Component<EntryProp, EntryState> {
	constructor(props: EntryProp){
	    super(props);
	}

	render() {
	  return (<div>
	  			{this.props.entry.id} 
	  			{this.props.entry.isIncluded && <button onClick={() =>this.props.onClick()}> Exclude </button>}
	  			{!this.props.entry.isIncluded && <button onClick={() =>this.props.onClick()}> Include </button>}
	  			{this.props.entry.isUp && <BsFillCheckSquareFill color="green" />}
	  			{!this.props.entry.isUp && <BsPatchExclamationFill color="red"/>}
	  			Current workload: {this.props.entry.numOfConcurentRequest} 
	  		</div>);
	}
}

export default EntryComponent;