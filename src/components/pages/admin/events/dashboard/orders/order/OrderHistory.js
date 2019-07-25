import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import moment from "moment-timezone";

import FanHistoryActivityCard from "../../../../fans/FanHistoryActivityCard";
import user from "../../../../../../../stores/user";
import Bigneon from "../../../../../../../helpers/bigneon";
import notifications from "../../../../../../../stores/notifications";
import Loader from "../../../../../../elements/loaders/Loader";

const styles = theme => ({
	root: {}
});

class OrderHistory extends Component {
	constructor(props) {
		super(props);

		this.state = {
			expandedRowIndex: null,
			profile: null,
			eventStartDisplay: ""
		};
	}

	componentDidMount() {
		const { userId, eventDetails } = this.props;
		this.loadUserProfile(userId);

		const { event_start, venue } = eventDetails;

		const eventStartDisplay = moment
			.utc(event_start)
			.tz(venue.timezone)
			.format("llll");

		this.setState({ eventStartDisplay });
	}

	onExpandChange(index) {
		let expandedRowIndex = null;

		if (index !== this.state.expandedRowIndex) {
			expandedRowIndex = index;
		}

		this.setState({ expandedRowIndex });
	}

	loadUserProfile(user_id) {
		const organization_id = user.currentOrganizationId;

		Bigneon()
			.organizations.fans.read({ user_id, organization_id })
			.then(response => {
				const { attendance_information, ...profile } = response.data;
				this.setState({ profile });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load fan profile."
				});
			});
	}

	render() {
		const { orderHistory, eventDetails } = this.props;
		const { profile, expandedRowIndex, eventStartDisplay } = this.state;

		if (!profile) {
			return <Loader>Loading fan details...</Loader>;
		}

		if (orderHistory.length === 0) {
			return <Typography>No history to display.</Typography>;
		}

		return orderHistory.map((item, index) => {
			const expanded = expandedRowIndex === index;
			return (
				<FanHistoryActivityCard
					profile={profile}
					onExpandChange={() => this.onExpandChange(index)}
					expanded={expanded}
					eventStart={eventStartDisplay}
					key={index}
					item={item}
					event={eventDetails}
				/>
			);
		});
	}
}

OrderHistory.propTypes = {
	classes: PropTypes.object.isRequired,
	orderHistory: PropTypes.array.isRequired,
	userId: PropTypes.string.isRequired,
	eventDetails: PropTypes.object.isRequired
};

export default withStyles(styles)(OrderHistory);
