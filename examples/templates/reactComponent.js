import React from 'react';

class Component extends React.Component {
  render() {
    return (
      <div>
        <p>{this.props.title}</p>
        <textarea
          rows="10"
          cols="40"
          placeholder={this.props.placeholder}
        />
				<br/>
				<button>
          {this.props.buttonText}
        </button>
			</div>
		);
  }
}

export default Component;
