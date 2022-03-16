import React, { useState } from 'react';
import {Entry} from "./Entry";
import EntryComponent from "./Entry";



type EntryListProps = {
   list: Entry[]
}

class EntryList extends React.Component<EntryListProps> {
  constructor(props: EntryListProps) {
    super(props);
  }

  render(){
    return this.props.list.map((e, index) => {
      return <EntryComponent 
              key={e.id} 
              entry={e}
              onClick={() => this.toggleEntryState(e, index)}
             />;
    })
  }

  toggleEntryState(entry: Entry, index: number){
      const action = entry.isIncluded ? "exclude" : "include";
      fetch(`/load_balancer/${action}/${entry.id}`)
        .then(res => {
          console.log(res)
        })
        .catch(err => console.log(err));
  }
}

export default EntryList;