import React from 'react';
import RemixerFunctions from '../reusableFunctions';

import Tutorial from './Tutorial.jsx';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Add from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Refresh from '@material-ui/icons/Refresh';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import Tooltip from "@material-ui/core/Tooltip";

export default class RemixerPanel extends React.Component {
	constructor() {
		super();
		let subdomain = window.location.origin.split('/')[2].split('.')[0];
		
		this.state = {
			initialized: false,
			LibraryTree: {},
			subdomain: subdomain,
			resetDialog: false,
			chapters: 0,
			pages: 0
		};
		
	}
	
	async componentDidMount() {
		this.setState({LibraryTree: await RemixerPanel.getSubpages('home', this.state.subdomain, false, true)});
		
		const LTLeft = $('#LTLeft');
		const LTRight = $('#LTRight');
		LTLeft.fancytree({
			source: this.state.LibraryTree,
			debugLevel: 0,
			autoScroll: true,
			extensions: ['dnd5'],
			lazyLoad: function (event, data) {
				const dfd = new $.Deferred();
				let node = data.node;
				data.result = dfd.promise();
				RemixerPanel.getSubpages(node.data.url, node.data.subdomain, false, true).then((result) => dfd.resolve(result), node.data.subdomain);
			},
			dnd5: {
				// autoExpandMS: 400,
				// preventForeignNodes: true,
				// preventNonNodes: true,
				// preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
				// preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
				// scroll: true,
				// scrollSpeed: 7,
				// scrollSensitivity: 10,
				
				// --- Drag-support:
				
				dragStart: function (node, data) {
					/* This function MUST be defined to enable dragging for the tree.
					 *
					 * Return false to cancel dragging of node.
					 * data.dataTransfer.setData() and .setDragImage() is available
					 * here.
					 */
//					data.dataTransfer.setDragImage($("<div>hurz</div>").appendTo("body")[0], -10, -10);
					data.dataTransfer.dropEffect = 'copy';
					return true;
				},
				/*dragDrag: function (node, data) {
				  data.dataTransfer.dropEffect = "move";
				},
				dragEnd: function (node, data) {
				},*/
				
				// --- Drop-support:
				
				/*dragEnter: function (node, data) {
				  // node.debug("dragEnter", data);
				  data.dataTransfer.dropEffect = "move";
				  // data.dataTransfer.effectAllowed = "copy";
				  return true;
				},
				dragOver: function (node, data) {
				  data.dataTransfer.dropEffect = "move";
				  // data.dataTransfer.effectAllowed = "copy";
				},
				dragLeave: function (node, data) {
				},*/
			},
			icon: (event, data) => {
				if (data.node.getLevel() === 1)
					return `https://libretexts.org/img/LibreTexts/glyphs/${this.state.subdomain}.png`;
			},
		});
		LTRight.fancytree({
			source: this.props.RemixTree,
			debugLevel: 0,
			autoScroll: true,
			extensions: ['dnd5'],
			/*			lazyLoad: function (event, data) {
							const dfd = new $.Deferred();
							let node = data.node;
							data.result = dfd.promise();
							RemixerPanel.getSubpages(node.data.url, node.data.subdomain).then((result) => dfd.resolve(result));
						},*/
			contextmenu: function (event, data) {
				console.log(data.node);
			},
			dnd5: {
				// autoExpandMS: 400,
				// preventForeignNodes: true,
				// preventNonNodes: true,
				// preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
				// preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
				// scroll: true,
				// scrollSpeed: 7,
				// scrollSensitivity: 10,
				
				// --- Drag-support:
				
				dragStart: function (node, data) {
					/* This function MUST be defined to enable dragging for the tree.
					 *
					 * Return false to cancel dragging of node.
					 * data.dataTransfer.setData() and .setDragImage() is available
					 * here.
					 */
//					data.dataTransfer.setDragImage($("<div>hurz</div>").appendTo("body")[0], -10, -10);
					return true;
				},
				dragDrag: function (node, data) {
					// data.dataTransfer.dropEffect = "move";
				},
				dragEnd: function (node, data) {
				},
				
				// --- Drop-support:
				
				dragEnter: function (node, data) {
					// node.debug("dragEnter", data);
					// data.dataTransfer.dropEffect = "move";
					return true;
				},
				/*dragOver: function (node, data) {
				  data.dataTransfer.dropEffect = "move";
				},
				dragLeave: function (node, data) {
				},*/
				dragDrop: async (node, data) => {
					/* This function MUST be defined to enable dropping of items on
					 * the tree.
					 */
					const transfer = data.dataTransfer;
					
					if (data.otherNode) {
						// Drop another Fancytree node from same frame
						// (maybe from another tree however)
						var sameTree = (data.otherNode.tree === data.tree);
						if (node.getLevel() <= 1) {
							data.hitMode = 'over';
						}
						if (data.hitMode === 'over') {
							node.setExpanded(true);
						}
						await doTransfer();
					}
					else if (data.otherNodeData) {
						// Drop Fancytree node from different frame or window, so we only have
						// JSON representation available
						node.addChild(data.otherNodeData, data.hitMode);
					}
					else {
						// Drop a non-node
						node.addNode({
							title: transfer.getData('text'),
						}, data.hitMode);
					}
					await this.autonumber();
					
					async function doTransfer() {
						if (sameTree) {
							data.otherNode.moveTo(node, data.hitMode);
						}
						else {
							data.otherNode.copyTo(node, data.hitMode, function (n) {
								n.title = n.title.replace(/<a.* ><\/a>/, '');
								n.key = null; // make sure, a new key is generated
								n.status = 'new'; // make sure, a new key is generated
							});
							let LTRight = $('#LTRight').fancytree('getTree');
							LTRight.enable(false);
							const RightAlert = $('#LTRightAlert');
							RightAlert.text('Importing content. Please wait...');
							RightAlert.slideDown();
							await data.otherNode.visitAndLoad();
							RightAlert.slideUp();
							LTRight.enable(true);
						}
					}
				},
			},
		});
		
		
		LTLeft.append('<div id=\'LTLeftAlert\'>You shouldn\'t see this</div>');
		LTRight.append('<div id=\'LTRightAlert\'>You shouldn\'t see this</div>');
		$('#LTRightAlert,#LTLeftAlert').hide();
		this.setState({initialized: true});
		
	}
	
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (this.state.initialized) {
			let leftTree = $('#LTLeft').fancytree('getTree');
			let rightTree = $('#LTRight').fancytree('getTree');
			if (prevState.LibraryTree !== this.state.LibraryTree)
				leftTree.reload(this.state.LibraryTree);
			
			rightTree.reload([this.props.RemixTree]);
		}
	}
	
	render() {
		let target = document.createElement('div');
		target.id = 'LTRemixer';
		const isAdmin = document.getElementById('adminHolder').innerText === 'true';
		const isPro = document.getElementById('proHolder').innerText === 'true';
		const isDemonstration = RemixerFunctions.checkIfDemonstration();
		const groups = document.getElementById('groupHolder').innerText;
		let allowed = isAdmin || (isPro && (groups.includes('contributor') || groups.includes('Contributor'))) || isDemonstration;
		
		return <div id='LTForm'>
			<div className="LTFormHeader">
				<div className='LTTitle'>{this.props.mode} Mode</div>
				<Button variant="contained" onClick={this.new}>New Page
					<Add/></Button>
				<Button variant="contained" onClick={this.delete}>Delete
					<Remove/></Button>
				
				<Tooltip title="Merges the contents of the selected folder with its parent's contents.">
					<Button variant="contained" onClick={this.mergeUp}>Merge Folder Up</Button>
				</Tooltip>
				<Button variant="contained" onClick={() => this.setState({resetDialog: true})}>Start Over
					<Refresh/></Button>
				{/*<Undo/>
				<Redo/>*/}
			</div>
			<div id='LTFormContainer'>
				<Slide in={this.props.options.tutorial} direction={'right'} mountOnEnter unmountOnExit>
					<div><h3>Tutorial Panel</h3>
						What do you need help with {document.getElementById('displaynameHolder').innerText}?
						<Tutorial/>
					</div>
				</Slide>
				<div>Library Panel<select id='LTFormSubdomain'
				                          onChange={this.setSubdomain}
				                          value={this.state.subdomain}>{this.getSelectOptions()}</select>
					<div id='LTLeft'></div>
				</div>
				<div>Remix Panel
					<div id='LTRight'></div>
				</div>
			</div>
			<Dialog open={this.state.resetDialog} onClose={this.handleReset} aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Want to Start Over?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This action will clear your work in the Remix Panel. If you would like to start out with a
						template, select the number of chapters and number of pages per chapter you would like.
					</DialogContentText>
					<TextField
						autoFocus
						margin="dense"
						label="Number of Chapters"
						type="number"
						value={this.state.chapters}
						onChange={this.handleChange('chapters')}
						fullWidth
					/>
					<TextField
						margin="dense"
						label="Number of Pages per Chaoter"
						type="number"
						value={this.state.pages}
						onChange={this.handleChange('pages')}
						fullWidth
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleReset} color="primary">
						Cancel
					</Button>
					<Button onClick={() => this.handleReset(this.state.chapters, this.state.pages)} color="primary">
						Start Over
					</Button>
				</DialogActions>
			</Dialog>
		</div>;
		
		function formMode(isAdmin, isPro, groups) {
			return (isPro && (groups.includes('contributor') || groups.includes('Contributor'))) || isAdmin ? `<div>Remix Type<select id='LTFormCopyMode'><option value='transclude'>Transclude</option><option value='copy'>Copy Source</option>${isAdmin ? `<option value='deep'>Copy Full [SLOW]</option>` : ''}</select></div>` : '';
		}
	}
	
	handleChange = name => event => {
		let input = event.target.value;
		if (input && input >= 0 && input <= 100) {
			input = Math.round(input);
			this.setState({[name]: input});
		}
	};
	
	save = (tree) => {
		tree.expanded = true;
		this.props.updateRemixer({RemixTree: tree});
	};
	
	new = async () => {
		let node = $('#LTRight').fancytree('getActiveNode');
		if (node) {
			node.addChildren({
				title: 'New Page',
				padded: '',
				lazy: false,
				expanded: true,
				status: 'new',
				tooltip: 'Newly Created Page',
			});
			await node.setExpanded();
			await this.autonumber();
		}
	};
	
	delete = () => {
		let node = $('#LTRight').fancytree('getActiveNode');
		if (node && node.key !== 'ROOT') {
			node.remove();
			this.autonumber();
		}
	};
	
	mergeUp = async () => {
		let node = $('#LTRight').fancytree('getActiveNode');
		if (node && node.key !== 'ROOT') {
			await node.setExpanded(true);
			if (node.hasChildren()) {
				while (node.hasChildren()) {
					node.getFirstChild().moveTo(node.parent, 'child');
				}
				node.remove();
				this.autonumber();
			}
		}
	};
	
	handleReset = (chapters, pages) => {
		if (!(chapters === undefined || pages === undefined)) {
			this.save(RemixerFunctions.generateDefault(chapters, pages));
		}
		this.setState({resetDialog: false});
	};
	
	autonumber = async () => {
		let root = $('#LTRight').fancytree('getTree').getNodeByKey('ROOT');
		if (!root.children) {
			return false;
		}
		
		
		
		let processNode = (node, sharedIndex, level) => {
			node.title = node.title.replace('&amp;', 'and');
			
			let index = sharedIndex[0]++;
			if (level && depth - level <= 1 && node.title.includes(': ')) {
				node.title = node.title.replace(/^[^:]*: /, '');
			}
			if ((!shallow && depth - level === 1) || (shallow && level === 1)) { //Chapter handling
				node.data['padded'] = `${('' + index).padStart(2, '0')}: ${node.title}`;
				
				let prefix = this.props.options.autonumber.chapterPrefix + ' ' || '';
				node.title = `${prefix}${index}: ${node.title}`;
				chapter = index;
			}
			else if (!shallow && depth - level === 0) { //Page handling
				node.data['padded'] = `${chapter}.${('' + index).padStart(2, '0')}: ${node.title}`;
				
				let prefix = this.props.options.autonumber.pagePrefix + ' ' || '';
				node.title = `${prefix}${chapter}.${index}: ${node.title}`;
			}
			else {
				node.data['padded'] = false;
			}
			node.lazy = false;
			if (node.children) {
				let sharedIndex = [1];
				for (let i = 0; i < node.children.length; i++) {
					node.children[i] = processNode(node.children[i], sharedIndex, level + 1);
				}
			}
			return node;
		};
		
		for (let i = 0; i < root.children.length; i++) {
			if (root.children[i].lazy) {
				await root.children[i].visitAndLoad();
			}
		}
		let d = root.toDict(true);
		let depth = this.getDepth(d);
		let chapter = 1;
		let shallow = depth < 2;
		if (this.props.options.autonumber) {
			let sharedIndex = [Number(this.props.options.autonumber.offset) || 1];
			processNode(d, sharedIndex, 0);
		}
		
		this.save(d);
	};
	
	debug() {
		let root = $('#LTRight').fancytree('getTree').getNodeByKey('ROOT');
		return root.toDict(true);
	}
	
	setSubdomain = async () => {
		let select = document.getElementById('LTFormSubdomain');
		let subdomain = select.value;
		let name = $(`#LTFormSubdomain option[value="${subdomain}"]`).text();
		let LTLeft = $('#LTLeft').fancytree('getTree');
		let LeftAlert = $('#LTLeftAlert');
		
		LTLeft.enable(false);
		LeftAlert.text(`Loading ${name}`);
		LeftAlert.slideDown();
		let content = await RemixerPanel.getSubpages('home', subdomain, false, true);
		
		LeftAlert.slideUp();
		LTLeft.enable(true);
		this.setState({subdomain: subdomain, LibraryTree: content});
	};
	
	
	getDepth(tree) {
		let depth = 0;
		while (tree && tree.children) {
			depth++;
			tree = tree.children[0];
		}
		return depth;
	}
	
	getSelectOptions() {
		let current = window.location.origin.split('/')[2].split('.')[0];
		let libraries = {
			'Biology': 'bio',
			'Business': 'biz',
			'Chemistry': 'chem',
			'Engineering': 'eng',
			'Espanol': 'espanol',
			'Geology': 'geo',
			'Humanities': 'human',
			'Mathematics': 'math',
			'Medicine': 'med',
			'Physics': 'phys',
			'Social Sciences': 'socialsci',
			'Statistics': 'stats',
			'Workforce': 'workforce',
		};
		let result = [];
		Object.keys(libraries).map(function (key, index) {
			result.push(<option value={libraries[key]} key={key}>{key}</option>);
		});
		return result;
	}
	
	static async getSubpages(path, subdomain, full, linkTitle) {
		path = path.replace(`https://${subdomain}.libretexts.org/`, '');
		let response = await LibreTexts.authenticatedFetch(path, 'subpages?dream.out.format=json', subdomain);
		response = await response.json();
		return await subpageCallback(response);
		
		async function subpageCallback(info) {
			let subpageArray = info['page.subpage'];
			if (subpageArray) {
				subpageArray = subpageArray.length ? info['page.subpage'] : [info['page.subpage']];
			}
			const result = [];
			const promiseArray = [];
			
			async function subpage(subpage, index) {
				let url = subpage['uri.ui'];
				let path = subpage.path['#text'];
				url = url.replace('?title=', '');
				path = path.replace('?title=', '');
				const hasChildren = subpage['@subpages'] === 'true';
				let children = hasChildren ? undefined : [];
				if (hasChildren && (full)) { //recurse down
					children = await LibreTexts.authenticatedFetch(path, 'subpages?dream.out.format=json', subdomain);
					children = await children.json();
					children = await subpageCallback(children, false);
				}
				if (!url.endsWith('/link'))
					result[index] = {
						title: linkTitle ? `${subpage.title}<a href="${url}" target="_blank"> ></a>` : subpage.title,
						url: url,
						path: url.replace(`https://${subdomain}.libretexts.org/`, ''),
						id: parseInt(subpage['@id']),
						children: children,
						lazy: !full,
						subdomain: subdomain,
					};
			}
			
			if (subpageArray && subpageArray.length) {
				for (let i = 0; i < subpageArray.length; i++) {
					promiseArray[i] = subpage(subpageArray[i], i);
				}
				
				await Promise.all(promiseArray);
				return result;
			}
			else {
				return [];
			}
		}
	}
	
	async publish() {
		let subdomain = window.location.origin.split('/')[2].split('.')[0];
		let institution = document.getElementById('LTFormInstitutions');
		if (institution.value === '') {
			if (confirm('Would you like to send an email to info@libretexts.com to request your institution?'))
				window.location.href = 'mailto:info@libretexts.org?subject=Remixer%20Institution%20Request';
			return false;
		}
		let name = document.getElementById('LTFormName').value;
		let college = institution.value;
		if (college.includes('Remixer_University')) {
			college += `/Username:_${document.getElementById('usernameHolder').innerText}`;
			await fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(`${college.replace(window.location.origin, '')}`)) + '/contents?edittime=now', {
				method: 'POST',
				body: '<p>{{template.ShowCategory()}}</p>',
				headers: {'x-deki-token': this.keys[subdomain], 'x-requested-with': 'XMLHttpRequest'},
			});
			await fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(`${college.replace(window.location.origin, '')}`)) + '/tags', {
				method: 'PUT',
				body: '<tags><tag value="article:topic-category"/></tags>',
				headers: {
					'Content-Type': 'text/xml; charset=utf-8',
					'x-deki-token': this.keys[subdomain],
					'x-requested-with': 'XMLHttpRequest',
				},
			});
		}
		let url = `${college}/${name.replace(/ /g, '_')}`;
		if (!name) {
			alert('No name provided!');
			return false;
		}
		let response = await LibreTexts.authenticatedFetch(`${college.replace(window.location.origin, '')}/${name}`, 'info', subdomain);
		if (response.ok) {
			alert(`The page ${url} already exists!`);
			return false;
		}
		this.autonumber();
		
		
		const isAdmin = document.getElementById('adminHolder').innerText === 'true';
		const isPro = document.getElementById('proHolder').innerText === 'true';
		const groups = document.getElementById('groupHolder').innerText.toLowerCase();
		const isDemonstration = RemixerFunctions.checkIfDemonstration();
		let allowed = isAdmin || (isPro && groups.includes('faculty') || isDemonstration);
		if (!allowed) {
			if (confirm('Thanks for trying out the OER Remixer in Demonstration mode!\n\nIf you are interested, contact us to get a free account so that you can publish your own LibreText! Would you like to send an email to info@libretexts.com to get started?'))
				window.location.href = 'mailto:info@libretexts.org?subject=Remixer%20Account%20Request';
			return false;
		}
		let copyMode = document.getElementById('LTFormCopyMode') ? document.getElementById('LTFormCopyMode').value : undefined;
		if (copyMode && copyMode === 'deep' && !isAdmin) {
			alert('Deep copy is restricted to administratiors. Access Denied.');
			document.getElementById('LTFormCopyMode').value = 'transclude';
			return false;
		}
		
		// let subdomain = window.location.origin.split("/")[2].split(".")[0];
		let LTRight = $('#LTRight').fancytree('getTree');
		let RightAlert = $('#LTRightAlert');
		
		RightAlert.text('Beginning Publication process');
		RightAlert.slideDown();
		LTRight.enable(false);
		let tree = LTRight.toDict()[0];
		tree.data = {url: url};
		let destRoot = tree.data.url;
		const results = document.getElementById('copyResults');
		const errors = document.getElementById('copyErrors');
		results.innerText = 'Processing';
		console.log(tree);
		let counter = 0;
		let startedAt = new Date();
		let failedCounter = 0;
		let errorText = '';
		const total = getTotal(tree.children);
		
		await coverPage(tree);
		await doCopy(destRoot, tree.children, 1);
		const text = `${'Finished: ' + counter + ' pages completed' + (failedCounter ? '\\nFailed: ' + failedCounter : '')}`;
		results.innerHTML = `<div><div>${text}</div><a href="${destRoot}" target="_blank">Visit your new LibreText here</a></div>`;
		RightAlert.text(text);
		RightAlert.slideUp();
		LTRight.enable(true);
		
		function decodeHTML(content) {
			let ret = content.replace(/&gt;/g, '>');
			ret = ret.replace(/&lt;/g, '<');
			ret = ret.replace(/&quot;/g, '"');
			ret = ret.replace(/&apos;/g, '\'');
			ret = ret.replace(/&amp;/g, '&');
			return ret;
		}
		
		async function coverPage(tree) {
			let path = tree.data.url.replace(window.location.origin + '/', '');
			let content = '<p>{{template.ShowCategory()}}</p>';
			await fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/contents?abort=exists', {
				method: 'POST',
				body: content,
				headers: {'x-deki-token': this.keys[subdomain], 'x-requested-with': 'XMLHttpRequest'},
			});
			let tags = '<tags><tag value="article:topic-category"/><tag value="coverpage:yes"/></tags>';
			let propertyArray = [putProperty('mindtouch.page#welcomeHidden', true), putProperty('mindtouch.idf#subpageListing', 'simple'), fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/tags', {
				method: 'PUT',
				body: tags,
				headers: {
					'Content-Type': 'text/xml; charset=utf-8',
					'x-deki-token': this.keys[subdomain],
					'x-requested-with': 'XMLHttpRequest',
				},
			})];
			
			await Promise.all(propertyArray);
			await fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/move?title=' + tree.title + '&name=' + encodeURIComponent(tree.title.replace(' ', '_')), {
				method: 'POST',
				headers: {'x-deki-token': this.keys[subdomain], 'x-requested-with': 'XMLHttpRequest'},
			});
			
			async function putProperty(name, value) {
				await fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/properties', {
					method: 'POST',
					body: value,
					headers: {
						'Slug': name,
						'x-deki-token': this.keys[subdomain],
						'x-requested-with': 'XMLHttpRequest',
					},
				});
			}
		}
		
		function getTotal(treeArray) {
			let result = treeArray.length;
			for (let i = 0; i < treeArray.length; i++) {
				let child = treeArray[i].children;
				if (child) {
					result += getTotal(child);
				}
			}
			return result;
		}
		
		async function doCopy(destRoot, tree, depth) {
			
			for (let i = 0; i < tree.length; i++) {
				const child = tree[i];
				child.title = child.title.replace(/[{}]/g, '');
				child.data.padded = child.data.padded ? child.data.padded.replace(/[{}]/g, '') : false;
				let url = destRoot + '/' + (child.data.padded || child.title);
				let path = url.replace(window.location.origin + '/', '');
				if (!child.data.url) { //New Page
					const isGuide = depth === 1;
					await fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/contents?abort=exists', {
						method: 'POST',
						body: isGuide ? '<p>{{template.ShowGuide()}}</p><p className="template:tag-insert"><em>Tags recommended by the template: </em><a href="#">article:topic-guide</a></p>\n'
							: '',
						headers: {'x-deki-token': this.keys[subdomain], 'x-requested-with': 'XMLHttpRequest'},
					});
					let tags = `<tags><tag value="${isGuide ? 'article:topic-guide' : 'article:topic'}"/></tags>`;
					await fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/tags', {
						method: 'PUT',
						body: tags,
						headers: {
							'Content-Type': 'text/xml; charset=utf-8',
							'x-deki-token': this.keys[subdomain],
							'x-requested-with': 'XMLHttpRequest',
						},
					});
					// Title cleanup
					if (child.data.padded) {
						fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/move?title=' + child.title + '&name=' + child.data.padded, {
							method: 'POST',
							headers: {'x-deki-token': this.keys[subdomain], 'x-requested-with': 'XMLHttpRequest'},
						}).then();
					}
					if (isGuide) {
						await Promise.all(
							[putProperty('mindtouch.idf#guideDisplay', 'single', path),
								putProperty('mindtouch.page#welcomeHidden', true, path),
								putProperty('mindtouch#idf.guideTabs', '[{"templateKey":"Topic_hierarchy","templateTitle":"Topic hierarchy","templatePath":"MindTouch/IDF3/Views/Topic_hierarchy","guid":"fc488b5c-f7e1-1cad-1a9a-343d5c8641f5"}]', path)]);
						
						let current = window.location.origin.split('/')[2].split('.')[0];
						let headers = {
							headers: {
								'x-deki-token': this.keys['chem'],
							},
						};
						if (current === 'chem')
							headers.headers['x-requested-with'] = 'XMLHttpRequest';
						let image = await fetch('https://chem.libretexts.org/@api/deki/files/239314/default.png?origin=mt-web', headers);
						
						image = await image.blob();
						fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/files/=mindtouch.page%2523thumbnail', {
							method: 'PUT',
							body: image,
							headers: {
								'x-deki-token': this.keys[subdomain],
								'x-requested-with': 'XMLHttpRequest',
							},
						}).then();
					}
				}
				else { //copying from an exisiting source
					// child.path = child.data.url.replace(window.location.origin + "/", ""); //source
					child.path = child.data.path;
					let content;
					//get info
					let info = await LibreTexts.authenticatedFetch(child.path, 'info?dream.out.format=json', child.data.subdomain);
					
					//get Tags
					let copyMode = document.getElementById('LTFormCopyMode') ? document.getElementById('LTFormCopyMode').value : undefined;
					let copyContent = copyMode && copyMode !== 'transclude';
					let response = await LibreTexts.authenticatedFetch(child.path, 'tags?dream.out.format=json', child.data.subdomain);
					let tags = await response.json();
					if (response.ok && tags['@count'] !== '0') {
						if (tags.tag) {
							if (tags.tag.length) {
								tags = tags.tag.map((tag) => tag['@value']);
							}
							else {
								tags = [tags.tag['@value']];
							}
						}
						copyContent = copyContent || tags.includes('article:topic-category') || tags.includes('article:topic-guide');
						if (!copyContent) {
							tags.push('transcluded:yes');
						}
					}
					else {
						tags = ['transcluded:yes'];
					}
					info = await (await info).json();
					
					tags.push(`source-${child.data.subdomain}-${info['@id']}`);
					let tagsHTML = tags.map((tag) => `<tag value="${tag}"/>`).join('');
					tagsHTML = '<tags>' + tagsHTML + '</tags>';
					
					//copy Content
					let current = window.location.origin.split('/')[2].split('.')[0];
					if (copyContent) {
						if (child.data.subdomain === current) {
							content = await LibreTexts.authenticatedFetch(child.path, 'contents?mode=raw', child.data.subdomain, {isLimited: isDemonstration});
							content = await content.text();
							content = content.match(/<body>([\s\S]*?)<\/body>/)[1].replace('<body>', '').replace('</body>', '');
							content = decodeHTML(content);
						}
						else {
							//Get cross content
							content = await fetch('https://api.libretexts.org/endpoint/contents', {
								method: 'PUT',
								body: JSON.stringify({
									path: child.path,
									api: 'contents?mode=raw',
									subdomain: child.data.subdomain,
								}),
							});
							content = await content.text();
							content = content.match(/<body>([\s\S]*?)<\/body>/)[1].replace('<body>', '').replace('</body>', '');
							content = decodeHTML(content);
							
							let copyMode = document.getElementById('LTFormCopyMode') ? document.getElementById('LTFormCopyMode').value : undefined;
							if (copyMode === 'copy') {
								content = content.replace(/\/@api\/deki/g, `https://${child.data.subdomain}.libretexts.org/@api/deki`);
								content = content.replace(/ fileid=".*?"/g, '');
							}
							else if (copyMode === 'deep') {
								//Fancy file transfer VERY SLOW BUT EFFECTIVE
								response = await LibreTexts.authenticatedFetch(child.path, 'files?dream.out.format=json', child.data.subdomain);
								if (response.ok) {
									let files = await response.json();
									if (files['@count'] !== '0') {
										if (files.file) {
											if (!files.file.length) {
												files = [files.file];
											}
											else {
												files = files.file;
											}
										}
									}
									let promiseArray = [];
									for (let i = 0; i < files.length; i++) {
										let file = files[i];
										if (file['@res-is-deleted'] === 'false')
											promiseArray.push(processFile(file, child, path, file['@id']));
									}
									promiseArray = await Promise.all(promiseArray);
									for (let i = 0; i < promiseArray.length; i++) {
										if (promiseArray[i]) {
											content = content.replace(promiseArray[i].original, promiseArray[i].final);
											content = content.replace(`fileid="${promiseArray[i].oldID}"`, `fileid="${promiseArray[i].newID}"`);
										}
									}
								}
								
								// Handling of hotlinked images (not attached to the page)
								response = await LibreTexts.authenticatedFetch(path, 'files?dream.out.format=json');
								if (response.ok) {
									let files = await response.json();
									if (files['@count'] !== '0') {
										if (files.file) {
											if (!files.file.length) {
												files = [files.file];
											}
											else {
												files = files.file;
											}
										}
									}
									files = files.map((file) => file['@id']);
									
									let promiseArray = [];
									let images = content.match(/(<img.*?src="\/@api\/deki\/files\/)[\S\s]*?(")/g);
									if (images) {
										for (let i = 0; i < images.length; i++) {
											images[i] = images[i].match(/src="\/@api\/deki\/files\/([\S\s]*?)["/]/)[1];
											
											if (!files.includes(images[i])) {
												promiseArray.push(processFile(null, child, path, images[i]));
											}
										}
										
										promiseArray = await Promise.all(promiseArray);
										for (let i = 0; i < promiseArray.length; i++) {
											if (promiseArray[i]) {
												content = content.replace(promiseArray[i].original, promiseArray[i].final);
												content = content.replace(`fileid="${promiseArray[i].oldID}"`, `fileid="${promiseArray[i].newID}"`);
											}
										}
									}
								}
							}
						}
					}
					else if (child.data.subdomain !== current) {
						content = `<p className="mt-script-comment">Cross Library Transclusion</p>

<pre className="script">
template('CrossTransclude/Web',{'Library':'${child.data.subdomain}','PageID':${child.data.id}});</pre>

<div className="comment">
<div className="mt-comment-content">
<p><a href="${child.data.url}">Cross-Library Link: ${child.data.url}</a><br/>source-${child.data.subdomain}-${info['@id']}</p>
</div>
</div>`;
					}
					else {
						content = `<div className="mt-contentreuse-widget" data-page="${child.path}" data-section="" data-show="false">
<pre className="script">
wiki.page("${child.path}", NULL)</pre>
</div>

<div className="comment">
<div className="mt-comment-content">
<p><a href="${child.data.url}">Content Reuse Link: ${child.data.url}</a></p>
</div>
</div>`;
					}
					response = await fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/contents?edittime=now', {
						method: 'POST',
						body: content,
						headers: {'x-deki-token': this.keys[subdomain], 'x-requested-with': 'XMLHttpRequest'},
					});
					if (response.status >= 400) {
						failedCounter++;
					}
					switch (response.status) {
						case 403:
							errorText += '403 Forbidden - User does not have permission to create' + path + '\n';
							break;
						case 500:
							errorText += '500 Server Error ' + path + '\n';
							break;
						case 409:
							errorText += '409 Conflict - Page already exists ' + path + '\n';
							break;
						default:
							errorText += 'Error ' + response.status + ' ' + path + '\n';
							break;
						case 200:
							//copy Tags
							if (tagsHTML) {
								fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/tags', {
									method: 'PUT',
									body: tagsHTML,
									headers: {
										'Content-Type': 'text/xml; charset=utf-8',
										'x-deki-token': this.keys[subdomain],
										'x-requested-with': 'XMLHttpRequest',
									},
								}).then();
							}
							//Properties
							LibreTexts.authenticatedFetch(child.path, 'properties?dream.out.format=json', child.data.subdomain).then(async (response) => {
								let content = await response.json();
								if (content['@count'] !== '0') {
									if (content.property) {
										if (content.property.length) {
											content = content.property.map((property) => {
												return {name: property['@name'], value: property['contents']['#text']};
											});
										}
										else {
											content = [{
												name: content.property['@name'],
												value: content.property['contents']['#text'],
											}];
										}
									}
								}
								for (let i = 0; i < content.length; i++) {
									switch (content[i].name) {
										//subpageListing check
										case 'mindtouch.idf#subpageListing':
											if (tags.includes('article:topic-category')) {
												fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/properties', {
													method: 'POST',
													body: content[i].value,
													headers: {
														'Slug': content[i].name,
														'x-deki-token': this.keys[subdomain],
														'x-requested-with': 'XMLHttpRequest',
													},
												}).then();
											}
											break;
										//subpageListing check
										case 'mindtouch.idf#guideDisplay':
											if (tags.includes('article:topic-guide')) {
												fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/properties', {
													method: 'POST',
													body: content[i].value,
													headers: {
														'Slug': content[i].name,
														'x-deki-token': this.keys[subdomain],
														'x-requested-with': 'XMLHttpRequest',
													},
												}).then();
											}
											break;
										//pagecontent
										case 'mindtouch.page#overview':
										case 'mindtouch#idf.guideTabs':
										case 'mindtouch.page#welcomeHidden':
										case 'mindtouch.idf#product-image': //NEED FILE TRANSFER
											fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/properties', {
												method: 'POST',
												body: content[i].value,
												headers: {
													'Slug': content[i].name,
													'x-deki-token': this.keys[subdomain],
													'x-requested-with': 'XMLHttpRequest',
												},
											}).then();
											break;
									}
								}
							});
							
							// Title cleanup
							if (child.data.padded) {
								fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/move?title=' + child.title + '&name=' + child.data.padded, {
									method: 'POST',
									headers: {
										'x-deki-token': this.keys[subdomain],
										'x-requested-with': 'XMLHttpRequest',
									},
								}).then();
							}
							
							//Thumbnail
							LibreTexts.authenticatedFetch(child.path, 'files', child.data.subdomain).then(async (response) => {
								if (response.ok) {
									let files = await response.text();
									if (files.includes('mindtouch.page#thumbnail') || files.includes('mindtouch.page%23thumbnail')) {
										let image = await LibreTexts.authenticatedFetch(child.path, 'thumbnail', child.data.subdomain);
										
										image = await image.blob();
										fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/files/=mindtouch.page%2523thumbnail', {
											method: 'PUT',
											body: image,
											headers: {
												'x-deki-token': this.keys[subdomain],
												'x-requested-with': 'XMLHttpRequest',
											},
										}).then();
									}
									else if (tags.includes('article:topic-category') || tags.includes('article:topic-guide')) {
										let current = window.location.origin.split('/')[2].split('.')[0];
										let image = await fetch('https://chem.libretexts.org/@api/deki/files/239314/default.png?origin=mt-web', {
											headers: {
												'x-deki-token': this.keys['chem'],
												'x-requested-with': current === 'chem' ? 'XMLHttpRequest' : '',
											},
										});
										
										image = await image.blob();
										fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/files/=mindtouch.page%2523thumbnail', {
											method: 'PUT',
											body: image,
											headers: {
												'x-deki-token': this.keys[subdomain],
												'x-requested-with': 'XMLHttpRequest',
											},
										}).then();
									}
								}
							});
					}
				}
				
				
				counter++;
				var elapsed = (new Date() - startedAt) / 1000;
				var rate = counter / elapsed;
				var estimated = total / rate;
				var eta = estimated - elapsed;
				var etah = secondsToStr(eta);
				const text = `Processing: ${counter}/${total} pages completed (${Math.round(counter * 100 / total)}%)` + (failedCounter ? '\nFailed: ' + failedCounter : '');
				
				
				results.innerText = `${text} ETA: ${etah}`;
				RightAlert.text(text);
				errors.innerText = errorText;
				if (child.children) {
					await doCopy(url, child.children, depth + 1);
				}
			}
			
			
			async function putProperty(name, value, path) {
				fetch('/@api/deki/pages/=' + encodeURIComponent(encodeURIComponent(path)) + '/properties', {
					method: 'POST',
					body: value,
					headers: {
						'Slug': name,
						'x-deki-token': this.keys[subdomain],
						'x-requested-with': 'XMLHttpRequest',
					},
				});
			}
			
			async function processFile(file, child, path, id) {
				let image, filename;
				if (!file) {
					image = await fetch(`https://${child.data.subdomain}.libretexts.org/@api/deki/files/${id}?dream.out.format=json`, {
						headers: {'x-deki-token': this.keys[child.data.subdomain]},
					});
					filename = await fetch(`https://${child.data.subdomain}.libretexts.org/@api/deki/files/${id}/info?dream.out.format=json`, {
						headers: {'x-deki-token': this.keys[child.data.subdomain]},
					});
					if (!image.ok || !filename.ok)
						return false;
					filename = await filename.json();
					filename = filename['filename'];
					
				}
				else if (!(file.contents['@href'].includes('mindtouch.page#thumbnail') || file.contents['@href'].includes('mindtouch.page%23thumbnail'))) {
					//only files with extensions
					filename = file['filename'];
					image = await LibreTexts.authenticatedFetch(child.path, `files/${filename}`, child.data.subdomain);
					if (!image.ok)
						return false;
				}
				
				
				if (filename) {
					image = await image.blob();
					
					let response = await fetch(`/@api/deki/pages/=${encodeURIComponent(encodeURIComponent(path))}/files/${filename}?dream.out.format=json`, {
						method: 'PUT',
						body: image,
						headers: {'x-deki-token': this.keys[subdomain], 'x-requested-with': 'XMLHttpRequest'},
					});
					if (!response.ok)
						return false;
					
					response = await response.json();
					let original = file ? file.contents['@href'].replace(`https://${child.data.subdomain}.libretexts.org`, '') : `/@api/deki/files/${id}`;
					return {
						original: original,
						oldID: id,
						newID: response['@id'],
						final: `/@api/deki/pages/=${encodeURIComponent(encodeURIComponent(path))}/files/${filename}`,
					};
				}
				return false;
			}
		}
	}
}


function secondsToStr(seconds) {
	return millisecondsToStr(seconds * 1000);
}

// http://stackoverflow.com/a/8212878
function millisecondsToStr(milliseconds) {
	// TIP: to find current time in milliseconds, use:
	// var  current_time_milliseconds = new Date().getTime();
	
	function numberEnding(number) {
		return (number > 1) ? 's' : '';
	}
	
	let temp = Math.floor(milliseconds / 1000);
	const years = Math.floor(temp / 31536000);
	if (years) {
		return years + ' year' + numberEnding(years);
	}
	const days = Math.floor((temp %= 31536000) / 86400);
	if (days) {
		return days + ' day' + numberEnding(days);
	}
	const hours = Math.floor((temp %= 86400) / 3600);
	if (hours) {
		return hours + ' hour' + numberEnding(hours);
	}
	const minutes = Math.floor((temp %= 3600) / 60);
	if (minutes) {
		return minutes + ' minute' + numberEnding(minutes);
	}
	const seconds = temp % 60;
	if (seconds) {
		return seconds + ' second' + numberEnding(seconds);
	}
	return 'less than a second'; //'just now' //or other string you like;
}

function formatNumber(it) {
	return it.toPrecision(4);
}
