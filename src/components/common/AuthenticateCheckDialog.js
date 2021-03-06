import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";

const styles = theme => {
	return {
		root: { backgroundColor: theme.palette.grey.A300 }
	};
};

class AuthenticateCheckDialog extends React.Component {
	render() {
		const { classes } = this.props;

		return (
			<Dialog
				aria-labelledby="please-authenticate"
				open={true}
				className={classes.root}
			>
				<DialogTitle id="please-authenticate">{"Loading..."}</DialogTitle>
			</Dialog>
		);
	}
}

AuthenticateCheckDialog.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AuthenticateCheckDialog);
