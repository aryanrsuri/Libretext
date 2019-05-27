import React from 'react';
import Toggle from 'react-toggle';
import {FixedSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";


export default class FindReplace extends React.Component {
	constructor() {
		super();
		this.state = {
			root: "",
			find: "",
			replace: "",
			user: document.getElementById('usernameHolder').textContent,
			newlines: false,
			isWildcard: false,
			regex: false,
			findOnly: false,
			
			results: [],
			status: '',
			counter: 0,
			ID: '',
			time: -1,
			timer: setInterval(() => {
				if (this.state.time != -1) {
					this.setState({time: this.state.time + 1})
				}
			}, 1000)
		};
		
	}
	
	componentDidMount() {
		this.socket = io('https://api.libretexts.org/', {path: '/bot/ws'});
		this.socket.on('pages', (data) => {
			// console.log(data);
			let tempResults = data.concat(this.state.results);
			this.setState({results: tempResults});
		});
		this.socket.on('setState', (data) => {
			switch (data.state) {
				case 'starting':
					this.setState({ID: data.ID, counter: 0});
					break;
				case 'getSubpages':
					this.setState({status: 'getSubpages', counter: data.numPages});
					break;
				case 'findReplace':
					this.setState({status: 'findReplace', counter: data.percentage});
					break;
				case 'done':
					this.setState({status: 'done', ID: data.ID, time: -1});
					break;
			}
		});
		this.socket.on('revertDone', () => {
			alert(`Revert of ${this.state.ID} complete`);
			this.setState({status: 'reverted'});
		});
		this.socket.on('Body missing parameters', (data) => {
			alert(`The server has denied your request due to incomplete parameters. Please revise and try again\n${data}`)
		});
		this.socket.on('errorMessage', function (data) {
			if (!data.noAlert)
				alert(data.message || data);
			console.error(data.message || data);
		});
	}
	
	componentWillUnmount() {
		this.socket.disconnect();
	}
	
	
	verifyRequest() {
		let request = {
			root: this.state.root,
			user: this.state.user,
			find: this.state.find,
			replace: this.state.replace,
			newlines: this.state.newlines,
			isWildcard: this.state.isWildcard,
			regex: this.state.regex,
			findOnly: this.state.findOnly,
		};
		
		if (!request.find || !request.root) {
			alert(`Missing ${!request.root ? 'URL' : 'Find search term'}`);
			return false;
		}
		if (request.find.length < 5) {
			let answer = prompt(`Warning, you are using a short search term! Please use a longer search term or retype "${request.find}" to unsafely proceed`);
			if (answer === request.find) {
				this.sendRequest(request);
			}
			else if (answer && answer !== request.find) {
				alert('Search term did not match...Cancelling');
			}
		}
		else if (request.findOnly) {
			if (confirm(`The bot will find all pages with "${request.find}". No Changes will be made.`))
				this.sendRequest(request);
		}
		else if (confirm(`The bot will replace "${request.find}" with "${request.replace}". Click OK to proceed.`)) {
			this.sendRequest(request);
		}
	}
	
	sendRequest(request) {
		this.setState({status: 'getSubpages', results: [], ID: '', time: 0});
		this.socket.emit('findReplace', request);
	}
	
	revert() {
		let id = this.state.ID;
		if (!id) {
			id = prompt('Please enter in the id of the revision you would like to revert');
			if (!id)
				return false;
		}
		let request = {
			user: this.state.user,
			ID: id,
		};
		this.socket.emit('revert', request);
	}
	
	getStatus() {
		switch (this.state.status) {
			case 'getSubpages':
			case 'findReplace':
				return <div className="status" style={{backgroundColor: 'orange'}}>
					<div>
						Find{this.state.findOnly ? '' : ' and Replace'} In Progress
						({this.state.counter}{this.state.status === 'getSubpages' ? ' pages to process' : '%'})
					</div>
					<div className="spinner">
						<div className="bounce1"/>
						<div className="bounce2"/>
						<div className="bounce3"/>
					</div>
					<div>
						{`Request ID: ${this.state.ID}`}<br/>
						{`Time Elapsed: ${this.state.time} seconds`}
					</div>
				</div>;
			case 'done':
				return <p className="status" style={{backgroundColor: 'green'}}>Complete!</p>;
			case 'reverted':
				return <p className="status" style={{backgroundColor: 'grey'}}>Reverted {this.state.ID}</p>;
			default:
				return null;
		}
	}
	
	render() {
		return (
			<div id="FindReplace">
				<div className="topPanel">
					<div><input placeholder="URL" onChange={(event) => {
						this.setState({root: event.target.value})
					}}/>
						<input placeholder="Find" onChange={(event) => {
							this.setState({find: event.target.value})
						}}/>
						<input placeholder="Replace" onChange={(event) => {
							this.setState({replace: event.target.value})
						}}/>
						<div>
							<button onClick={() => this.verifyRequest()}>Verify Request</button>
							<button onClick={() => this.revert()}>Revert Request {this.state.ID}</button>
						</div>
					</div>
					<div>
						<label>
							<Toggle onChange={() => this.setState({isWildcard: !this.state.isWildcard})}
							        defaultChecked={this.state.isWildcard}/>
							<span>Enable Wildcards (? or *)</span>
						</label>
						<label>
							<Toggle onChange={() => this.setState({newlines: !this.state.newlines})}
							        defaultChecked={this.state.newlines}/>
							<span>Enable Newlines (\n)</span>
						</label>
						<label>
							<Toggle onChange={() => this.setState({regex: !this.state.regex})}
							        defaultChecked={this.state.regex}/>
							<span>Use Regular Expressions (Regex)</span>
						</label>
						<label>
							<Toggle onChange={() => this.setState({findOnly: !this.state.findOnly})}
							        defaultChecked={this.state.findOnly}/>
							<span>Find pages but do not modify (read only mode)</span>
						</label>
					</div>
				</div>
				
				<div>
					{this.getStatus()}
					<div id="results">
						
						<AutoSizer disableHeight={true}>
							{({height, width}) => (
								<List
									className="List"
									height={Math.min(this.state.results.length * 15, 400)}
									itemCount={this.state.results.length}
									itemSize={15}
									width={width}
								>
									{({index, style}) => {
										let page = this.state.results[index];
										return <div style={style}
										            key={this.state.results.length - index}>{this.state.results.length - index} {this.state.findOnly ? 'Found ' : 'Modified '}
											<a target='_blank' href={page.url}>{page.path}</a></div>
									}}
								</List>
							)}
						</AutoSizer>
					</div>
				</div>
			</div>
		)
	}
}