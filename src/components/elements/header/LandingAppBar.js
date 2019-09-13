import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import classnames from "classnames";

import {
	fontFamilyDemiBold,
	secondaryHex,
	toolBarHeight
} from "../../../config/theme";
import AppBarLogo from "./AppBarLogo";
import Button from "../Button";
import { Slide, Typography } from "@material-ui/core";
import Settings from "../../../config/settings";
import user from "../../../stores/user";
import layout from "../../../stores/layout";
import Hidden from "@material-ui/core/Hidden";
import SearchToolBarInput from "./SearchToolBarInput";
import BoxOfficeLink from "./BoxOfficeLink";
import CurrentOrganizationMenu from "./CurrentOrganizationMenu";
import CartHeaderLink from "../../common/cart/CartHeaderLink";
import RightUserMenu from "./RightUserMenu";

const eventImageHeight = 45;

const styles = theme => {
	return {
		toolBar: {
			display: "flex",
			justifyContent: "center",
			paddingRight: theme.spacing.unit * 2,

			paddingLeft: theme.spacing.unit * 2,
			...toolBarHeight
		},
		barContent: {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",

			width: "100%"
		},
		rightMenuOptions: {
			alignItems: "center",
			display: "flex"
		},
		eventDetailsContainer: {
			display: "flex",
			flex: 1,
			alignItems: "center",
			paddingRight: theme.spacing.unit * 4,
			paddingLeft: theme.spacing.unit * 4
			//
			// borderStyle: "solid",
			// borderColor: "blue",
			// borderWidth: 0.5
		},
		mobileHeaderImage: {
			height: eventImageHeight,
			width: eventImageHeight * Settings().promoImageAspectRatio,
			backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			backgroundPosition: "center",
			borderRadius: 4
		},
		textContainer: {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			paddingLeft: theme.spacing.unit * 2
		},
		eventTitle: {
			fontFamily: fontFamilyDemiBold
		},
		subHeading: {
			fontSize: theme.typography.fontSize * 0.8,
			color: "#9DA3B4",
			lineHeight: 1
		},
		authButtonText: {
			fontFamily: fontFamilyDemiBold
		},
		signUpText: {
			color: secondaryHex
		}
	};
};

const showOnScrollHeight = 450;

class LandingAppBar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			show: false,
			displayTime: ""
		};

		this.onWindowScroll = this.onWindowScroll.bind(this);
	}

	componentDidMount() {
		window.addEventListener("scroll", this.onWindowScroll);
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", this.onWindowScroll);
	}

	onWindowScroll() {
		if (window.pageYOffset > showOnScrollHeight && !this.state.show) {
			this.setState({ show: true });
		} else if (window.pageYOffset < showOnScrollHeight && this.state.show) {
			this.setState({ show: false });
		}
	}

	onAuth(type) {
		user.showAuthRequiredDialog(() => {}, type);
	}

	render() {
		const { classes, isAuthenticated, history } = this.props;

		const { show, displayTime } = this.state;

		return (
			<Slide direction="down" in={show}>
				<AppBar>
					<Toolbar className={classes.toolBar}>
						<div className={classes.barContent}>
							<Link to={"/"}>
								<AppBarLogo/>
							</Link>

							{!layout.showStudioLogo ? (
								<Hidden smDown>
									<SearchToolBarInput history={history}/>
								</Hidden>
							) : null}

							<span className={classes.rightMenuOptions}>
								<Hidden smDown>
									<BoxOfficeLink/>
									<CurrentOrganizationMenu/>
									<CartHeaderLink/>
								</Hidden>
								<RightUserMenu history={history}/>
							</span>
						</div>
					</Toolbar>
				</AppBar>
			</Slide>
		);
	}
}

LandingAppBar.propTypes = {
	classes: PropTypes.object.isRequired,
	ctaButton: PropTypes.element.isRequired,
	isAuthenticated: PropTypes.oneOf([true, false, null]),
	name: PropTypes.string.isRequired,
	venue: PropTypes.object.isRequired,
	event_start: PropTypes.string.isRequired,
	door_time: PropTypes.string.isRequired
};

export default withStyles(styles)(LandingAppBar);
