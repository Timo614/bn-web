import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

const styles = {
	menuButton: {}
};

class NotificationList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			anchorEl: null,
			id: Math.random()
		};
		this.buttonRef = React.createRef();
	}

	componentDidMount() {}

	handleMenu(event) {
		this.setState({ anchorEl: event.currentTarget });
	}

	handleClose() {
		this.setState({ anchorEl: null });
	}

	renderItems() {
		const { items } = this.props;
		const menuItems = [];
		for (const i in items) {
			menuItems.push(
				<MenuItem key={`notification_menu_item_${i}`}> {items[i]}</MenuItem>
			);
		}
		return menuItems;
	}

	render() {
		const { classes, icon, color = "default" } = this.props;

		const { anchorEl } = this.state;
		const open = Boolean(anchorEl);

		return (
			<span>
				<IconButton
					className={classes.menuButton}
					aria-owns={open ? "menu-appbar" : null}
					aria-haspopup="true"
					onClick={this.handleMenu.bind(this)}
					color={color}
				>
					{icon}
				</IconButton>
				<Menu
					id="menu-appbar"
					anchorEl={anchorEl}
					anchorOrigin={{
						vertical: "top",
						horizontal: "right"
					}}
					transformOrigin={{
						vertical: "top",
						horizontal: "right"
					}}
					open={open}
					onClose={this.handleClose.bind(this)}
				>
					{this.renderItems()}
				</Menu>
			</span>
		);
	}
}

NotificationList.propTypes = {
	classes: PropTypes.object.isRequired,
	items: PropTypes.array.isRequired,
	icon: PropTypes.any,
	color: PropTypes.string
};

export default withStyles(styles)(NotificationList);
