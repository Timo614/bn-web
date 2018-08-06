import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import { Link } from "react-router-dom";

import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";
import Button from "../../../common/Button";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit
	}
});

class OrganizationsView extends Component {
	constructor(props) {
		super(props);

		this.state = {
			organizations: null
		};
	}

	componentDidMount() {
		api()
			.get("/organizations")
			.then(response => {
				const { data } = response;
				this.setState({ organizations: data });
			})
			.catch(error => {
				console.error(error);
				this.setState({ organizations: false });
				notifications.show({
					message: "Loading organizations failed.",
					variant: "error"
				});
			});
	}

	renderOrganizations() {
		const { organizations } = this.state;
		const { classes } = this.props;

		if (organizations === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (organizations && organizations.length > 0) {
			return organizations.map(
				({
					id,
					owner_user_id,
					address,
					city,
					country,
					name,
					phone,
					state,
					zip
				}) => (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<Link
							to={`/admin/organizations/${id}`}
							style={{ textDecoration: "none" }}
						>
							<Card className={classes.paper}>
								<Typography variant="display1">{name}</Typography>
								<Typography variant="body1">
									{address || "*Missing address"}
								</Typography>
							</Card>
						</Link>
					</Grid>
				)
			);
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No organizations found</Typography>

					<Link
						to={"/admin/organizations/create"}
						style={{ textDecoration: "none" }}
					>
						<Button customClassName="callToAction">Create organization</Button>
					</Link>
				</Grid>
			);
		}
	}

	render() {
		return (
			<div>
				<Typography variant="display3">Organizations</Typography>

				<Grid container spacing={24}>
					{this.renderOrganizations()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(OrganizationsView);
