import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";

import Button from "../../../../../../elements/Button";
import Dialog from "../../../../../../elements/Dialog";
import notification from "../../../../../../../stores/notifications";
import Bigneon from "../../../../../../../helpers/bigneon";
import { dollars } from "../../../../../../../helpers/money";
import { Hidden, Typography } from "@material-ui/core";
import {
	fontFamilyDemiBold,
	secondaryHex
} from "../../../../../../../config/theme";
import SelectGroup from "../../../../../../common/form/SelectGroup";
import CheckBox from "../../../../../../elements/form/CheckBox";
import TicketCard from "./TicketCard";
import Divider from "../../../../../../common/Divider";

const styles = theme => ({
	content: {
		[theme.breakpoints.up("sm")]: {
			minWidth: 550
		}
	},
	successContent: {
		[theme.breakpoints.up("sm")]: {
			maxWidth: 400
		}
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "center",
		marginTop: 20
	},
	desktopOrderRow: {
		display: "flex",
		paddingLeft: 20,
		paddingRight: 20
	},
	desktopOrderRowBorder: {
		borderRadius: 6,
		border: "1px solid rgba(222, 226, 232, 0.56)",
		paddingTop: 20,
		paddingBottom: 20,
		marginTop: 10,
		marginBottom: 10
	},
	headingText: {
		color: "#939bad",
		fontSize: 14,
		fontFamily: fontFamilyDemiBold,
		textTransform: "uppercase",
		opacity: 0.7
	},
	desktopOrderDetailsContainer: {
		marginTop: 20
	},
	userText: {
		color: secondaryHex,
		fontFamily: fontFamilyDemiBold
	},
	subText: {
		color: "#8b94a7",
		fontSize: 14
	},
	formLabelText: {
		fontFamily: fontFamilyDemiBold,
		marginBottom: 8
	},
	refundAmountBox: {
		backgroundColor: "#f6f7f9",
		padding: 20,
		paddingBottom: 12,
		borderRadius: 8
	},
	refundAmountRow: {
		display: "flex",
		justifyContent: "space-between",
		marginBottom: 8
	},
	valueText: {
		fontFamily: fontFamilyDemiBold
	},
	valueTextActive: {
		color: secondaryHex
	},
	orderTotalRow: {
		backgroundColor: "#f6f7f9",
		display: "flex",
		justifyContent: "space-between",
		padding: 16,
		borderRadius: 8
	},
	orderTotalRowLabel: {
		fontFamily: fontFamilyDemiBold,
		fontSize: 14
	},
	orderTotalRowValue: {
		fontFamily: fontFamilyDemiBold,
		fontSize: 16,
		color: secondaryHex,
		textAlign: "right"
	},
	successDetailsRow: {
		marginTop: 20,
		display: "flex",
		justifyContent: "space-between"
	},
	userDetailsText: {
		fontFamily: fontFamilyDemiBold,
		color: secondaryHex
	},
	successRefundType: {
		color: "#8b94a7",
		fontSize: 14,
		textTransform: "uppercase"
	}
});

const refundReasons = [
	{
		value: "empty",
		label: "Select a reason",
		disabled: true
	},
	{
		value: "cancellation",
		label: "Cancellation/Postponement"
	},
	{
		value: "exchange",
		label: "Exchange/Upgrade"
	},
	{
		value: "overcart",
		label: "Overcart"
	},
	{
		value: "unable-to-attend",
		label: "Unable to attend"
	},
	{
		value: "fraud",
		label: "Fraud/Chargeback"
	},
	{
		value: "snad",
		label: "SNAD (significantly not as described)"
	},
	{
		value: "price",
		label: "Price discrepancy"
	},
	{
		value: "other",
		label: "Other"
	}
];

class RefundDialog extends Component {
	constructor(props) {
		super(props);

		this.defaultState = {
			reasonVal: "empty",
			selectedRefundType: "fullRefund",
			isRefunding: false,
			selectedRefundOrderItem: {},
			refundAmountInCents: 0,
			refundSuccessDetails: null
		};

		this.state = this.defaultState;

		this.onClose = this.onClose.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		const { selectedRefundOrderItem } = props;

		return { selectedRefundOrderItem };
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.open === false && this.props.open === true) {
			this.setRefundAmount();
		}
	}

	toggleRefundOrderItem(index) {
		this.setState(({ selectedRefundOrderItem }) => {
			selectedRefundOrderItem[index] = !selectedRefundOrderItem[index];
			return { selectedRefundOrderItem };
		}, this.setRefundAmount.bind(this));
	}

	setRefundAmount() {
		const { items } = this.props;
		const { selectedRefundOrderItem } = this.state;

		let refundAmountInCents = 0;
		if (items) {
			items.forEach((item, index) => {
				if (selectedRefundOrderItem && selectedRefundOrderItem[index]) {
					const { total_price_in_cents } = item;
					refundAmountInCents += total_price_in_cents;
				}
			});
		}
		this.setState({ refundAmountInCents });
	}

	onClose() {
		const { onClose } = this.props;
		const { refundSuccessDetails } = this.state;
		onClose();

		if (refundSuccessDetails) {
			//Reset the dialog content just after it's finished hiding so the user doesn't notice
			setTimeout(() => this.setState(this.defaultState), 500);
		}
	}

	refund() {
		const { order, items: itemDetails, type } = this.props;

		const { id } = order;

		const {
			reasonVal,
			selectedRefundType,
			selectedRefundOrderItem
		} = this.state;

		//TODO use selectedRefundType to adjust which items should be refunded for type===full

		const items = [];

		if (itemDetails) {
			itemDetails.forEach((item, index) => {
				const { order_item_id, ticket_instance_id, refundable, ...rest } = item;
				if (refundable) {
					if (type === "full" || selectedRefundOrderItem[index]) {
						items.push({
							order_item_id,
							ticket_instance_id
						});
					}
				}
			});
		}

		this.setState({ isRefunding: true });
		const reason = refundReasons.find(function(refund) {
			return refund.value === reasonVal;
		}).label;
		Bigneon()
			.orders.refund({
				id,
				items,
				reason
			})
			.then(response => {
				const { amount_refunded, refund_breakdown } = response.data;

				this.props.onSuccess();
				this.setState({
					refundSuccessDetails: { amount_refunded, refund_breakdown }
				});
			})
			.catch(error => {
				notification.showFromErrorResponse({
					error,
					defaultMessage: "Refund failed."
				});
			})
			.finally(() => {
				this.setState({
					mobileOptionsControlOpen: false,
					isRefunding: false
				});
			});
	}

	onReasonChange(e) {
		const reasonVal = e.target.value;

		this.setState({ reasonVal });
	}

	refundValues(order) {
		let faceOnlyInCents = 0;
		let feesOnlyInCents = 0;

		const { total_in_cents, items } = order;
		const { selectedRefundType } = this.state;

		items.forEach(item => {
			const { item_type, unit_price_in_cents, quantity } = item;

			switch (item_type) {
				case "PerUnitFees":
				case "EventFees":
				case "CreditCardFees":
					feesOnlyInCents += unit_price_in_cents * quantity;
					break;
				case "Tickets":
					faceOnlyInCents += unit_price_in_cents * quantity;
			}
		});

		//TODO put other options back
		return {
			// faceOnly: {
			// 	label: "Ticket face only",
			// 	cents: faceOnlyInCents
			// },
			// feesOnly: { label: "Fees only", cents: feesOnlyInCents },
			fullRefund: {
				label: "Full refund",
				cents: total_in_cents
			}
		};
	}

	renderDesktopOrderDetails() {
		const { classes, order, items } = this.props;

		const { order_number, user, total_in_cents } = order;

		const { first_name, last_name, email, id: userId } = user;

		const colStyles = [{ flex: 2 }, { flex: 4 }, { flex: 2 }, { flex: 1 }];
		const headings = ["Order #", "Purchaser", "Code", "Total"];

		let displayCode = "-";
		let displayCodeType = "";
		items.forEach(({ code, code_type }) => {
			if (code) {
				displayCode = code;
			}

			if (code_type) {
				displayCodeType = code_type;
			}
		});

		return (
			<div className={classes.desktopOrderDetailsContainer}>
				<div className={classes.desktopOrderRow}>
					{headings.map((heading, index) => (
						<Typography
							key={index}
							style={colStyles[index]}
							className={classes.headingText}
						>
							{heading}
						</Typography>
					))}
				</div>
				<div
					className={classnames({
						[classes.desktopOrderRow]: true,
						[classes.desktopOrderRowBorder]: true
					})}
				>
					<Typography style={colStyles[0]}>{order_number}</Typography>
					<div style={colStyles[1]}>
						<Typography className={classes.userText}>
							{first_name} {last_name}
						</Typography>
						<Typography className={classes.subText}>{email}</Typography>
					</div>
					<div style={colStyles[2]}>
						<Typography>{displayCode}</Typography>
						<Typography className={classes.subText}>
							{displayCodeType}
						</Typography>
					</div>
					<Typography style={colStyles[3]}>
						{dollars(total_in_cents)}
					</Typography>
				</div>
			</div>
		);
	}

	renderMobileOrderDetails() {
		return <div>{""}</div>;
	}

	renderDesktopOrderItems() {
		const colStyles = [
			{ flex: 3 },
			{ flex: 3 },
			{ flex: 4 },
			{ flex: 2 },
			{ flex: 1 },
			{ flex: 2 },
			{ flex: 2 }
		];

		const { items } = this.props;
		const { selectedRefundOrderItem } = this.state;

		return items.map((item, index) => (
			<TicketCard
				shortened
				onCheck={() => this.toggleRefundOrderItem(index)}
				isChecked={!!selectedRefundOrderItem[index]}
				key={index}
				colStyles={colStyles}
				{...item}
			/>
		));
	}

	renderMobileOrderItems() {
		const colStyles = [
			{ flex: 3 },
			{ flex: 3 },
			{ flex: 4 },
			{ flex: 2 },
			{ flex: 1 },
			{ flex: 2 },
			{ flex: 2 }
		];

		const { items } = this.props;
		const { selectedRefundOrderItem } = this.state;

		return null;
		//TODO when designs are found
		// return items.map((item, index) => (
		// 	<TicketCard
		// 		shortened
		// 		onCheck={() => this.toggleRefundOrderItem(index)}
		// 		isChecked={!!selectedRefundOrderItem[index]}
		// 		key={index}
		// 		colStyles={colStyles}
		// 		{...item}
		// 	/>
		// ));
	}

	renderSuccessContent() {
		const { classes, type, order } = this.props;
		const { refundSuccessDetails } = this.state;
		const { amount_refunded } = refundSuccessDetails;

		let userDetails = "";

		if (order && order.user) {
			const { first_name, last_name, email } = order.user;

			userDetails = `${first_name} ${last_name} (${email})`;
		}

		const refundTypeText = type === "full" ? "full refund" : "partial refund";

		return (
			<div className={classes.successContent}>
				<div className={classes.successDetailsRow}>
					<Typography className={classes.successRefundType}>
						{refundTypeText}
					</Typography>

					<Typography className={classes.orderTotalRowValue}>
						{dollars(amount_refunded)}
					</Typography>
				</div>

				<Divider/>

				<div style={{ textAlign: "center", marginTop: 20 }}>
					<Typography>
						The {refundTypeText} was sent to purchaser
						{userDetails ? (
							<span>
								{" "}
								- <span className={classes.userDetailsText}>{userDetails}</span>
							</span>
						) : null}
					</Typography>

					<Button
						variant={"secondary"}
						style={{ marginTop: 20 }}
						onClick={this.onClose}
					>
						Got it
					</Button>
				</div>
			</div>
		);
	}

	render() {
		const { classes, open, order, type } = this.props;
		const {
			reasonVal,
			selectedRefundType,
			isRefunding,
			refundAmountInCents,
			refundSuccessDetails
		} = this.state;

		const refundValues = this.refundValues(order);

		let title = `Issue ${type === "full" ? "full " : ""}refund`;
		if (refundSuccessDetails) {
			title = "Refund successful";
		}

		return (
			<Dialog
				iconUrl={"/icons/tickets-white.svg"}
				open={open}
				title={title}
				onClose={this.onClose}
			>
				{refundSuccessDetails ? (
					this.renderSuccessContent()
				) : (
					<div className={classes.content}>
						{type !== "full" ? (
							<Typography>
								In order to issue a refund, select the refund amount and refund
								method below. The refund will be transferred to the ticket
								purchaser.
							</Typography>
						) : null}

						{type === "full" ? (
							<React.Fragment>
								<Hidden smDown>{this.renderDesktopOrderDetails()}</Hidden>
								<Hidden mdUp>{this.renderMobileOrderDetails()}</Hidden>
							</React.Fragment>
						) : null}

						{type === "items" ? (
							<React.Fragment>
								<Hidden smDown>{this.renderDesktopOrderItems()}</Hidden>
								<Hidden mdUp>{this.renderMobileOrderItems()}</Hidden>
							</React.Fragment>
						) : null}

						<br/>
						<Typography className={classes.formLabelText}>
							Select refund reason
						</Typography>
						<SelectGroup
							name={"reason"}
							value={reasonVal}
							onChange={this.onReasonChange.bind(this)}
							items={refundReasons}
						/>

						{type === "full" ? (
							<React.Fragment>
								<Typography className={classes.formLabelText}>
									Select refund amount
								</Typography>
								<div className={classes.refundAmountBox}>
									{Object.keys(refundValues).map(key => {
										const { label, cents } = refundValues[key];
										const active = selectedRefundType === key;

										return (
											<div key={key} className={classes.refundAmountRow}>
												<CheckBox
													active={active}
													onClick={() =>
														this.setState({ selectedRefundType: key })
													}
												>
													{label}
												</CheckBox>
												<Typography
													className={classnames({
														[classes.valueText]: true,
														[classes.valueTextActive]: active
													})}
												>
													{dollars(cents)}
												</Typography>
											</div>
										);
									})}
								</div>
							</React.Fragment>
						) : null}

						{type === "items" ? (
							<div className={classes.orderTotalRow}>
								<Typography className={classes.orderTotalRowLabel}>
									Refund total
								</Typography>
								<Typography className={classes.orderTotalRowValue}>
									{dollars(refundAmountInCents)}
								</Typography>
							</div>
						) : null}

						<div className={classes.actionButtonsContainer}>
							<Button
								style={{ marginRight: 5, width: 150 }}
								variant="default"
								onClick={this.onClose}
							>
								Cancel
							</Button>
							<Button
								style={{ marginLeft: 5, width: 150 }}
								variant="secondary"
								disabled={isRefunding}
								onClick={this.refund.bind(this)}
							>
								{isRefunding ? "Refunding..." : "Confirm"}
							</Button>
						</div>
					</div>
				)}
			</Dialog>
		);
	}
}

RefundDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired,
	items: PropTypes.array.isRequired,
	order: PropTypes.object.isRequired,
	selectedRefundOrderItem: PropTypes.object,
	type: PropTypes.oneOf(["full", "items"])
};

export default withStyles(styles)(RefundDialog);
