import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	Typography,
	withStyles,
	Grid,
	InputLabel,
	CardMedia
} from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import moment from "moment";

import Button from "../../../../common/Button";
import api from "../../../../../helpers/api";
import notifications from "../../../../../stores/notifications";
import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import SelectGroup from "../../../../common/form/SelectGroup";
import Ticket from "./Ticket";
import FormSubHeading from "../../../../common/FormSubHeading";
import Divider from "../../../../common/Divider";

const styles = theme => ({
	paper: {
		//padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class TicketsCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			tickets: [],
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		const { tickets } = this.state;
		if (tickets.length < 1) {
			this.addTicket();
		}
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const errors = {};
		//TODO validation

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	onSubmit(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		const { tickets } = this.state;
		const { onNext } = this.props;

		console.log(tickets);

		//TODO make api call
		setTimeout(() => {
			onNext();
		}, 1000);
	}

	addTicket() {
		let { tickets } = this.state;
		tickets.push(
			Ticket.Structure({
				startDate: moment(),
				endDate: this.state.eventDate
			})
		);
		this.setState({ tickets });
	}

	render() {
		const { tickets, isSubmitting, errors } = this.state;

		const { classes } = this.props;

		return (
			<Card className={classes.paper}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						<FormSubHeading>Ticketing</FormSubHeading>

						{tickets.map((ticket, index) => {
							//Only add a divider between ticket sections
							const bottomDivider =
								tickets.length - 1 > index ? (
									<Divider style={{ marginBottom: 60, marginTop: 60 }} />
								) : null;
							return (
								<div key={`ticket_${index}`}>
									<Ticket
										data={ticket}
										onChange={ticket => {
											let tickets = [...this.state.tickets];
											tickets.splice(index, 1, ticket);
											this.setState({ tickets });
										}}
										onError={errors => {
											const hasError = Object.keys(errors).length > 0;

											if (hasError) {
												this.ticketErrors[index] = true;
											} else {
												delete this.ticketErrors[index];
											}
										}}
										onDelete={ticket => {
											let tickets = [...this.state.tickets];
											tickets.splice(index, 1);
											this.setState({ tickets }, () => {
												if (this.state.tickets.length === 0) {
													this.addTicket();
												}
											});
										}}
										validateFields={this.validateFields.bind(this)}
									/>

									{bottomDivider}
								</div>
							);
						})}
						{/* {this.renderTickets()} */}
					</CardContent>
					<CardActions>
						<Button
							style={{ marginRight: 10 }}
							onClick={this.addTicket.bind(this)}
						>
							Add new ticket
						</Button>
						&nbsp;
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginRight: 10 }}
							customClassName="callToAction"
						>
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					</CardActions>
				</form>
			</Card>
		);
	}
}

TicketsCard.propTypes = {
	eventId: PropTypes.string,
	onNext: PropTypes.func.isRequired,
	tickets: PropTypes.array,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(TicketsCard);
