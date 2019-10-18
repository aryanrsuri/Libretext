import React from 'react';
import RemixerFunctions from '../reusableFunctions';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Warning from "@material-ui/icons/Warning";
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import Info from "@material-ui/icons/Info";
import Publish from "@material-ui/icons/Publish";
import {withSnackbar} from 'notistack';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Tooltip from "@material-ui/core/Tooltip";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import CircularProgress from "@material-ui/core/CircularProgress";

class ReRemixerPanel extends React.Component {
	constructor() {
		super();
		let subdomain = window.location.origin.split('/')[2].split('.')[0];
		
		this.state = {
			initialized: false,
			LibraryTree: {},
			subdomain: subdomain,
		};
		
	}
	
	async componentDidMount() {
		const LTLeft = $('#LTLeft');
		let LeftAlert = $('#LTLeftAlert');
		LeftAlert.text(`Loading ${name}`);
		LeftAlert.slideDown();
		this.setState({LibraryTree: await RemixerFunctions.getSubpages('home', this.state.subdomain, false, true)});
		LeftAlert.slideUp();
		LTLeft.fancytree({
			source: this.state.LibraryTree,
			debugLevel: 0,
			autoScroll: true,
			extensions: ['dnd5'],
			lazyLoad: function (event, data) {
				const dfd = new $.Deferred();
				let node = data.node;
				data.result = dfd.promise();
				RemixerFunctions.getSubpages(node.data.url, node.data.subdomain, false, true).then((result) => dfd.resolve(result), node.data.subdomain);
			},
			dnd5: {
				// autoExpandMS: 400,
				preventForeignNodes: true,
				// preventNonNodes: true,
				preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
				preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
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
			tooltip: (event, data) => `${(data.node.data.status || 'new').toUpperCase()} page`
		});
		
		
		LTLeft.append('<div id=\'LTLeftAlert\'>You shouldn\'t see this</div>');
		$('#LTLeftAlert').hide();
		this.setState({initialized: true});
	}
	
	
	render() {
		let target = document.createElement('div');
		target.id = 'LTRemixer';
		
		let currentlyActive;
		if (this.state.initialized) {
			const leftTree = $('#LTLeft').fancytree('getTree');
			
			currentlyActive = leftTree.getActiveNode();
			currentlyActive = currentlyActive ? currentlyActive.key : this.props.currentlyActive;
			leftTree.reload([this.props.RemixTree]);
			if (currentlyActive) {
				leftTree.activateKey(currentlyActive, {noFocus: true});
			}
			currentlyActive = leftTree.getNodeByKey(this.props.currentlyActive);
		}
		
		let permission = RemixerFunctions.userPermissions(true);
		return <div id='LTForm'>
			<div className="LTFormHeader" style={{backgroundColor: permission.color}}>
				<div className='LTTitle'><Tooltip title={permission.description}>
					<div style={{display: 'flex', alignItems: 'center'}}>{this.props.mode} Mode
						<Info style={{marginLeft: 10}}/></div>
				</Tooltip></div>
				<Button disabled={!currentlyActive} className={'expandedLabel'}>
				<DoubleArrowIcon/>
				</Button>
			</div>
			<div id='LTFormContainer'>
				<div>Library Panel<select id='LTFormSubdomain'
				                          onChange={this.setSubdomain}
				                          value={this.state.subdomain}>{this.getSelectOptions()}</select>
					<div id='LTLeft' className='treePanel'></div>
				</div>
			</div>
			<Dialog open={!this.state.initialized} aria-labelledby="form-dialog-title"
			        id="editDialog">
				<DialogTitle id="form-dialog-title">Loading ReRemixer
				</DialogTitle>
				<DialogContent style={{display: 'flex', justifyContent: 'center', padding: 50}}>
					<CircularProgress size={100}/>
				</DialogContent>
			</Dialog>
		</div>;
	}
	
		
	
	
	save = (tree, updateUndo) => {
		tree.expanded = true;
		this.props.updateRemixer({RemixTree: tree}, updateUndo);
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
		let content = await RemixerFunctions.getSubpages('home', subdomain, false, true);
		
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
		let libraries = LibreTexts.libraries;
		let result = [];
		Object.keys(libraries).map(function (key, index) {
			result.push(<option value={libraries[key]} key={key}>{key}</option>);
		});
		return result;
	}
	
	ArticleType = (type) => {
		let badStructure = this.checkStructure(type);
		return <MenuItem
			value={type}>
			<Tooltip
				title={badStructure ? 'Warning: This article type currently violates the recommended content structure' : ''}>
				<div style={{display: 'flex', alignItems: 'center', flex: 1}}>
					<ListItemText primary={RemixerFunctions.articleTypeToTitle(type)}
					              style={badStructure ? {color: 'orange'} : {}}/>
					{badStructure ? <ListItemIcon style={badStructure ? {color: 'orange'} : {}}>
						<Warning/>
					</ListItemIcon> : null}
				</div>
			</Tooltip>
		</MenuItem>;
	};
	
	PageStatus = () => {
		const status = this.state.edit.status;
		const color = RemixerFunctions.statusColor(status);
		switch (status) {
			case 'unchanged':
				return <span style={{color: color}}>[Unchanged]</span>;
			case 'new':
				return <span style={{color: color}}>[New]</span>;
			case 'modified':
				return <span style={{color: color}}>[Modified]</span>;
			case 'deleted':
				return <span style={{color: color}}>[Deleted]</span>;
			default:
				return null;
		}
	};
}

export default withSnackbar(ReRemixerPanel); //Allows snackbars