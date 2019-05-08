import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Button from "../../elements/Button";
import { FacebookButton } from "./social/FacebookButton";
import Divider from "../../common/Divider";
import LoginForm from "../authentication/forms/LoginForm";
import SignupForm from "../authentication/forms/SignupForm";
import Dialog from "../../elements/Dialog";

const styles = {
	content: {
		textAlign: "center"
	}
};

//If a user is trying to do something that requires authentication first
//A modal version of the signup/login page
class RequiresAuthDialog extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isNewUser: null //They haven't selected signup or login yet
		};

		this.onClose = this.onClose.bind(this);
		this.onSuccess = this.onSuccess.bind(this);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const { type } = this.props;

		//Check if we need to jump straight into login or signup without asking first
		if (prevProps.type !== type) {
			let isNewUser = null;
			if (type === "login") {
				isNewUser = false;
			} else if (type === "signup") {
				isNewUser = true;
			}

			this.setState({ isNewUser });
		}
	}

	onClose() {
		this.props.onClose();
		this.setState({ isNewUser: null });
	}

	onSuccess() {
		this.onClose();
		this.props.onAuthSuccess();
	}

	renderNewUser() {
		return (
			<div>
				<Button
					variant="text"
					onClick={() => this.setState({ isNewUser: false })}
				>
					Already have an account?
				</Button>
				<SignupForm onSuccess={this.onSuccess}/>
			</div>
		);
	}

	renderNotNewUser() {
		return (
			<div>
				<Button
					variant="text"
					onClick={() => this.setState({ isNewUser: true })}
				>
					New here? Create a free account.
				</Button>
				<LoginForm onSuccess={this.onSuccess}/>
			</div>
		);
	}

	renderOptions() {
		return (
			<div>
				<div style={{ marginTop: 20 }}/>

				<Button
					variant="text"
					onClick={() => this.setState({ isNewUser: false })}
				>
					Already have an account?
				</Button>

				<div style={{ marginTop: 20 }}/>

				{process.env.REACT_APP_FACEBOOK_APP_ID ? (
					<FacebookButton onSuccess={this.onSuccess}/>
				) : null}

				<Divider style={{ marginTop: 20, marginBottom: 20 }}> or </Divider>

				<Button
					variant="text"
					onClick={() => this.setState({ isNewUser: true })}
				>
					Sign up with email
				</Button>
			</div>
		);
	}

	render() {
		const { type, classes } = this.props;
		const { isNewUser } = this.state;

		let title = "";
		let content = null;

		if (isNewUser === true) {
			title = "Create a free account";
			content = this.renderNewUser();
		} else if (isNewUser === false) {
			title = "Login to your Big Neon account";
			content = this.renderNotNewUser();
		} else {
			title = "Create a free Big Neon account";
			content = this.renderOptions();
		}

		return (
			<Dialog
				open={!!type}
				onClose={this.onClose}
				title={title}
				iconUrl={"/icons/user-white.svg"}
			>
				<div className={classes.content}>{content}</div>
			</Dialog>
		);
	}
}

RequiresAuthDialog.propTypes = {
	type: PropTypes.oneOf([true, false, "login", "signup"]),
	onClose: PropTypes.func.isRequired,
	onAuthSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(RequiresAuthDialog);
