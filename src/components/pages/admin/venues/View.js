import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";

import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class VenuesView extends Component {
	constructor(props) {
		super(props);

		this.state = {
			venues: null
		};
	}

	componentDidMount() {
		api()
			.get("/venues")
			.then(response => {
				const { data } = response;
				this.setState({ venues: data });
				console.log(data);
			})
			.catch(error => {
				console.error(error);
				notifications.show({
					message: "Loading venues failed.",
					variant: "error"
				});
			});
	}

	renderVenues() {
		const { venues } = this.state;
		const { classes } = this.props;

		if (venues === null) {
			return <Typography variant="body1">Loading...</Typography>;
		}

		if (venues) {
			return venues.map(({ id, name, address }) => (
				<Grid key={id} item xs={12} sm={12} lg={12}>
					<Card className={classes.paper}>
						<Typography variant="display1">{name}</Typography>
						<Typography variant="subheading">{address}</Typography>
					</Card>
				</Grid>
			));
		} else {
			return <Typography variant="body1">No venues yet</Typography>;
		}
	}

	render() {
		return (
			<div>
				<Typography variant="display3">Venues</Typography>

				<Grid container spacing={24}>
					{this.renderVenues()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(VenuesView);
