import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	withStyles,
	Grid,
	CardActions,
	CardContent,
	Card,
	InputAdornment,
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	List,
	ListItem,
	Avatar,
	ListItemText
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import MoneyIcon from "@material-ui/icons/MonetizationOn";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import DialogTransition from "../../../../common/DialogTransition";
import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";
import user from "../../../../../stores/user";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class FeeScheduleCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			id: "",
			name: "",
			ranges: [],
			areYouSureDialogOpen: false,
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		const { organizationId } = this.props;
		Bigneon()
			.organizations.feeSchedules.index({ organization_id: organizationId })
			.then(response => {
				const { data, paging } = response; //@TODO Implement pagination

				const { id, name, ranges, message } = data;

				let formattedRanges = [];
				ranges.forEach(range => {
					formattedRanges.push({ ...range, fee: range.fee_in_cents / 100 });
				});

				if (id) {
					this.setState({ id, name, ranges: formattedRanges });
				} else {
					this.addNewRange();
				}

				if (message) {
					notifications.show({ message });
				}
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Failed to retrieve existing fee schedule found.";

				if (error.response && error.response.status === 404) {
					message = "No existing fee schedule found.";

					//If there is not schedule, add a blank one
					this.addNewRange();
				} else if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "info"
				});
			});
	}

	addNewRange() {
		const { ranges } = this.state;
		ranges.push({ min_price: "", fee: "" });
		this.setState({ ranges });
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { name, ranges } = this.state;

		const errors = {};

		if (name === "") {
			errors.name = "Missing fee schedule name.";
		}

		let rangesErrors = {};
		ranges.forEach(({ min_price, fee }, index) => {
			const missingMinPrice = !min_price && min_price !== 0;
			const missingFee = !fee && fee !== 0;

			if (missingMinPrice || missingFee) {
				rangesErrors[index] = {};

				if (missingMinPrice) {
					rangesErrors[index].min_price = "Missing minimum price.";
				}

				if (missingFee) {
					rangesErrors[index].fee = "Missing fee.";
				}
			}
		});

		if (Object.keys(rangesErrors).length > 0) {
			errors.ranges = rangesErrors;
		}

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

		const { id } = this.state;

		if (id) {
			return this.setState({ areYouSureDialogOpen: true });
		}

		this.saveNewFeeSchedule();
	}

	saveNewFeeSchedule() {
		if (!this.validateFields()) {
			return false;
		}

		const { organizationId } = this.props;

		const { id, name, ranges } = this.state;

		this.setState({ isSubmitting: true });
		const formattedRanges = ranges.map(({ min_price, fee }) => ({
			min_price: Number(min_price),
			fee_in_cents: Number(fee) * 100
		}));

		Bigneon()
			.organizations.feeSchedules.create({
				organization_id: organizationId,
				name,
				ranges: formattedRanges
			})
			.then(response => {
				this.onDialogClose();
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Fee schedule saved.",
					variant: "success"
				});
			})
			.catch(error => {
				this.onDialogClose();
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Saving fee schedule failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	updateMinPrice(index, min_price) {
		this.setState(({ ranges }) => {
			ranges[index].min_price = min_price;
			return { ranges };
		});
	}

	updateFee(index, fee) {
		this.setState(({ ranges }) => {
			ranges[index].fee = fee;
			return { ranges };
		});
	}

	deleteRange(index) {
		this.setState(({ ranges }) => {
			ranges.splice(index,1);
			return { ranges };
		});
	}

	onDialogClose() {
		this.setState({ areYouSureDialogOpen: false });
	}

	renderAreYouSureDialog() {
		const { areYouSureDialogOpen } = this.state;

		const onClose = this.onDialogClose.bind(this);

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				open={areYouSureDialogOpen}
				onClose={onClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
			>
				<DialogTitle id="alert-dialog-title">
					Are you sure you want to create this new fee schedule?
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Adding a new fee schedule archives the previous one but existing
						events will still belong to the fee schedule that was active at the
						time the event was created.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						variant="primary"
						onClick={this.saveNewFeeSchedule.bind(this)}
						autoFocus
					>
						Create new fee schedule
					</Button>
				</DialogActions>
			</Dialog>
		);
	}

	renderForm() {
		const { name, ranges, errors, isSubmitting } = this.state;

		return (
			<div>
				{this.renderAreYouSureDialog()}
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						<InputGroup
							error={errors.name}
							value={name}
							name="name"
							label="Fee schedule name"
							type="text"
							onChange={e => this.setState({ name: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>

						{ranges.map(({ min_price, fee }, index) => (
							<Grid key={index} spacing={24} container alignItems={"center"}>
								<Grid item xs={12} sm={4} md={4} lg={3}>
									<InputGroup
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">$</InputAdornment>
											)
										}}
										error={
											errors.ranges &&
											errors.ranges[index] &&
											errors.ranges[index].min_price
										}
										value={min_price}
										name="min_price"
										label="Minimum price"
										type="number"
										onChange={e => this.updateMinPrice(index, e.target.value)}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>
								<Grid item xs={12} sm={4} md={4} lg={3}>
									<InputGroup
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">$</InputAdornment>
											)
										}}
										error={
											errors.ranges &&
											errors.ranges[index] &&
											errors.ranges[index].fee
										}
										value={fee}
										name="fee"
										label="Fee"
										type="number"
										onChange={e => this.updateFee(index, e.target.value)}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>

								<Grid item xs={1}>
									{index > 0 ? (
										<IconButton
											onClick={e => this.deleteRange(index)}
											color="inherit"
										>
											<DeleteIcon />
										</IconButton>
									) : null}
								</Grid>
							</Grid>
						))}
					</CardContent>
					<CardActions>
						<Button
							style={{ marginRight: 10 }}
							onClick={this.addNewRange.bind(this)}
						>
							Add new range
						</Button>
						<Button
							disabled={isSubmitting}
							type="submit"
							variant="callToAction"
						>
							{isSubmitting ? "Creating..." : "Create new schedule"}
						</Button>
					</CardActions>
				</form>
			</div>
		);
	}

	renderDisplay() {
		const { ranges } = this.state;

		return (
			<CardContent>
				<List>
					{ranges.map(({ min_price, fee }, index) => (
						<ListItem key={index}>
							<Avatar>
								<MoneyIcon />
							</Avatar>
							<ListItemText
								primary={`Minimum price $ ${min_price}`}
								secondary={`Fee $ ${fee}`}
							/>
						</ListItem>
					))}
				</List>
			</CardContent>
		);
	}

	render() {
		const { classes } = this.props;
		const { isAdmin } = user;

		return (
			<Card className={classes.paper}>
				{isAdmin ? this.renderForm() : this.renderDisplay()}
			</Card>
		);
	}
}

FeeScheduleCard.propTypes = {
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(FeeScheduleCard);
